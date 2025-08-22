---
title: Rollup使用
theme: solarized-dark
---

# Rollup 使用

Rollup 是一个 **JavaScript 模块打包工具**，和 Webpack、Vite（内部用它打包生产环境代码）属于同类，但它的定位和优势更偏向 **构建库、打包纯 JavaScript/TypeScript 模块**。

## 一、核心特性

### 1. `Tree Shaking`（摇树优化）

- 自动移除未使用的代码

- 只打包实际被引用的代码

- 显著减少最终打包体积

### 2. ES6 模块优先

- 原生支持 ES6 的 import/export 语法

- 生成更干净、更高效的代码

- 支持模块的静态分析

### 3. 多种输出格式

- `ES6` 模块：es 格式，适合现代浏览器

- `CommonJS`：cjs 格式，适合 Node.js

- `UMD`：通用模块定义，兼容 AMD 和 CommonJS

- `IIFE`：立即执行函数表达式，适合浏览器全局使用

### 4. 插件机制

- 几乎所有功能（解析 JSON、支持 TS、压缩等）都依赖插件实现。

### 5. **简单配置**

- 配置文件相对 webpack 要简单得多，核心就是 `input + output`。

举个例子：

```ts
src/
  add.js
  minus.js
  index.js
```

如果你只 import add，Rollup 打包时会把 minus 函数剔除，这就是它的 Tree-shaking 特长。

## 二、与其他打包工具的区别

| 特性         | Rollup   | Webpack  | Vite              |
| :----------- | :------- | :------- | :---------------- |
| 主要用途     | 库打包   | 应用打包 | 开发服务器 + 构建 |
| Tree Shaking | 原生支持 | 需要配置 | 基于 Rollup       |
| 配置复杂度   | 简单     | 复杂     | 中等              |
| 开发体验     | 构建时   | 构建时   | 开发时快速        |

## 三、适用场景

### 适合使用 Rollup 的场景

- 库开发：React、Vue、Lodash 等

- 工具包：需要多种输出格式

- 小型应用：追求最小打包体积

- ES6 模块：现代 JavaScript 项目

###  不太适合的场景

- 大型应用：复杂的代码分割需求

- 动态导入：需要运行时模块加载

- 非 JS 资源：大量 CSS、图片等资源处理

## 四、简单配置示例

```js
// rollup.config.js
import { defineConfig } from 'rollup'
import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import terser from '@rollup/plugin-terser'

export default defineConfig({
  input: 'src/index.js', // 入口文件
  output: [
    { file: 'dist/bundle.esm.js', format: 'esm' },
    { file: 'dist/bundle.cjs.js', format: 'cjs' },
    { file: 'dist/bundle.umd.js', format: 'umd', name: 'MyLib' }
  ],
  plugins: [
    resolve(),    // 支持导入 node_modules 包
    commonjs(),   // 转换 CommonJS 为 ESM
    terser()      // 压缩代码
  ],
  external: ['lodash'] // 外部依赖
}
```

运行：

```bash
npx rollup -c
```

就会在 dist/ 里生成三种格式的打包文件。

## 五、常用插件

### 核心插件

- `@rollup/plugin-node-resolve`：解析 node_modules 中的模块

- `@rollup/plugin-commonjs`：将 CommonJS 模块转换为 ES6

- `@rollup/plugin-babel`：使用 Babel 转译代码

- `@rollup/plugin-typescript`：TypeScript 支持

### 功能插件

- `@rollup/plugin-terser`：代码压缩

- `@rollup/plugin-postcss`：CSS 处理

- `@rollup/plugin-json`：JSON 文件导入

- `@rollup/plugin-url`：资源文件处理

## 六、总结

Rollup 是一个优秀的 JavaScript 模块打包器，特别适合库开发和追求最小打包体积的项目。它的 Tree Shaking 能力和 ES6 模块支持使其成为现代前端开发的重要工具。虽然在某些复杂场景下不如 Webpack 功能全面，但在其擅长的领域表现非常出色。

如果你正在开发一个 JavaScript 库或者需要生成多种输出格式的项目，Rollup 绝对是一个值得考虑的选择。
