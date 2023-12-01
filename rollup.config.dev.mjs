import serve from 'rollup-plugin-serve';
import livereload from "rollup-plugin-livereload";
import html from '@rollup/plugin-html';
import common from './rollup.config.common.mjs';
import { htmlDevTemple } from './html-temple.mjs';

export default Object.assign({}, common, {
  output: [
    {
      dir: 'dist',
      entryFileNames: '[name].js',
      format: 'umd',
      name: "Tracker"
    }
  ],
  plugins: [
    ...common.plugins,
    html(htmlDevTemple),
    serve({
      port: 3000, // 端口
      contentBase: 'dist', // 输出目录
      openPage: '/index.html', // 打开的是哪个文件
      open: false, // 自动打开浏览器
    }),
    livereload(),
  ],
});