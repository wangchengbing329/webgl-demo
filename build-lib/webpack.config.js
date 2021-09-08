const path = require("path");
const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
module.exports = {
  entry: {
    path: path.join(__dirname, "../src/index.tsx"),
  },
  output: {
    path: path.join(__dirname, "../build"),
    filename: "./[name]/bundle_[chunkhash:8].js",
  },
  resolve: {
    extensions:['.ts','.tsx','.js', ".jsx"],
    alias: {
      "@components": path.join(__dirname, "../src/components"),
      "@containers": path.join(__dirname, "../src/containers"),
      "@models": path.join(__dirname, "../src/models"),
      "@controller": path.join(__dirname, "../src/network/controller"),
    }
  },
  devtool:process.env.NODE_ENV == 'production'? false: 'inline-source-map',
  devServer: {
    contentBase: './build',
    stats: 'errors-only',
    compress:false,
    host:'localhost',
    port:8089,
    hot: true
  },
  module: {
    rules: [
      {
        test: /.tsx?$/,
        use: [
          {
            loader: "ts-loader",
          }
        ],
        exclude: /node_modules/
      }, 
      {
        test: /\.(png|svg|jpg|gif|ico)$/,
        use: {
            loader: 'file-loader',
            options: {
                name:'assets/[name].[ext]',
            }
        }
      },
      {
        test: /.scss$|.css$/,
        include: [path.join(__dirname, "../src")],
        use: [
          "style-loader",
          "css-loader",
          "sass-loader",
        ]
      },
      // {
      //   test: /\.(png|svg|jpg|gif)$/,
      //   use: {
      //       loader: 'url-loader',
      //       options: {
      //           name:'assets/[name].[ext]',
      //           limit:2048
      //       }
      //   }
      // },
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: "./public/index.html",
      manifest: "./public/manifest.json"
    }),
    new CleanWebpackPlugin({
      cleanOnceBeforeBuildPatterns:['./build']
    }),
    new webpack.HotModuleReplacementPlugin(),
  ]
}