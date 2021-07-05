const Koa = require('koa')
const static = require('koa-static-cache')
const { resolve} = require('path')
const Router = require('@koa/router');
const mount  = require('koa-mount')

const app = new Koa();
const router = new Router();


app.use(mount('/rsdk', static(resolve(__dirname, './dist/rsdk'))))
.use(static(resolve(__dirname, './storage')))
.use(router.routes())
.use(router.allowedMethods());

app.listen(7832);