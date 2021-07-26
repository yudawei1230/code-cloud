import { require as r, define as d } from 'requirejs'
import React, { useEffect, useRef } from 'react'
import ReactDOM from 'react-dom'
import useSpotlight from './spotlight/index.tsx'
import textPlugin from './plugins/text'
import cssPlugin from './plugins/css'
import promisePlugin from './plugins/promise'
import { MODULE_TYPE }  from '../config/const'
import useCodeEditor from './codeEditor'
import style from './index.css'
export async function bootstrap() {}

export async function mount(props) {
  const { setWindowState, container, origin, inIframe } = props
  textPlugin(d, r)
  cssPlugin(d, r)
  promisePlugin(d, r)

  const isMac = (function () {
    return /macintosh|mac os x/i.test(navigator.userAgent);
  })();

  const ignoreDeps = ['require', 'exports', 'rsdk']
  r.config({
    waitSeconds: 0
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
    if(paths[name] || !/^(?!https?:\/\/)/.test(name) || name.includes('!')) {
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
      d(key, () => {
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

  window.rsdk =  {
    origin,
    container,
    get context() {
      return r.s.contexts._
    },
    setWindowState,
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
      const babelUrl = 'https://unpkg.com/@babel/standalone'
      const open = useCodeEditor(rsdk)
      let editor
      const info = await rsdk.getModuleInfo(name)
      if(!info.name) {
        return window.layx.msg(`查询不到该模块信息「${name}」。`)
      }
      const onSave = async () => {
        if(!editor) return
        const [Babel] = await rsdk.require([babelUrl])
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
        { value: info.code, onSave, name }
      )).editor;
      rsdk.require([babelUrl])
    }
  }
  d('rsdk', () => window.rsdk)
  setWindowState({ rsdk: window.rsdk })
  
  const root = document.createElement('div')
  root.setAttribute('id', 'root')
  container.appendChild(root)

  function App () {
    const ref = useRef()

    useEffect(() => {
      useSpotlight({ inIframe, rsdk, ref })
    }, [])
    
    if(inIframe) return <></>
    return  <>
      <style>{style.toString()}</style>
      <div className={style.locals.img} onClick={() => ref.current?.()}>
        <svg  t="1625627222679" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="2902" width="200" height="200"><path d="M512 512m-512 0a512 512 0 1 0 1024 0 512 512 0 1 0-1024 0Z" fill="#409EFF" p-id="2903"></path><path d="M759.466667 420.977778C750.933333 305.777778 654.933333 214.044444 536.888889 214.044444c-88.177778 0-163.555556 51.2-200.533333 124.444445-123.733333 7.111111-221.866667 109.511111-221.866667 235.377778 0 66.133333 25.6 125.866667 66.844444 168.533333v-0.711111C363.377778 502.755556 597.333333 433.066667 597.333333 433.066667l-28.444444-21.333334 142.222222-28.444444-85.333333 92.444444-14.222222-28.444444c-320 169.244444-241.066667 327.822222-218.311112 362.666667h317.155556c110.933333-5.688889 198.4-93.155556 198.4-198.4 0.711111-89.6-62.577778-165.688889-149.333333-190.577778z" fill="#FFFFFF" p-id="2904"></path></svg>
      </div>
    </>
  }
  ReactDOM.render(<App/>, root)
}

/**
 * 应用每次 切出/卸载 会调用的方法，通常在这里我们会卸载微应用的应用实例
 */
export  function unmount() {}

