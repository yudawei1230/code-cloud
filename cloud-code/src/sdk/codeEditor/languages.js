
const annotate = (arr, language = 'javascript') => {
  if (language === 'html') {
    return `
<!-- ${arr.join('\n')} -->
`;
  }

  return `
/**
 * ${arr.join('\n * ')}
 */`;
};



export default (rsdk, type, comments = []) => {
  const handleTs = async (code) => {
    let srcCode = code;
    const [prettier, parserTs] = await rsdk.require([
      'https://cdn.jsdelivr.net/npm/prettier@2.3.2/standalone.js',
      'https://cdn.jsdelivr.net/npm/prettier@2.3.2/parser-typescript.js'
    ])
    // const distCode = Babel.transform(srcCode, {
    //   // 编译代码片段, 要设置选项兼容所有后缀
    //   // https://github.com/babel/babel/issues/10154#issuecomment-507675572
    //   presets: ['env', ['typescript', { allExtensions: true }]],
    //   sourceType: 'script',
    //   comments: false,
    // }).code;
  
    srcCode = prettier.format(srcCode, {
      parser: 'typescript',
      plugins: [parserTs],
    });
  
    return srcCode
  };
  
  const handleHtml = async (code) => {
    const [prettier, parserHtml] = await rsdk.require([
      'https://cdn.jsdelivr.net/npm/prettier@2.3.2/standalone.js',
      'https://cdn.jsdelivr.net/npm/prettier@2.3.2/parser-html.js'
    ])
    const srcCode = prettier
      .format(code, {
        parser: 'html',
        plugins: [parserHtml],
      })
      .trim();
  
    return [srcCode, srcCode];
  };
  
  const handleJSON = (code) => {
    // 源码格式化, 保留注释
    let srcCode = code;
    let distCode = code;
    try {
      let commentIndex = 0;
  
      srcCode = srcCode.replace(/^\s*\/\/(.*)/gm, (_, b) => {
        return `"__comment_${commentIndex++}": "${encodeURIComponent(b)}",`;
      });
  
      // eslint-disable-next-line no-new-func
      const data = new Function('', `return ${srcCode}`)();
  
      srcCode = JSON.stringify(data, null, 2)?.trim() || '';
  
      const tmp = srcCode.replace(/"?__comment_\d+"?:\s?"(.*)",?/gm, (_, b) => `//${decodeURIComponent(b)}`);
  
      distCode = srcCode.replace(/"?__comment_\d+"?:\s?"(.*)",?/gm, '');
      srcCode = tmp;
    } catch (e) {
      srcCode = code;
    }
  
    return [srcCode, distCode];
  };
  
  const handleCSS = async (code) => {
    const [prettier, parserCSS] = await rsdk.require([
      'https://cdn.jsdelivr.net/npm/prettier@2.3.2/standalone.js',
      'https://cdn.jsdelivr.net/npm/prettier@2.3.2/parser-postcss.js'
    ])
    let srcCode = code;
  
    srcCode = prettier
      .format(srcCode, {
        parser: 'css',
        plugins: [parserCSS],
      })
      .trim();
  
    return [srcCode, srcCode];
  };
  
  
  const languageHandlerMap = {
    typescript: handleTs,
    javascript: handleTs,
    html: handleHtml,
    json: handleJSON,
    css: handleCSS,
  };

  const CodeType = {
    css: 'css',
    html: 'html',
    json: 'json',
    js: 'js'
  }
  const map = {
    [CodeType.css]: {
      defaultValue: '#current_component {\n\n}',
      language: 'css',
      comment: annotate(comments),
    },
    [CodeType.html]: {
      defaultValue: '',
      language: 'html',
      comment: annotate(comments),
    },
    [CodeType.json]: {
      defaultValue: '',
      language: 'json',
      comment: annotate(comments),
    },
    [CodeType.js]: {
      defaultValue: '',
      language: 'typescript',
      comment: annotate(comments),
    },
  };

  const { defaultValue, language, comment } = map[type];

  return {
    comment,
    defaultValue: `${comment}\n${defaultValue}`,
    language,
    handler: languageHandlerMap[language],
  } 
};
