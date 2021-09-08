import { HttpClient } from "../http-client";
import { AxiosRequestConfig } from "axios";
// import { message } from "antd";

/**
 * 服务器基类
 *
 * @author 张卓诚
 * @export
 * @class BaseServer
 */
export class BaseServer {
  /**
   * 网络客户端 此时去掉最外层的data
   *
   * @protected
   * @memberof BaseServer
   */
  protected http = new HttpClient();
  constructor(public domian: string) {

  }

  /**
   * get
   *
   * @author 张卓诚
   * @template T
   * @param {string} url
   * @param {AxiosRequestConfig} [setting]
   * @returns
   * @memberof BaseServer
   */
  public async get<T>(url: string, setting?: AxiosRequestConfig) {
    return this.http.get<T>(url, { ...setting, baseURL: this.domian }).then(res => res)
      .catch(this.catch401);
  }

  /**
   * post
   *
   * @author 张卓诚
   * @template T
   * @template P
   * @param {string} url
   * @param {P} [data]
   * @param {AxiosRequestConfig} [setting]
   * @returns
   * @memberof BaseServer
   */
  public async post<T, P = T>(url: string, data?: P, setting?: AxiosRequestConfig) {
    return this.http.post<T, P>(url, data, { ...setting, baseURL: this.domian }).then(res => res.data)
      .catch(this.catch401);
  }

  /**
   * put
   *
   * @author 张卓诚
   * @template T
   * @template P
   * @param {string} url
   * @param {P} [data]
   * @param {AxiosRequestConfig} [setting]
   * @returns
   * @memberof BaseServer
   */
  public async put<T, P = T>(url: string, data?: P, setting?: AxiosRequestConfig) {
    return this.http.put<T, P>(url, data, { ...setting, baseURL: this.domian }).then(res => res.data)
      .catch(this.catch401);
  }

  /**
   * delete
   *
   * @author 张卓诚
   * @param {string} url
   * @param {AxiosRequestConfig} [setting]
   * @returns
   * @memberof BaseServer
   */
  public async delete(url: string, setting?: AxiosRequestConfig) {
    return this.http.delete(url, { ...setting, baseURL: this.domian }).then(res => res.data)
      .catch(this.catch401);
  }

  /**
   * 获取token
   *
   * @author 张卓诚
   * @param {string} url
   * @param {AxiosRequestConfig} [setting]
   * @returns
   * @memberof BaseServer
   */
  public getToken() {
    const token = localStorage.getItem("token");
    return token;
  }
  /**
   *  保存token
   *
   * @author 张卓诚
   * @param {string} url
   * @param {AxiosRequestConfig} [setting]
   * @returns
   * @memberof BaseServer
   */
  public saveToken(token: string) {
    localStorage.setItem("token", token);
  }

  /**
   *  获取Context
   *
   * @author 张卓诚
   * @param {string} url
   * @param {AxiosRequestConfig} [setting]
   * @returns
   * @memberof BaseServer
   */
  public getContextLogout() {
    // @ts-ignore
    return window.logout;
  }

  /**
   *  存储Context logout
   *
   * @author 张卓诚
   * @param {string} url
   * @param {AxiosRequestConfig} [setting]
   * @returns
   * @memberof BaseServer
   */
  // tslint:disable-next-line: ban-types
  public saveContextLogout(logout: Function) {
    // @ts-ignore
    window.logout = logout;
  }

  /** 存储用户的villageCode */
  public saveVillageCode(code: string) {
    // @ts-ignore
    localStorage.setItem("villageCode", code);
  }
  /** 获取用户的villageCode */
  public getVillageCode() {
    // @ts-ignore
    return localStorage.getItem("villageCode");
  }

  /** 401错误处理 */
  catch401 = (err: any) => {
    if (err.response.status === 401) {
      this.getContextLogout()();
    } else {
      // console.log("messs", err.response.data.message);
      // message.error(err.response.data.message);
    }
    throw err.response.data.message;
  }
}
