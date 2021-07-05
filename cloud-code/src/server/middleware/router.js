const path = require('path')
const flatCache = require('flat-cache')
const router = require('../router')
const dbCaches = {}

module.exports = async (ctx, req, res)  => {
  const notFound = () => {
    res.writeHead(404)
    res.end()
  }
  const match = router({
    get: (routeInfo) => (['get', ...routeInfo]),
    post: (routeInfo) => (['post', ...routeInfo]),
    put: (routeInfo) => (['put', ...routeInfo]),
    delete: (routeInfo) => (['delete', ...routeInfo]),
    options: (routeInfo) => (['options', ...routeInfo]),
  }).some(item => {
    const [targetMethods, routerPattern, fn] = item
    const method = req.method.toLowerCase()
    const pattern = new RegExp(`^${routerPattern.replace(/\/\:[^\\/]+/g, '\/([^\/]+)').replace(/\//g, '\\/')}(\\?.*)?$`)
    const result = pattern.test(req.url) && targetMethods === method && fn instanceof Function

    if(result) {
      const cors = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "DELETE,PUT,POST,GET,OPTIONS"
      }
      
      ctx.success = data => {
        res.writeHead(200, { 
          ...cors,
          'Content-Type': 'application/json; charset=utf-8'
        })
        res.end(JSON.stringify({ status: 0, ...data }))
      }
      ctx.error = msg => {
        res.writeHead(200, { 
          ...cors,
          'Content-Type': 'application/json; charset=utf-8'
        })
        res.end(JSON.stringify({ status: 1, errorMsg: msg }))
      }
  
      ctx.notFound = notFound

      const patternKeys = routerPattern.match(/(?<=:)[^\/]+/g) || []
      const paramsValues = pattern.exec(req.url.split('?')[0]).slice(1)
      ctx.params = patternKeys.length ? patternKeys.reduce((obj, key, i) => ({ ...obj, [key]: paramsValues[i]}), {}) : {};
      (async () => {
        ctx.body = {}
      if(['post', 'put'].includes(method)) {
        let str = ''
        for await (const chunk of req) str += chunk.toString()
        try {
          ctx.body = JSON.parse(str)
        } catch(e) {
          console.log(str)
          ctx.error('服务异常')
          console.error(e)
          return true 
        }
      }
      ctx.query = (req.url.split('?')[1] || '').split('&').reduce((obj, str) => ({ ...obj, [str.split('=')[0]]: str.split('=')[1]}), {})
      ctx.db = new Proxy({}, { get(_, dbName) {
        const db = dbCaches[dbName] ||  (dbCaches[dbName] = flatCache.load(dbName, path.resolve(__dirname, '../../../storage')))
        return {
          all: () => db.all(),
          get: (key) => db.getKey(key),
          set: (key, value) => {
            db.setKey(key, value);
            db.save(true); 
          },
          delete: (key) => {
            db.removeKey(key);
            db.save(true); 
          },
          
        }
      }})

      
      try {
        fn(ctx, req, res)
      } catch(e) {
        console.error(e)
        ctx.error(e.message || e)
      }

      })();
    }
    return result
  })
  if(!match) {
    notFound()
  }

}
