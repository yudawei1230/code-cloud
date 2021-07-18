const path = require('path')

exports.getModuleList = (ctx) => {
  ctx.success({data: ctx.db.modules.all() })
}

exports.addModules = (ctx) => {
  const { name, ...query } =  ctx.body
  if(ctx.db.modules.get(name) !== undefined) {
    return ctx.error('已存在该模块')
  }
  ctx.db.modules.set(name, query)
  ctx.success({data: { [name]: ctx.db.modules.get(name)} })
}

exports.setModules = (ctx) => {
  const { name, ...query } =  ctx.body
  const moduleInfo = ctx.db.modules.get(name)
  if(moduleInfo === undefined) {
    return ctx.error('不存在该模块')
  }
  ctx.db.modules.set(name, { ...moduleInfo, ...query })
  ctx.success({data: { [name]: ctx.db.modules.get(name)} })
}

exports.deleteModules = (ctx) => {
  const { name } =  ctx.query
  if(!name) return  ctx.error('删除失败')
  const moduleInfo = ctx.db.modules.get(name)
  if(moduleInfo && moduleInfo.fileId) {
    ctx.db.file.delete(moduleInfo.fileId)
  }
  ctx.db.modules.delete(name)

  if(ctx.db.modules.get(name) !== undefined) {
    ctx.error('删除失败')
  } else {
    ctx.success()
  }
}

exports.getModule = (ctx) => {
  const { name } = ctx.query 
  

  const data = ctx.db.modules.get(name)
  if(data) {
    return ctx.success({ data })
  }

  return ctx.error('module not found')
}

