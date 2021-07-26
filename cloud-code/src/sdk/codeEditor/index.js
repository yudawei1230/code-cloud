import useLanguage from "./languages";
import editorCss from "!!raw-loader!../editor.css";

async function openEditor(rsdk, dom, options) {
  rsdk.config({
    paths: {
      vs: "https://cdn.staticfile.org/monaco-editor/0.21.2/min/vs",
    },
    "vs/nls": { availableLanguages: { "*": "zh-cn" } },
  });
  await rsdk.require(["vs/editor/editor.main"]);

  //创建编辑器
  const editor = monaco.editor.create(dom, {
    //自适应调整
    automaticLayout: true,
    theme: "vs-dark",
    ...options,
  });

  return { monaco, editor };
}

export default function useCodeEditor(rsdk) {
  return async (modalOptions = {}, editorOptions = {}) => {
    const editorStyle = editorOptions.editorStyle;

    const style = {
      width: "100%",
      height: "500px",
      ...editorStyle,
    };

    return new Promise((resolve) => {
      const modalWrapper = document.createElement("div");
      rsdk.container.appendChild(modalWrapper);
      const modalId = "code-editor-" + editorOptions.name;
      window.layx.html(
        modalId,
        editorOptions.name,
        `
      <div style="height: 100%;">
          <style>${editorCss}</style>
          <div class="cloud-editor">
            
          </div>
        </div>
      `
      );
      const content = document.querySelector(`#layx-${modalId} .cloud-editor`);
      const editorEl = document.createElement("div");
      editorEl.className = "code-content";
      content.appendChild(editorEl);
      const languageOptions = useLanguage(rsdk, "js");
      Object.assign(content.style, style);
      openEditor(rsdk, editorEl, {
        ...editorOptions,
        editorStyle: undefined,
        ...languageOptions,
      }).then(({ monaco, editor }) => {
        content.style.height = '100%'
        editor.addCommand(
          monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter,
          async function () {
            editor.setValue(await languageOptions.handler(editor.getValue()));
            await editorOptions.onSave();
            window.layx.msg("保存成功");
          }
        );
        editor.addCommand(
          monaco.KeyMod.CtrlCmd | monaco.KeyCode.KEY_S,
          async function () {
            editor.setValue(await languageOptions.handler(editor.getValue()));
            await editorOptions.onSave();
            window.layx.msg("保存成功");
          }
        );
        resolve({ monaco, editor });
      });
    });
  };
}
