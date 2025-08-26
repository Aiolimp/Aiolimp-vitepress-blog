---
title: 004 webpack Plugin
theme: solarized-dark
---

# Webpack Plugin

## 简介

Webpack Plugin 是 webpack 生态系统的核心概念，用于在 webpack 构建过程中执行各种任务，比如文件压缩、代码分割、资源优化等。Plugin 可以访问 webpack 的整个生命周期，并且可以修改 webpack 的输出结果。

## Plugin 与 Loader 的区别

| 特性     | Plugin             | Loader         |
| -------- | ------------------ | -------------- |
| 作用范围 | 整个构建过程       | 单个文件       |
| 执行时机 | 构建生命周期各阶段 | 文件处理阶段   |
| 功能定位 | 功能扩展、资源优化 | 文件转换       |
| 配置方式 | `plugins` 数组     | `module.rules` |

## Plugin 工作原理

### 1. **Webpack 本质是基于事件流的编译器**

Webpack 基于 `Tapable` 库构建了一套事件系统，`Plugin` 就是通过在不同的生命周期阶段（hooks）注册回调，来“监听”并操作编译流程。

### 2. **常见生命周期钩子**

| **钩子**                      | **触发时机**   | **用途**                  |
| ----------------------------- | -------------- | ------------------------- |
| compiler.hooks.environment    | 初始化配置     | 在 Webpack 启动时执行一次 |
| compiler.hooks.compile        | 编译开始       | 做准备工作                |
| compilation.hooks.buildModule | 构建某个模块时 | 处理模块内容              |
| compiler.hooks.emit           | 生成文件前     | 修改、添加打包输出内容    |
| compiler.hooks.done           | 打包完成       | 输出日志、执行收尾操作    |

### 3. 核心 API 是 compiler 和 compilation 对象

