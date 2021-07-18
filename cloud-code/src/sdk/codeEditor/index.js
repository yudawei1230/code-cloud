import useLanguage from './languages'
async function openEditor (rsdk, dom, options) { 
  rsdk.config({
    paths: {
        vs: 'https://cdn.staticfile.org/monaco-editor/0.21.2/min/vs'
    },
    'vs/nls': { availableLanguages: { '*': 'zh-cn' } }
  });
  await rsdk.require(['vs/editor/editor.main']);
  //创建编辑器
  const editor = monaco.editor.create(dom, {
    //自适应调整
    automaticLayout: true,
    theme: 'vs-dark',
    ...options
  });


  return { monaco, editor }
}

export default function useCodeEditor (rsdk, { REACT, ANTD }) {
  return  async (modalOptions = {}, editorOptions= {}) => {
    const { modalStyle = {} } = modalOptions
    const editorStyle = editorOptions.editorStyle
    
    const style = { 
      width: '1000px', 
      height: '500px', 
      ...editorStyle
    }
    const [React] = await REACT
    const { useRef, useEffect } = React
    const [{ Modal, message } ]= await ANTD
    
    return new Promise(resolve => {
      const modalWrapper = document.createElement("div");
      rsdk.container.appendChild(modalWrapper)

      const modal = Modal.confirm({ 
        title: '编辑模块',
        width: '1200px', 
        height: '600px', 
        ...modalStyle, 
        ...modalOptions ,
        getContainer: () => modalWrapper,
        modalRender(children) {
          const containerRef = useRef(null)
          useEffect(() => {
            const content = containerRef.current.querySelector('.ant-modal-confirm-content')
            const languageOptions = useLanguage(rsdk, 'js')
            Object.assign(content.style, style)
            openEditor(rsdk, content, {
              ...editorOptions, 
              editorStyle: undefined,
              ...languageOptions
            }).then(({ monaco, editor }) => {
              editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, async function() {
                editor.setValue(await languageOptions.handler(editor.getValue()))
                await editorOptions.onSave()
                modal.destroy()
                message.success('保存成功')
              })
              editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KEY_S, async function() {
                editor.setValue(await languageOptions.handler(editor.getValue()))
                await editorOptions.onSave()
                message.success('保存成功')
              });
              resolve( { monaco, editor, modal })
            })
          }, [])
          
          return <div ref={containerRef} children={children}/> 
        }
      })
    })
  }
}