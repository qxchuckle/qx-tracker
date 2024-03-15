const config = {
  fileName: 'index.html',
  title: 'Rollup Demo',
  attributes: { lang: 'en' },
  publicPath: '',
  meta: [
    { charset: 'utf8' },
    { name: 'viewport', content: 'width=device-width, initial-scale=1.0' },
    { name: 'keywords', content: 'rollup, demo' },
  ]
}

const testJS = `
// 挂载到window上便于访问实例
window.tk = new Tracker({
  "requestUrl": 'http://127.0.0.1:9000/tracker',
  "historyTracker": true,
  "hashTracker": true,
  "domTracker": true,
  "errorTracker": true,
  "performanceTracker": true,
  "navigatorTracker": true,
})
setTimeout(() =>{
  const imgElement = document.createElement('img');
  imgElement.src = 'https://github.githubassets.com/assets/mona-loading-dimmed-5da225352fd7.gif';
  imgElement.style.maxWidth = '100px';
  document.body.appendChild(imgElement);
},1000)
setTimeout(() =>{
  const imgElement = document.createElement('img');
  imgElement.src = 'https://aaabbbcccddd123456789.com/index.png';
  imgElement.style.maxWidth = '100px';
  document.body.appendChild(imgElement);
},2000)
`

export const htmlDevTemple = {
  ...config,
  template({ attributes, bundle, files, publicPath, title, meta }) {
    const script = `<script src="./index.js"></script>
    <script>${testJS}</script>
    <script>throw 1;</script>
    <script>console.log(abcde)</script>
    `;
    return renderHtml([script], { attributes, bundle, files, publicPath, title, meta });
  }
}

export const htmlProdTemple = {
  ...config,
  template({ attributes, bundle, files, publicPath, title, meta }) {
    const script = `<script src="./index.js"></script>
    <script>${testJS}</script>
    <script>throw 1;</script>
    <script>console.log(abcde)</script>
    `;
    return renderHtml([script], { attributes, bundle, files, publicPath, title, meta });
  }
}

function renderHtml(scripts, { attributes, bundle, files, publicPath, title, meta }) {
  return `<!DOCTYPE html>
    <html${renderAttributes(attributes)}>
    <head>
      ${renderMeta(meta)}
      <title>${title}</title>
      <!-- 监控要在最开始执行 --> 
      ${arrToString(scripts)}
      <!-- 测试资源加载错误 --> 
      <link rel="stylesheet" href="https://aaabbbcccddd123456789.com/index.css">
    </head>
    <body>
      <h1>Test</h1>
      <p>功能测试</p>
      <button onclick="javascript:tk.sendReport();">手动上报</button>
      <button class="a b c" id="d" target-key="btn" target-events="['click']">dom事件上报测试</button>
      <button onclick="javascript:fetch('https://avatars.githubusercontent.com/u/55614189?v=4');">fetch请求</button>
      <div id="e" target-key="div" target-events="['mouseover', 'mouseout']" style="width:100px;height:100px;background-color:blue;margin: 30px 0;"></div>
      <p>error捕获测试</p>
      <button onclick="javascript:throw new Error('This is an error message');">console.error</button>
      <button onclick="javascript:fetch('https://aaabbbcccddd123456789.com/index.json');">fetch(promise)请求错误</button>
      <p></p>
      <img src="https://avatars.githubusercontent.com/u/55614189?v=4" width="100" />
      <!-- 测试资源加载错误 --> 
      <img src="https://aaabbbcccddd123456789.com/index.png" class="error_img" id="error_img" width="100" />
      <script src="https://aaabbbcccddd123456789.com/index.js" class="error_script" id="error_script"></script>
    </body>
    </html>`;
}

function arrToString(arr) {
  return arr.reduce((prev, item) => prev + item, '')
}

function renderAttributes(attributes) {
  return Object.entries(attributes).reduce((prev, [key, value]) => {
    if (key === 'script') {
      return prev
    }
    return prev + ` ${key}="${value}"`
  }, '')
}

function renderMeta(meta) {
  return meta.reduce((prev, item) => prev + `<meta${Object.entries(item).reduce((prev, [key, value]) => prev + ` ${key}="${value}"`, '')}>`, '')
}
