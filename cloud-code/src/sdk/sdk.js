import { registerMicroApps, start, initGlobalState } from 'qiankun';
import layx from '!!raw-loader!./layx.js'
import layxCss from '!!raw-loader!./layx.css'

eval(layx)
const layxStyle = document.createElement('style')
layxStyle.innerHTML = layxCss
document.head.appendChild(layxStyle)

const initTimer = setInterval(async () => {
  if(!document.body) return 
  clearInterval(initTimer)
  const scriptAttr = [...document.scripts].find(v => v.hasAttribute('rsdk')).attributes
  function getAttr(key) {
    return scriptAttr[key] ? scriptAttr[key].value : null
  }
  const sdkSrc = getAttr('src').replace(/[^\/]+$/, 'main.js')
  const el = document.createElement('div')
  document.body.appendChild(el)

  const windowState = initGlobalState({})
  
  const originWindow = window
  windowState.onGlobalStateChange((state, prev) => {
    for(const key in state) {
      originWindow[key] = state[key]
    }
  })
  
  registerMicroApps([
    {
      name: process.env.npm_package_name,
      entry: { scripts: [sdkSrc]},
      container: el,
      activeRule: () => true,
      props: {
        inIframe: self !== top,
        origin: getAttr('data-origin')?.replace?.(/\/?$/, ''),
        setWindowState: windowState.setGlobalState,
      }
    }
  ]);
  start({
    fetch(url, ...args) {
      return window.fetch(url, ...args).then(res => {
        if(url === sdkSrc) {
          return res.text().then(text => {
            return {
              text() {
                return `(function(){
                  var define;
                  ${text}
                })()`
              }
            }
          })
        }
        
        return res
      })
    }
  });
}, 50)

  