- **Compiler**：webpack 主引擎，代表整个构建过程

  `Compiler` 模块是 webpack 的主要引擎，它通过 [CLI](https://link.juejin.cn?target=https%3A%2F%2Fwebpack.docschina.org%2Fapi%2Fcli) 或者 [Node API](https://link.juejin.cn?target=https%3A%2F%2Fwebpack.docschina.org%2Fapi%2Fnode) 传递的所有选项创建出一个 compilation 实例（稍微介绍它）。 它扩展（extends）自 `Tapable` 类，用来注册和调用插件。 大多数面向用户的插件会首先在 `Compiler` 上注册。

  webpack 的所有生命周期 hooks（钩子函数）都是由 `compiler` 暴露出来的。我们可以把`compiler`看做是 webpack 提供的一个实例化上下文对象

  列举几个常见的 compiler-hooks：

  `entryOption`：webpack 读取完 entry（入口文件）后调用

  `afterPlugins`：设置完初始化内部插件之后

  `compilation`：编译这件事被创建时，生成文件前

  `done`：编译完成之后

  `emit`：生成资源到 output 目录之前

- **Compilation**: 代表一次具体的编译，包含模块和资源信息

  `Compilation` 模块会被 `Compiler` 用来创建新的 compilation 对象（或新的 build 对象）。 `compilation` 实例能够访问所有的模块和它们的依赖（大部分是循环依赖）。 它会对应用程序的依赖图中所有模块， 进行字面上的编译(literal compilation)。 在编译阶段，模块会被加载(load)、封存(seal)、优化(optimize)、 分块(chunk)、哈希(hash)和重新创建(restore)。

  也就是说 webpack 提供了一个`Compilation` 模块，上下文对象`Compiler`可以调用这个模块来创建一个新的对象，该对象也能可以访问到 webpack 所有的模块，且这个对象会编译代码中需要的依赖。并且 `Compilation` 类扩展自 `Tapable`，也提供了一些列的 [生命周期钩子](https://link.juejin.cn?target=https%3A%2F%2Fwebpack.docschina.org%2Fapi%2Fcompilation-hooks%2F)

  列举几个常见的 compilation-hooks：

  `buildModule`：在模块构建开始之前触发，可以用来修改模块

  `rebuildModule`： 在重新构建一个模块之前触发

  `succeedModule`：模块构建成功时执行

  `failedModule`：模块构建失败时执行

## 自定义 Plugin 开发

### 基本结构

```javascript
class MyWebpackPlugin {
  constructor(options = {}) {
    this.options = options;
  }

  apply(compiler) {
    // 在这里注册钩子
    compiler.hooks.done.tap('MyWebpackPlugin', (stats) => {
      console.log('构建完成！');
    });
  }
}

module.exports = MyWebpackPlugin;
```

### 核心要素

1. **类或函数**: Plugin 可以是一个类或者函数
2. **apply 方法**: 必须实现 apply 方法，接收 compiler 参数
3. **钩子注册**: 通过 compiler.hooks 注册事件监听器

### 实际示例

#### 1. 文件清理插件 - 构建前清理输出目录

```javascript
class CleanDistPlugin {
  constructor(options = {}) {
    this.options = {
      cleanOnceBeforeBuildPatterns: ['**/*'],
      ...options,
    };
  }

  apply(compiler) {
    const fs = require('fs');
    const path = require('path');

    compiler.hooks.beforeRun.tap('CleanDistPlugin', (compiler) => {
      const outputPath = compiler.options.output.path;
      if (fs.existsSync(outputPath)) {
        this.removeDirectory(outputPath);
        console.log('🧹 清理输出目录:', outputPath);
      }
    });
  }

  removeDirectory(dirPath) {
    const fs = require('fs');
    if (fs.existsSync(dirPath)) {
      fs.rmSync(dirPath, { recursive: true, force: true });
    }
  }
}
```

#### 2. 文件大小分析插件 - 分析打包文件大小

```javascript
class BundleAnalyzerPlugin {
  apply(compiler) {
    compiler.hooks.emit.tap('BundleAnalyzerPlugin', (compilation) => {
      const assets = compilation.assets;
      const analysis = {};

      for (const filename in assets) {
        const asset = assets[filename];
        analysis[filename] = {
          size: asset.size(),
          sizeInKB: (asset.size() / 1024).toFixed(2) + ' KB',
        };
      }

      console.table(analysis);

      // 可以将分析结果写入文件
      const analysisContent = JSON.stringify(analysis, null, 2);
      compilation.assets['bundle-analysis.json'] = {
        source: () => analysisContent,
        size: () => analysisContent.length,
      };
    });
  }
}
```

#### 3. 环境变量注入插件 - 注入环境配置

```javascript
class EnvironmentPlugin {
  constructor(envVars = {}) {
    this.envVars = envVars;
  }

  apply(compiler) {
    compiler.hooks.compilation.tap('EnvironmentPlugin', (compilation) => {
      compilation.hooks.processAssets.tap(
        {
          name: 'EnvironmentPlugin',
          stage: compilation.PROCESS_ASSETS_STAGE_ADDITIONS,
        },
        () => {
          const envContent = `window.__ENV__ = ${JSON.stringify(this.envVars)};`;

          compilation.assets['env-config.js'] = {
            source: () => envContent,
            size: () => envContent.length,
          };
        }
      );
    });
  }
}
```

#### 4. 代码注入插件 - 在代码中注入自定义内容

```javascript
class CodeInjectionPlugin {
  constructor(options = {}) {
    this.options = {
      banner: '',
      footer: '',
      ...options,
    };
  }

  apply(compiler) {
    compiler.hooks.compilation.tap('CodeInjectionPlugin', (compilation) => {
      compilation.hooks.processAssets.tap(
        {
          name: 'CodeInjectionPlugin',
          stage: compilation.PROCESS_ASSETS_STAGE_OPTIMIZE,
        },
        () => {
          Object.keys(compilation.assets).forEach((filename) => {
            if (filename.endsWith('.js')) {
              const asset = compilation.assets[filename];
              const originalSource = asset.source();
              const newSource = this.options.banner + '\n' + originalSource + '\n' + this.options.footer;

              compilation.assets[filename] = {
                source: () => newSource,
                size: () => newSource.length,
              };
            }
          });
        }
      );
    });
  }
}
```

## 常用钩子详解

### Compiler 钩子

```javascript
// 同步钩子
compiler.hooks.beforeRun.tap('PluginName', (compiler) => {});
compiler.hooks.run.tap('PluginName', (compiler) => {});
compiler.hooks.done.tap('PluginName', (stats) => {});

// 异步钩子
compiler.hooks.beforeCompile.tapAsync('PluginName', (params, callback) => {
  // 异步操作
  callback();
});

compiler.hooks.compile.tapPromise('PluginName', (params) => {
  return new Promise((resolve) => {
    // 异步操作
    resolve();
  });
});
```

### Compilation 钩子

```javascript
compilation.hooks.buildModule.tap('PluginName', (module) => {});
compilation.hooks.processAssets.tap('PluginName', () => {});
compilation.hooks.optimizeAssets.tap('PluginName', (assets) => {});
```

## 使用自定义插件

```javascript
// webpack.config.js
const MyWebpackPlugin = require('./plugins/MyWebpackPlugin');
const CleanDistPlugin = require('./plugins/CleanDistPlugin');

module.exports = {
  // ... 其他配置
  plugins: [
    new CleanDistPlugin(),
    new MyWebpackPlugin({
      option1: 'value1',
      option2: 'value2',
    }),
    new BundleAnalyzerPlugin(),
    new EnvironmentPlugin({
      NODE_ENV: process.env.NODE_ENV,
      API_URL: process.env.API_URL,
    }),
  ],
};
```

## 最佳实践

### 1. **错误处理**:使用 try-catch 并将错误推送到 compilation.errors

```javascript
class SafePlugin {
  apply(compiler) {
    compiler.hooks.emit.tap('SafePlugin', (compilation) => {
      try {
        // 插件逻辑
      } catch (error) {
        compilation.errors.push(new Error('SafePlugin: ' + error.message));
      }
    });
  }
}
```

### 2. **性能优化**: 只在必要时注册钩子，避免不必要的计算

```javascript
class PerformantPlugin {
  apply(compiler) {
    // 只在需要时注册钩子
    if (process.env.NODE_ENV === 'production') {
      compiler.hooks.emit.tap('PerformantPlugin', () => {
        // 生产环境逻辑
      });
    }
  }
}
```

### 3. **配置验证**:在构造函数中验证传入的选项

```javascript
class ValidatedPlugin {
  constructor(options = {}) {
    this.validateOptions(options);
    this.options = options;
  }

  validateOptions(options) {
    if (typeof options.requiredOption === 'undefined') {
      throw new Error('ValidatedPlugin: requiredOption is required');
    }
  }

  apply(compiler) {
    // 插件逻辑
  }
}
```

## 调试技巧

### 1. **日志输出**:使用日志输出和钩子监听来调试插件

```javascript
class DebugPlugin {
  apply(compiler) {
    compiler.hooks.emit.tap('DebugPlugin', (compilation) => {
      console.log('Assets:', Object.keys(compilation.assets));
      console.log('Modules:', compilation.modules.size);
    });
  }
}
```

### 2. **钩子监听**

```javascript
class HookListenerPlugin {
  apply(compiler) {
    // 监听所有钩子
    Object.keys(compiler.hooks).forEach((hookName) => {
      compiler.hooks[hookName].tap('HookListener', (...args) => {
        console.log(`Hook fired: ${hookName}`, args.length);
      });
    });
  }
}
```

## 总结

Webpack Plugin 通过事件驱动的方式为构建过程提供了强大的扩展能力。理解其工作原理和钩子系统，能够帮助我们开发出高效、可靠的自定义插件，满足项目的特定需求。

核心要点：

- Plugin 基于 Tapable 事件系统
- 通过 apply 方法注册钩子监听器
- 可以访问和修改 compilation 对象
- 支持同步和异步操作
- 需要注意错误处理和性能优化
