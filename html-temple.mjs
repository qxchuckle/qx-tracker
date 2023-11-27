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
    const link = `<link rel="stylesheet" href="${publicPath}index.css">`;
    const script = `<script type="module" src="${publicPath}index.js"></script>`;
    return renderHtml([link], [script], { attributes, bundle, files, publicPath, title, meta });
  }
}

export const htmlProdTemple = {
  ...config,
  template({ attributes, bundle, files, publicPath, title, meta }) {
    const link = `<link rel="stylesheet" href="${publicPath}index.css">`;
    const requirejs = "https://requirejs.org/docs/release/2.3.6/minified/require.js";
    const script = `<script src="${requirejs}" data-main="${publicPath}index.min.js"></script>`;
    return renderHtml([link], [script], { attributes, bundle, files, publicPath, title, meta });
  }
}

function renderHtml(additionalHead, additionalBody, { attributes, bundle, files, publicPath, title, meta }) {
  return `<!DOCTYPE html>
    <html${renderAttributes(attributes)}>
    <head>
      ${renderMeta(meta)}
      <title>${title}</title>
      ${arrToString(additionalHead)}
    </head>
    <body>
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
