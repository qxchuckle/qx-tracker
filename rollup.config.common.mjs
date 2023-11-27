import nodeResolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import clear from 'rollup-plugin-clear';
import typescript from '@rollup/plugin-typescript';

export default {
  input: {
    index: './src/core/index.ts',
  },
  plugins: [
    nodeResolve(),
    commonjs({ extensions: ['.js', '.ts'] }),
    clear({
      // 需要清空的文件夹
      targets: ['dist'],
      // 在监视模式下进行汇总重新编译时是否清除目录
      watch: false, // default: false
    }),
    typescript({}),
  ],
};