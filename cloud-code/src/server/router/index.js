module.exports = router => [
  router.get(['/modules',   require('./module').getModule]),
  router.options(['/modules',   require('./module').getModule]),
  router.get(['/allModules',   require('./module').getModuleList]),
  router.post(['/setModule',   require('./module').setModules]),
  router.post(['/addModule',   require('./module').addModules]),
  router.delete(['/deleteModule',   require('./module').deleteModules]),
  
  router.get(['/file/read/:id',   require('./file').read]),
  router.post(['/file/create',   require('./file').create]),
  router.post(['/file/update',   require('./file').update]),
  router.post(['/file/delete',   require('./file').delete]),
  router.get(['/file/:id',   require('./file').require]),
]