// 在开发环境中启动一个 HTTP 服务器
import serve from 'rollup-plugin-serve';
// 在文件改变时自动刷新浏览器
import livereload from "rollup-plugin-livereload";
// 生成html文件，方便查看效果
import html from '@rollup/plugin-html';
// 公共配置
import common from './rollup.config.common.mjs';
// html模板
import { htmlDevTemple } from './html-temple.mjs';

// 使用Object.assign扩展公共配置
export default Object.assign({}, common, {
  // 输出配置
  output: [
    {
      dir: 'dist', // 输出目录
      entryFileNames: '[name].js', // 输出文件名
      format: 'umd', // 输出格式
      name: "Tracker" // umd模块名称，作为全局变量名
    }
  ],
  plugins: [
    ...common.plugins, // 导入公共配置的插件
    html(htmlDevTemple), // 生成html文件
    serve({
      port: 3000, // 端口
      contentBase: 'dist', // 服务器的根目录为输出目录
      openPage: '/index.html', // 打开哪个文件
      open: false, // 自动打开浏览器
    }),
    livereload(), // 自动刷新浏览器
  ],
});