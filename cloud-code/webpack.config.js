const path = require("path");
const resolve = (p) => path.resolve(__dirname, p);
const packageName = process.env.npm_package_name

module.exports = {
    entry: {
      main: resolve("./src/sdk/index.js"),
    },
    output: {
      // path: resolve("../file-base/dist/rsdk"),
      library: `${packageName}-[name]`,
      libraryTarget: 'umd',
      jsonpFunction: `webpackJsonp_${packageName}`,
    },
    resolve: {
      alias: {
        requirejs: "requirejs/require.js",
      },
    },
    devServer: {
      port: 7832,
      contentBase: resolve('public'),
      injectClient: false,
      proxy: {
        "/rsdk": {
          target: "http://localhost:7832",
          pathRewrite: { "^/rsdk": "" },
        },
        "/sdk.js": {
          target: "http://localhost:7831",
        },
      },
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
        {
          test: /requirejs/,
          use: {
            loader: "exports-loader",
            options: {
              define: true,
              require: true,
              requirejs: true,
            },
          },
        },
      ],
    },
  }
