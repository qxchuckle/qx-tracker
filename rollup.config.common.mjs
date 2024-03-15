// 默认情况下，Rollup 只能处理相对路径的导入，安装node-resolve才能在模块中导入第三方npm模块
import nodeResolve from '@rollup/plugin-node-resolve';
// 将 CommonJS 模块转换为 ES6 模块，因为 Rollup 默认只能处理 ES6 模块
import commonjs from '@rollup/plugin-commonjs';
// 在每次打包之前清空输出目录
import clear from 'rollup-plugin-clear';
// 编译ts，使 Rollup 能处理ts文件
import typescript from '@rollup/plugin-typescript';
// 在源代码中替换一些特定的字符串。
import replace from '@rollup/plugin-replace';

export default {
  // 入口文件
  input: {
    // 名为index的入口文件
    index: './src/core/index.ts',
  },
  // 插件配置
  plugins: [
    replace({
      preventAssignment: true, // 阻止在赋值操作中进行不正确的替换。
      __env__: JSON.stringify(process.env.ENV) // 替换为环境变量
    }),
    nodeResolve(), // 可以导入第三方npm模块
     // 将 CommonJS 模块转换为 ES6 模块，只处理js和ts文件
    commonjs({ extensions: ['.js', '.ts'] }),
    clear({
      // 需要清空的文件夹
      targets: ['dist'],
      // 在监视模式下进行汇总重新编译时是否清除目录
      watch: false, // default: false
    }),
    typescript({}), // 编译ts
  ],
};