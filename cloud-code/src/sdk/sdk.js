import { registerMicroApps, start, initGlobalState } from 'qiankun';

const scriptAttr = [...document.scripts].find(v => v.hasAttribute('rsdk')).attributes
function getAttr(key) {
  return scriptAttr[key] ? scriptAttr[key].value : null
}

const sdkSrc = getAttr('src').replace(/[^\/]+$/, 'main.js')

const el = document.createElement('div')
document.body.appendChild(el)
registerMicroApps([
  {
    name: process.env.npm_package_name,
    entry: { scripts: [sdkSrc]},
    container: el,
    activeRule: () => true,
  }
]);

initGlobalState({
  origin: getAttr('data-origin')?.replace?.(/\/?$/, '')
})
// 启动 qiankun
start({
  sandbox: {  experimentalStyleIsolation: true }
});
