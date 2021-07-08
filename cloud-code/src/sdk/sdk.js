import { registerMicroApps, start, initGlobalState } from 'qiankun';

const scriptAttr = [...document.scripts].find(v => v.hasAttribute('rsdk')).attributes
function getAttr(key) {
  return scriptAttr[key] ? scriptAttr[key].value : null
}

const sdkSrc = getAttr('src').replace(/[^\/]+$/, 'main.js')


if(self===top){ 
  const el = document.createElement('div')
  const initTimer = setInterval(() => {
    if(!document.body) return 
    clearInterval(initTimer)
    document.body.appendChild(el)

    const rsdkState = initGlobalState({})
    
    rsdkState.onGlobalStateChange((state, prev) => {
      window.rsdk = state
    })

    registerMicroApps([
      {
        name: process.env.npm_package_name,
        entry: { scripts: [sdkSrc]},
        container: el,
        activeRule: () => true,
        props: {
          origin: getAttr('data-origin')?.replace?.(/\/?$/, ''),
          setRsdkState: rsdkState.setGlobalState
        }
      }
    ]);

    // 启动 qiankun
    start({
      sandbox: {  strictStyleIsolation: true }
    });
  }, 50)

}
  
