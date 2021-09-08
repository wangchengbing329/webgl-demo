import logo from './logo.svg';
import './App.css';
import React, { ChangeEventHandler } from "react";
import commonController from './network/controller/common.controller';
import SparkMD5 from "spark-md5";
import { resolve } from 'path/win32';
import { rejects } from 'assert';
import axios from "axios";
import * as THREE from "three";
import { OrbitControls } from "@three-ts/orbit-controls";
const defaultState = {
  remainChunks: [], // 剩余切片
  isStop: false, // 暂停上传控制
  precent: 0, // 上传百分比
  uploadedChunkSize: 0, // 已完成上传的切片数
  chunkSize: 2 * 1024 * 1024 // 切片大小
}
class App extends React.Component<any,typeof defaultState> {
  el: any;
  constructor(props:any) {
    super(props)
    this.state = {
      ...defaultState,
    }
  }
  changeInput = (e:any) => {
    // const b = e.target as any;
    // console.log(b.files, "input-value");
    let formData = new FormData();
    formData.append("file",e);

    commonController.getEpidemicInfo(formData).then(res => {
      console.log(res, "uploadFile");
    })
  }

  uploadBigFile = async (e: any) => {
    const file = e.target.files[0];
    let cur = 0;
    let uploadedChunkSize = 0;
    const { precent, chunkSize } = this.state;
    let remainChunks = [];
    // const chunkSize = 2 * 1024 * 1024 ;
    if (file.size < chunkSize * 5) {
      this.changeInput(file);
    } else {
      const chunkInfo:any = await this.cutBlob(file);
      remainChunks = chunkInfo.chunkArr;
      this.setState({ remainChunks });
      let fileInfo = chunkInfo.fileInfo;
      console.log(remainChunks, fileInfo, "fileinfo ------>")

      this.mergeRequest(fileInfo);
    }
  }
  mergeRequest = (fileInfo:any) => {
    const { remainChunks, } = this.state;
    const chunks = remainChunks;
    // const fileInfo = this.fileInfo
    // this.chunkMerge = (fileInfo)
    this.sendRequest(chunks, 6, () => {
      // 请求合并
      this.chunkMerge(fileInfo)
      })

  }

  chunkMerge = async (fileInfo: any) => {
    // axios({
    //   method: "POST",
    //   url: "http://localhost:8000/api/v1/test",
    //   data: fileInfo
    // }).then(res => {
    //   console.log(res)
    // })
    const data = await commonController.merChunk(fileInfo);
    console.log(data, "data---->")
  }

