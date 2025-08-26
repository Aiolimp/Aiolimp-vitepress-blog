---
title: 003 webpack Loader
theme: solarized-dark
---

# Webpack Loader

## 简介

Webpack Loader 是 webpack 的核心功能之一，用于对模块的源代码进行转换。Loader 可以将文件从不同的语言（如 TypeScript）转换为 JavaScript，或将内联图像转换为 data URL。简单来说，Loader 就是一个导出函数的 Node.js 模块。

## Loader 与 Plugin 的区别

| 特性     | Loader         | Plugin             |
| -------- | -------------- | ------------------ |
| 作用对象 | 单个文件       | 整个构建过程       |
| 执行时机 | 文件加载时     | 构建生命周期各阶段 |
| 功能定位 | 文件转换       | 功能扩展、资源优化 |
| 配置方式 | `module.rules` | `plugins` 数组     |
| 返回值   | 转换后的代码   | 无返回值           |

## Loader 工作原理

### 1. **转换流程**

```
源文件 → Loader1 → Loader2 → Loader3 → 最终代码
```

### 2. **执行顺序**

- Loader 按照**从右到左**、**从下到上**的顺序执行
- 前一个 Loader 的输出作为下一个 Loader 的输入

### 3. **核心概念**

```javascript
// Loader 本质上是一个函数
function myLoader(source) {
  // source 是文件内容字符串
  // 返回转换后的代码
  return transformedSource;
}
```

## 自定义 Loader 开发

### 基本结构

```javascript
// my-loader.js
module.exports = function (source) {
  // this 指向 webpack 的 loader context
  const options = this.getOptions() || {};

  // 进行转换
  const transformedSource = transform(source, options);

  // 返回转换后的代码
  return transformedSource;
};

function transform(source, options) {
  // 具体的转换逻辑
  return source;
}
```

### 核心 API

#### 1. **this.getOptions()**

获取传递给 loader 的选项

```javascript
module.exports = function (source) {
  const options = this.getOptions() || {};
  console.log('Loader options:', options);
  return source;
};
```

#### 2. **this.callback()**

返回多个结果（包括 source map）

```javascript
module.exports = function (source) {
  // this.callback(err, content, sourceMap, meta)
  this.callback(null, transformedSource, sourceMap);
};
```

#### 3. **this.async()**

异步处理

```javascript
module.exports = function (source) {
  const callback = this.async();

  someAsyncOperation(source, (err, result) => {
    if (err) return callback(err);
    callback(null, result);
  });
};
```

#### 4. **this.resourcePath**

当前处理文件的绝对路径

```javascript
module.exports = function (source) {
  console.log('Processing file:', this.resourcePath);
  return source;
};
```

## 实际示例

### 1. 简单的文本替换 Loader - 基于正则表达式替换内容

```javascript
// replace-loader.js
const { getOptions } = require('loader-utils');

module.exports = function (source) {
  const options = getOptions(this) || {};
  const { search, replace = '' } = options;

  if (search) {
    return source.replace(new RegExp(search, 'g'), replace);
  }

  return source;
};
```

使用方式：

```javascript
// webpack.config.js
module.exports = {
  module: {
    rules: [
      {
        test: /\.txt$/,
        use: [
          {
            loader: './loaders/replace-loader.js',
            options: {
              search: 'Hello',
              replace: 'Hi',
            },
          },
        ],
      },
    ],
  },
};
```

### 2. SON 转换 Loader - 将 JSON 转换为 ES6 模块

```javascript
// json-loader.js
module.exports = function (source) {
  try {
    const data = JSON.parse(source);

    // 转换为 ES6 模块
    return `export default ${JSON.stringify(data, null, 2)};`;
  } catch (error) {
    this.emitError(new Error(`JSON parse error: ${error.message}`));
    return 'export default {};';
  }
};
```

### 3. 文件大小检查 Loader - 检查文件大小并发出警告

```javascript
// size-limit-loader.js
module.exports = function (source) {
  const options = this.getOptions() || {};
  const maxSize = options.maxSize || 1024 * 1024; // 默认 1MB

  if (source.length > maxSize) {
    this.emitWarning(new Error(`File size (${source.length} bytes) exceeds limit (${maxSize} bytes)`));
  }

  return source;
};
```

### 4. 版权信息 Loader - 为 JS 文件添加版权声明

```javascript
// copyright-loader.js
module.exports = function (source) {
  const options = this.getOptions() || {};
  const copyright = options.copyright || '// Copyright notice';

  // 只对 JS 文件添加版权信息
  if (this.resourcePath.endsWith('.js')) {
    return `${copyright}\n${source}`;
  }

  return source;
};
```

### 5. 环境变量替换 Loader - 替换代码中的环境变量占位符

```javascript
// env-loader.js
module.exports = function (source) {
  const options = this.getOptions() || {};
  const env = options.env || process.env;

  // 替换 __ENV_VARIABLE__ 格式的环境变量
  return source.replace(/__(\w+)__/g, (match, envName) => {
    const value = env[envName];
    return value !== undefined ? JSON.stringify(value) : match;
  });
};
```

### 6. 异步文件处理 Loader - 异步读取配置文件并处理

