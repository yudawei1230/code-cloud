const { v4: idGen } = require('uuid');

const { MODULE_TYPE } = require('../../config/const')


exports.create = (ctx) => {
  const { name, code = '', distCode, type  } = ctx.body;
  
  if(ctx.db.modules.get(name)) {
    return ctx.error('已存在该模块')
  }
  const id = idGen()
  const time = Date.now()
  ctx.db.modules.set(name, { type: MODULE_TYPE.FILE, fileId: id })
  ctx.db.file.set(id, { type, code, distCode, createTime: time, updateTime: time })

  ctx.success({ id, name , createTime: time, updateTime: time, type  })
} 

exports.update = (ctx) => {
  const { name, deps = [], ...rest  } = ctx.body;
  const moduleInfo = ctx.db.modules.get(name)
  if(!moduleInfo) {
    return ctx.error('不存在该模块')
  }
  const fileInfo = ctx.db.file.get(moduleInfo.fileId)
  if(!fileInfo) {
    return ctx.error('该模块文件信息查询失败')
  }
  const time = Date.now()
  ctx.db.modules.set(name, { ...moduleInfo, deps })
  ctx.db.file.set(moduleInfo.fileId, { ...rest,  updateTime: time, createTime: fileInfo.createTime  })

  ctx.success()
} 

exports.delete = (ctx) => {
  const { name } = ctx.body;

  const moduleInfo = ctx.db.modules.get(name)
  if(moduleInfo) {
    ctx.db.file.delete(moduleInfo.fileId)
  }

  ctx.db.modules.delete(name)
  ctx.success()
}

exports.require = (ctx, req, res) => {
  const { id } = ctx.params
  
  if(!id) return ctx.notFound()
  const result = ctx.db.file.get(id)
  if(!result) return ctx.notFound()

  res.writeHead(200, { 'Content-type': `${result.type}; charset=utf-8`})
  res.end( result.distCode || result.code)
}

exports.read = (ctx, req, res) => {
  const { id } = ctx.params
  if(!id) return ctx.error('not found')
  const result = ctx.db.file.get(id)
  if(!result) return ctx.error('not found')
  ctx.success(result)
}
