
const path = require('path')
const resolve = (p) => path.resolve(__dirname, p);

module.exports = {
  entry: {
    console: resolve('./index.js')
  },
  output: {
    path: resolve("../file-base/dist/rsdk"),
  },
}