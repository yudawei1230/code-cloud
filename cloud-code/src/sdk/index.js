import { require as r, define as d } from 'requirejs'
import textPlugin from './plugins/text'
import cssPlugin from './plugins/css'
import promisePlugin from './plugins/promise'
import { MODULE_TYPE }  from '../config/const'
import useCodeEditor from './codeEditor'

window.r = r
window.d = d

export async function bootstrap(props) {
  console.log(props)
}

export async function mount({ onGlobalStateChange, container }) {
  textPlugin(d, r)
  cssPlugin(d, r)
  promisePlugin(d, r)
  
  const isMac = (function () {
    return /macintosh|mac os x/i.test(navigator.userAgent);
  })();

  const ignoreDeps = ['require', 'exports', 'rsdk']
  r.config({
      waitSeconds: 20
  })
  function load(url, { exportsKeys, noCache }) {
    if(!url) return
    return new Promise((resolve, reject) => r([url], resolve, reject))
      .then(data => data && data.__esModule && data.default ? data.default : data)
      .then(data => {
        if(!data || data.__esModule) r.undef(url)
        if(data || !exportsKeys) return data

        return Array.isArray(exportsKeys) ? exportsKeys.reduce((obj, key) => ({ ...obj, [key]: window[key]}), {}) : window[exportsKeys]
      })
      .finally(() => noCache && r.undef(url))
  }

  const scriptAttr = [...document.scripts][document.scripts.length -1].attributes
  function getAttr(key) {
    return scriptAttr[key] ? scriptAttr[key].value : null
  }

  let origin = getAttr('data-origin')?.replace?.(/\/?$/, '')
  onGlobalStateChange((val) => {
    origin = origin || val.origin
  }, true)

  function request (url) {
    if(typeof url !== 'string') throw new Error('url expect to be string')
    
    return fetch(`${origin}/${url}`).then(res => res.json())
  }

  function formatDeps(deps) {
    return deps.map(dep => {
      const depUrl = rsdk.context.config.paths[dep]
      if(!depUrl || !/\.css$/.test(depUrl)) return dep
      return `css!${depUrl}`
    })
  }


  function registryModule(data) {
    const {name, url } = data
    const extraInfo = data.exportsKeys ? { exportsKeys: data.exportsKeys} : {}
    
    if(MODULE_TYPE.LINK === data.type && url) {
      r.config({ paths: { [name]: url}, shim: { [name]: { deps: formatDeps(data.deps || []), extraInfo}} })
    } else if (MODULE_TYPE.FILE === data.type && data.fileId) {
      data.noCache = true
      r.config({ 
        paths: { 
          [name]: `${origin}/file/${data.fileId}?noext`
        },
        shim: { 
          [name]: { deps: formatDeps(data.deps || []), 
          extraInfo: { ...extraInfo, noCache: true }}
        }
      }) 
    }

    return data
  }

  function getModuleInfo(name) {
    const { paths, shim }= window.rsdk.context.config
    const keys = Object.keys(rsdk.context.config.paths)
    if(keys.some(p => new RegExp(`^${p}/`).test(name))) return { name }
    if(['require', 'exports'].includes(name) || rsdk.context.registry[name]) return {name}
    if(paths[name] || !/^(?!https?:\/\/)/.test(name)) {
      const extraInfo = shim[name]?.extraInfo || {}
      return { name, ...extraInfo }
    }

    return requestModuleInfo(name)
  }

  function requestModuleInfo(name) {
    return request(`modules?name=${name}`)
    .then(result => {
      if(!result || result.status !== 0 || !result.data) return { name }
      const info = { name, ...result.data }
      if(!result.data.deps) return registryModule(info)
      const deps = result.data.deps.filter(v => !ignoreDeps.includes(v))
      return Promise.all(deps.map(getModuleInfo)).then(() => registryModule(info))
    })
  }

  Object.defineProperty(window, 'define', { get () {
    proxyDefineHandler.amd = true
    return proxyDefineHandler
  }})

  const proxyDefineHandler = (name, deps, callback) => {
    const checkDeps = (list = []) => list.map(item => {
      if(rsdk.context.defined[item] || rsdk.context.registry[item] || ['require', 'exports'].includes(item)) return item
      if(/^\.\.?\//.test(item)) return item
      if(/^(https?\:\/\/)/.test(item)) return item
      const keys = Object.keys(rsdk.context.config.paths)
      if(keys.some(p => new RegExp(`^${p}/`).test(item))) return item
      
      const key = Date.now() +'_'+ String(Math.random()).match(/\d+$/)[0]
      const asyncKey = `promise!${key}`
      define(key, () => {
        return rsdk.require(item)
        .then(data => {
          return { ...data[0] }
        })
      })
      return asyncKey
    })

    //Allow for anonymous modules
    if (typeof name !== 'string') {
      callback = deps;
      deps = name;
      name = null;
    } else {
      if(Array.isArray(deps)) deps = checkDeps(deps)
      
      return d(name, deps, callback)
    }

    //This module may not have dependencies
    if (!Array.isArray(deps)) {
        callback = deps;
        return d(callback)
    }

    deps = checkDeps(deps)
    return d(deps, callback)
  }

  define('rsdk', () => window.rsdk)

  window.rsdk = {
    origin,
    container,
    get context() {
      return r.s.contexts._
    },
    getModuleInfo: (name) => {
      return requestModuleInfo(name).then(({ fileId, type, url, noCache }) => {
        if(type !== 'file' ) return { url }
        return request(`file/read/${fileId}`).then(({ code, type }) => ({ code, name, type, noCache }))
      })
    },
    config: (data) => r.config(data),
    require: (modules, fn) => {
      if(!modules) return 
      const modulesList = Array.isArray(modules) ? modules : [modules]
      return Promise.all(modulesList.map(getModuleInfo))
      .then((modulesInfoList) => Promise.all(modulesInfoList.map(({ name, exportsKeys, noCache }) => load(name, { exportsKeys, noCache })))) 
      .then(data => {
        return fn ? fn(...data) : data
      })
    },
    exec: (modules, ...options) => rsdk.require(modules).then(data => data?.[0] instanceof Function ? data[0](...options) : data),
    editModule: async function (name) {
      const open = useCodeEditor(rsdk)
      let editor
      const info = await rsdk.getModuleInfo(name)
      const onSave = async () => {
        if(!editor) return
        const [Babel] = await rsdk.require(['babel'])
        const distCode =  Babel.transform(editor.getValue(), {
          presets:["react", "es2017"],
          plugins: ['transform-modules-umd']
        }).code
        const deps = distCode.match(/(?<=define\(\[)[^\]]+/)?.[0]?.split?.(',').map(JSON.parse) || []
        await fetch(`${origin}/file/update`,{
            method: 'post',
            body:JSON.stringify({ ...info,  code: editor.getValue(), distCode, deps })
        })
      }
      
      editor = (await open({ 
            title: '编辑模块',
            okText: '确定' + (isMac ? '(⌘+Enter)' : '(Ctrl+Enter)'),
            cancelText: '取消',
            async onOk() { 
              await onSave()
            }
        },
        { value: info.code, onSave }
      )).editor
    }
  }
  window.rsdk.exec('spotlight')
  console.log(window)
}

/**
 * 应用每次 切出/卸载 会调用的方法，通常在这里我们会卸载微应用的应用实例
 */
export  function unmount(props) {
  console.log(props)
}

