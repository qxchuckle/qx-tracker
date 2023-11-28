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

export const htmlDevTemple = {
  ...config,
  template({ attributes, bundle, files, publicPath, title, meta }) {
    const script = `<script type="module">
        import Tracker from './index.js';
        const tk = new Tracker({
          "requestUrl": 'http://127.0.0.1:9000/tracker',
          "historyTracker": false,
          "hashTracker": true,
          "domTracker": true,
          "errorTracker": true,
        })
    </script>`;
    return renderHtml([script], { attributes, bundle, files, publicPath, title, meta });
  }
}

export const htmlProdTemple = {
  ...config,
  template({ attributes, bundle, files, publicPath, title, meta }) {
    const script = `<script src="${publicPath}index.min.js"></script>`;
    return renderHtml([script], { attributes, bundle, files, publicPath, title, meta });
  }
}

function renderHtml(additionalBody, { attributes, bundle, files, publicPath, title, meta }) {
  return `<!DOCTYPE html>
    <html${renderAttributes(attributes)}>
    <head>
      ${renderMeta(meta)}
      <title>${title}</title>
    </head>
    <body>
      <h1>Test</h1>
      <button class="a b c" id="d" target-key="btn" target-events="['click']">dom事件上报测试</button>
      <div target-key="div" target-events="['mouseover', 'mouseout']" style="width:100px;height:100px;background-color:blue;"></div>
      ${arrToString(additionalBody)}
    </body>
    </html>`;
}

function arrToString(arr) {
  return arr.reduce((prev, item) => prev + item, '')
}

function renderAttributes(attributes) {
  return Object.entries(attributes).reduce((prev, [key, value]) => prev + ` ${key}="${value}"`, '')
}

function renderMeta(meta) {
  return meta.reduce((prev, item) => prev + `<meta${Object.entries(item).reduce((prev, [key, value]) => prev + ` ${key}="${value}"`, '')}>`, '')
}
