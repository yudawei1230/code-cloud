const http = require('http')
const useMiddleware = require('./middleware')
const routeMiddleware = require('./middleware/router')

http.createServer((req, res) => {
  const registryMiddleware = useMiddleware(req, res)
  try {

  registryMiddleware(routeMiddleware)
  
  } catch(e) {
    console.error(e)
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8'})
    res.end(JSON.stringify({ status: 1, errorMsg: '服务异常' }))
  }
}).listen(7833)