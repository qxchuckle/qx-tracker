import html from '@rollup/plugin-html';
import terser from '@rollup/plugin-terser';
import common from './rollup.config.common.mjs';
import { htmlProdTemple } from './html-temple.mjs';
import dts from 'rollup-plugin-dts';

export default [Object.assign({}, common, {
  output: [
    //打包 AMD CMD UMD
    {
      dir: 'dist',
      entryFileNames: '[name].js',
      format: 'umd',
      name: "tracker"
    },
    {
      dir: 'dist',
      entryFileNames: '[name].min.js',
      format: 'umd',
      name: "tracker",
      plugins: [terser()],
    },
    //打包common js
    {
      dir: 'dist',
      entryFileNames: '[name].cjs.js',
      format: 'cjs',
    },
    {
      dir: 'dist',
      entryFileNames: '[name].cjs.min.js',
      format: 'cjs',
      plugins: [terser()],
    },
    //打包esModule
    {
      dir: 'dist',
      entryFileNames: '[name].esm.js',
      format: 'es',
    },
    {
      dir: 'dist',
      entryFileNames: '[name].esm.min.js',
      format: 'es',
      plugins: [terser()],
    },
  ],
  plugins: [
    ...common.plugins,
    html(htmlProdTemple)
  ],
}),
{
  // 打包d.ts
  input: {
    index: './src/core/index.ts',
  },
  output: {
    dir: 'dist',
    entryFileNames: '[name].d.ts',
    format: 'es',
  },
  plugins: [dts()],
}
];