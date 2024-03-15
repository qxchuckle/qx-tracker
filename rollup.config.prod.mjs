// import html from '@rollup/plugin-html';
// 压缩
// import terser from '@rollup/plugin-terser';
// 公共配置
import common from "./rollup.config.common.mjs";
// import { htmlProdTemple } from './html-temple.mjs';
// 用于生成 TypeScript 的声明文件
import dts from "rollup-plugin-dts";

// 使用Object.assign扩展公共配置
// 导出一个数组，数组中包含两个配置对象，rollup允许多入口多个产物
export default [
  Object.assign({}, common, {
    output: [
      //打包 AMD CMD UMD
      {
        dir: "dist",
        entryFileNames: "[name].js",
        format: "umd",
        name: "Tracker",
      },
      // 压缩的事还是应该交给用户自己去做
      // {
      //   dir: 'dist',
      //   entryFileNames: '[name].min.js',
      //   format: 'umd',
      //   name: "tracker",
      //   plugins: [terser()],
      // },
      //打包common js
      {
        dir: "dist",
        entryFileNames: "[name].cjs.js",
        format: "cjs",
      },
      // {
      //   dir: 'dist',
      //   entryFileNames: '[name].cjs.min.js',
      //   format: 'cjs',
      //   plugins: [terser()],
      // },
      //打包esModule
      {
        dir: "dist",
        entryFileNames: "[name].esm.js",
        format: "es",
      },
      // {
      //   dir: 'dist',
      //   entryFileNames: '[name].esm.min.js',
      //   format: 'es',
      //   plugins: [terser()],
      // },
    ],
    plugins: [
      ...common.plugins,
      // html(htmlProdTemple)
    ],
  }),
  {
    // 打包d.ts
    input: {
      index: "./src/core/index.ts",
    },
    output: {
      dir: "dist",
      entryFileNames: "[name].d.ts",
      format: "es",
    },
    plugins: [dts()],
  },
];