```javascript
// async-file-loader.js
const fs = require('fs').promises;
const path = require('path');

module.exports = function (source) {
  const callback = this.async();
  const options = this.getOptions() || {};

  processFileAsync(source, this.resourcePath, options)
    .then((result) => callback(null, result))
    .catch((err) => callback(err));
};

async function processFileAsync(source, filePath, options) {
  try {
    // 异步读取相关文件
    const configPath = path.join(path.dirname(filePath), 'config.json');
    const config = await fs.readFile(configPath, 'utf8');
    const configData = JSON.parse(config);

    // 根据配置处理源码
    return processWithConfig(source, configData, options);
  } catch (error) {
    // 如果配置文件不存在，使用默认处理
    return source;
  }
}

function processWithConfig(source, config, options) {
  // 具体的处理逻辑
  return source;
}
```

## 高级特性

### 1. **Raw Loader**

- 处理二进制文件，接收 Buffer 对象
- 设置 module.exports.raw = true

```javascript
// binary-loader.js
module.exports = function (content) {
  // content 是 Buffer 对象
  const base64 = content.toString('base64');
  return `module.exports = "data:application/octet-stream;base64,${base64}";`;
};

// 标记为 raw loader
module.exports.raw = true;
```

### 2. **Pitching Loader**

- 在正常执行前运行的 pitch 阶段
- 可以跳过后续 Loader 的执行

```javascript
// pitching-loader.js
module.exports = function (source) {
  return source;
};

module.exports.pitch = function (remainingRequest, precedingRequest, data) {
  // pitch 阶段执行的逻辑
  // 如果返回值，会跳过后续的 loader
  if (shouldSkip()) {
    return 'module.exports = "skipped";';
  }
};
```

### 3. **缓存优化**

```javascript
// cacheable-loader.js
module.exports = function (source) {
  // 启用缓存
  this.cacheable && this.cacheable();

  const result = expensiveTransform(source);
  return result;
};
```

## Loader 配置详解

### 1. **基本配置**

```javascript
module.exports = {
  module: {
    rules: [
      {
        test: /\.special$/,
        use: [
          {
            loader: './my-loader.js',
            options: {
              option1: 'value1',
              option2: 'value2',
            },
          },
        ],
      },
    ],
  },
};
```

### 2. **多个 Loader 链式调用**

```javascript
module.exports = {
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          'style-loader', // 3. 将 CSS 插入到 DOM
          'css-loader', // 2. 解析 CSS
          'postcss-loader', // 1. 处理 CSS 预处理
        ],
      },
    ],
  },
};
```

### 3. **条件加载**

```javascript
module.exports = {
  module: {
    rules: [
      {
        test: /\.js$/,
        include: path.resolve(__dirname, 'src'),
        exclude: /node_modules/,
        use: [
          {
            loader: './my-loader.js',
            options: {
              development: process.env.NODE_ENV === 'development',
            },
          },
        ],
      },
    ],
  },
};
```

## 调试和测试

### 1. **调试技巧**

```javascript
// debug-loader.js
module.exports = function (source) {
  console.log('File path:', this.resourcePath);
  console.log('Source length:', source.length);
  console.log('Options:', this.getOptions());

  // 开发时输出源码片段
  if (process.env.NODE_ENV === 'development') {
    console.log('Source preview:', source.substring(0, 100));
  }

  return source;
};
```

### 2. **单元测试**

```javascript
// my-loader.test.js
const loader = require('./my-loader.js');

describe('my-loader', () => {
  test('should transform source correctly', () => {
    const mockContext = {
      getOptions: () => ({ option: 'value' }),
    };

    const source = 'console.log("Hello");';
    const result = loader.call(mockContext, source);

    expect(result).toContain('transformed');
  });
});
```

### 3. **集成测试**

```javascript
// webpack-test.js
const webpack = require('webpack');
const path = require('path');

const config = {
  entry: './test/fixtures/input.js',
  output: {
    path: path.resolve(__dirname, 'test/output'),
    filename: 'bundle.js',
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        use: './my-loader.js',
      },
    ],
  },
};

webpack(config, (err, stats) => {
  if (err || stats.hasErrors()) {
    console.error('Build failed');
  } else {
    console.log('Build successful');
  }
});
```

## 最佳实践

### 1. **错误处理**

```javascript
module.exports = function (source) {
  try {
    return transform(source);
  } catch (error) {
    this.emitError(new Error(`Loader error: ${error.message}`));
    return source;
  }
};
```

### 2. **性能优化**

```javascript
module.exports = function (source) {
  // 启用缓存
  this.cacheable && this.cacheable();

  // 避免不必要的转换
  if (!needsTransform(source)) {
    return source;
  }

  return transform(source);
};
```

### 3. **选项验证**

```javascript
const { validate } = require('schema-utils');

const schema = {
  type: 'object',
  properties: {
    option1: { type: 'string' },
    option2: { type: 'boolean' },
  },
  required: ['option1'],
};

module.exports = function (source) {
  const options = this.getOptions();

  validate(schema, options, {
    name: 'My Loader',
    baseDataPath: 'options',
  });

  return transform(source, options);
};
```

## 总结

Webpack Loader 是模块转换的核心机制，通过链式调用实现复杂的文件处理流程。掌握 Loader 的开发能够帮助我们：

- 处理特殊格式的文件
- 实现代码转换和优化
- 集成第三方工具和库
- 自定义构建流程

**核心要点：**

- Loader 本质是一个转换函数
- 支持同步和异步处理
- 可以通过链式调用组合功能
- 提供丰富的 API 访问构建上下文
- 需要注意错误处理和性能优化
