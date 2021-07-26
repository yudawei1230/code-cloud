const path = require("path");
const webpack = require("webpack");
const resolve = (p) => path.resolve(__dirname, p);

module.exports = {
    entry: {
      sdk: resolve("./src/sdk/sdk.js"),
    },
    output: {
      path: resolve("../file-base/dist/rsdk"),
    },
    devServer: {
      port: 7831,
      disableHostCheck: true,
      compress: true,
      headers: {
        // 保证子应用的资源支持跨域，在线上后需要保证子应用的资源在主应用的环境中加载不会存在跨域问题（**也需要限制范围注意安全问题**）
        'Access-Control-Allow-Origin': '*',
      },
    },
    target: "web",
    mode: "development",
    devtool: "source-map",
    module: {
      rules: [
        {
          test: /\.js?$/, // jsx/js文件的正则
          exclude: /node_modules/, // 排除 node_modules 文件夹
          use: {
            // loader 是 babel
            loader: "babel-loader",
            options: {
              // babel 转义的配置选项
              babelrc: false,
              presets: [
                // 添加 preset-react
                [require.resolve("@babel/preset-env")],
              ],
            },
          },
        },
      ],
    },
    plugins: [
      new webpack.DefinePlugin({
          'process.env.npm_package_name': JSON.stringify(process.env.npm_package_name)
      })
    ],
  }
