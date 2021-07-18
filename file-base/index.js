const Koa = require('koa')
const static = require('koa-static-cache')
const { resolve} = require('path')
const Router = require('@koa/router');
const proxy = require('koa-proxy');
const mount  = require('koa-mount')

const app = new Koa();
const router = new Router();

const proxyOptions = {
  host: 'http://127.0.0.1:7833',
}

app.use(mount('/api', proxy(proxyOptions)))
app.use(mount('/rsdk', static(resolve(__dirname, './dist/rsdk'), {
  gzip: true
})))
.use(static(resolve(__dirname, './storage')))
.use(router.routes())
.use(router.allowedMethods())

app.listen(7832);