  sendFile = (file: File) => {
    let formData = new FormData();
    formData.append("file",file)
  }
  cutBlob = (file: File) => {
    const chunkArr:any[] = [];
    const chunkSize = 2 * 1024 * 1024 ;
    //@ts-ignore
    const blobSlice = File.prototype.slice || File.prototype?.mozSlice || File.prototype?.webkitSlice;
    const spark = new SparkMD5.ArrayBuffer();
    const chunkNums = Math.ceil(file.size / chunkSize);
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsArrayBuffer(file);
      reader.addEventListener("loadend", () => {
        const content = reader.result as ArrayBuffer;
        spark.append(content);
        const  hash = spark.end();
        let startIndex = 0;
        let endIndex = 0;
        let contentItem: Blob;
        for(let i = 0; i < chunkNums; i++) {
          startIndex = i * chunkSize
          endIndex = startIndex + chunkSize
          endIndex > file.size && (endIndex = file.size)
      
          contentItem = blobSlice.call(file, startIndex, endIndex)
      
          chunkArr.push({
            index: i,
            hash,
            total: chunkNums,
            name: file.name,
            size: file.size,
            chunk: contentItem
          })
          resolve({
            chunkArr,
            fileInfo: {
              hash,
              name: file.name,
              size: file.size
            }
          })
        }
      })
      reader.addEventListener('error', function _error(err) {
        reject(err)
      })
    })
  }

  sendRequest = (arr: Array<any>, max: number = 6, callBack: Function ) => {
    let i = 0;
    let fetchArr:any[] = [];
    let toFetch:() => any = () => {
      if (this.state.isStop) {
       return Promise.reject("暂停上传")
      }
      if (!arr.length) {
        return Promise.resolve();
      }
      const chunkItem:any = arr.shift();
      const it = this.sendChunk(chunkItem)
      console.log("fetch snipp")

      it.then(() => fetchArr.splice(fetchArr.indexOf(it), 1),err => {
        this.setState({ isStop: true})
        //@ts-ignore
        arr.unshift(chunkItem)
        Promise.reject(err)
      })
      fetchArr.push(it)

      let p = Promise.resolve()
      if (fetchArr.length >= max) {
        p = Promise.race(fetchArr)
      }
      return p.then(() => toFetch())
    }
    toFetch().then(() => {
      Promise.all(fetchArr).then(() => {
      callBack()
      })
      }, (err:any) => {
      console.log(err)
      })
  } 
  sendChunk = (item: any) => {
    let formdata = new FormData()
    formdata.append("file", item.chunk)
    formdata.append("hash", item.hash)
    formdata.append("index", item.index)
    formdata.append("name", item.name)
    return axios({
      url: "http://localhost:8000/api/v1/upload/snippet",
      method: "POST",
      data: formdata,
      headers: { "Content-Type": "multipart/form-data" },
      onUploadProgress: e => {
        const { loaded, total } = e;
        const { uploadedChunkSize } = this.state;
        let tempSize = loaded < total ? uploadedChunkSize :  uploadedChunkSize + loaded;
        if (uploadedChunkSize > item.size) {
          tempSize = item.size;
        }
        this.setState({
          uploadedChunkSize: tempSize,
          precent: Number((uploadedChunkSize / item.size).toFixed(2)) * 1000 / 2 
        })
      }
    })
  } 
  test = async () => {
    const data = await axios({
      url: "http://127.0.0.1:8000/api/v1/test",
      method: "POST",
      // headers: { "Content-Type": "application/json" },
      data: {
        type: "1",
        add: true,
      }
    })
    console.log(data, "data----->")
  }

  componentDidMount() {
    this.renderBox();
    // setInterval( () => {this.renderBox()}, 20)
    // this.renderAnimate();
  }
  render() {
    return (
      <div className="App">
        {/* <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <p>
            Edit <code>src/App.js</code> and save to reload.
          </p>
          <a
            className="App-link"
            href="https://reactjs.org"
            target="_blank"
            rel="noopener noreferrer"
          >
            Learn React
          </a>
        </header> */}
        {/* <input type="file" onChange={this.uploadBigFile}/>
        <button onClick={this.test} >上传</button> */}
        <div id="box" ref={ ref => this.el = ref }></div>
      </div>
    );
  }

  renderBox = () => {
    const scence = new THREE.Scene();
    const geometry = new THREE.SphereGeometry(60,40,40);
    //长方体 参数：长，宽，高
    // var geometry = new THREE.BoxGeometry(100, 100, 100);
    // // 球体 参数：半径60  经纬度细分数40,40
    // var geometry = new THREE.SphereGeometry(60, 40, 40);
    // // 圆柱  参数：圆柱面顶部、底部直径50,50   高度100  圆周分段数
    // var geometry = new THREE.CylinderGeometry( 50, 50, 100, 25 );
    // // 正八面体
    // var geometry = new THREE.OctahedronGeometry(50);
    // // 正十二面体
    // var geometry = new THREE.DodecahedronGeometry(50);
    // // 正二十面体
    var geometry2 = new THREE.IcosahedronGeometry(50);
    const geometry1 = new THREE.BoxGeometry(100, 100, 100);
    const material = new THREE.MeshLambertMaterial({
      color:"0x0000ff",
      opacity:0.5,
      transparent:true
    });
    const material1 = new THREE.MeshLambertMaterial({
      color:"0x0000ff",
      // specular:0x4488ee,
      emissive:0x4488ee,
      emissiveIntensity:1,
      // shininess:12
    });
    const material2 = new THREE.MeshLambertMaterial({
      color:"0x0000ff"
    });
    const mesh = new THREE.Mesh(geometry, material);
    const mesh1 = new THREE.Mesh(geometry1, material1);
    mesh1.translateY(120);
    const mesh2 = new THREE.Mesh(geometry2, material2);
    mesh2.translateX(120);
    scence.add(mesh);
    scence.add(mesh1);  
    scence.add(mesh2);
    const point = new THREE.PointLight(0x0000ff);
    point.position.set(400,200,300);
    scence.add(point);
    const width = window.innerWidth;
    const height = window.innerHeight;
    const k = width / height;
    const s = 300;
    const camera = new THREE.OrthographicCamera(-s * k, s * k, s, -s, 1, 1000);
    camera.position.set(200,300,200);
    camera.lookAt(scence.position);
    const renderer = new THREE.WebGL1Renderer();
    renderer.setSize(width, height);
    renderer.setClearColor(0xb9d3ff, 1);
    console.log(this.el,"this.el")
    if (this.el.childElementCount === 0) {
      this.el.appendChild(renderer.domElement);
    }
    const axisHelper = new THREE.AxesHelper(250);
    scence.add(axisHelper);
    let t0 = new Date() as unknown as number;
    function renderAnimate() {
      let t1 = new Date() as unknown as number;
      let t = t1 - t0;
      t0 = t1;
      requestAnimationFrame(renderAnimate)
      renderer.render(scence, camera);
      mesh.rotateY(0.01);
      mesh1.rotateZ(0.01)
      mesh2.rotateX(0.01)
    }
    renderAnimate();
    const controls = new OrbitControls(camera, renderer.domElement)
    
    // renderer.render(scence, camera);
    // mesh.rotateY(0.01);
    // requestAnimationFrame(this.renderBox)
    // return { renderer, mesh, scence, camera };
  }

  // renderAnimate = () => {
  //   const { renderer, mesh, scence, camera } = this.renderBox(); 
  //   renderer.render(scence, camera);
  //   mesh.rotateY(0.01);
  //   requestAnimationFrame(this.renderAnimate)
  // }

  
}

export default App;
