---
title: Vite minifont优化字体插件
theme: solarized-dark
---

# Vite minifont 优化字体插件

## 一、背景

为了统一公司界面风格，我们选用了 思源黑体 作为全局字体。UI 提供的原始字体文件 `SourceHanSansCN-Medium.ttf` 体积接近 8MB，在页面首次加载时会显著影响性能。
为此，我们基于 `minifont` 开发了一个 Vite 自定义插件，对字体进行子集化处理，只保留实际使用到的字符，从而大幅减小字体体积，提升页面加载速度和用户体验。

## 二、优化方案：Fontmin

[Fontmin](https://github.com/ecomfe/fontmin) 是一个基于 Node.js 的 字体子集化工具，可以从原始字体文件中提取出页面实际使用到的字符，生成 最小化的字体文件（如 woff2、woff 或 ttf），从而减少字体体积，提高网页加载速度。

**主要特点**：

1. **减小字体文件体积**：去掉未使用的字符，字体文件体积可从几 MB 压缩到几百 KB。 
2.  **支持多种字体格式**：支持 OTF/TTF 转 WOFF/WOFF2，并可直接生成 Web 友好的格式。 
3. **可集成构建工具**：可与 Webpack、Vite、Gulp 等工具集成，自动在构建阶段生成子集字体。 
4. **可定制化**：可以根据自定义文本、文件内容或 glob 模式扫描项目源码生成字体。 
5. **可选优化功能**：支持移除 hinting、压缩字形、合并字体等操作，进一步减小文件体积。

## 三、Vite插件开发

**核心设计理念**

```text
原始字体文件 → 文本内容扫描 → 字符子集化 → 格式转换 → 智能缓存 → 输出优化字体
```

### 1. 初始化配置

```ts
// 用户配置
fontminPlugin({
  fontPath: string; // 原始字体路径
  distPath: string; // 输出字体路径
  textSource: string; // 需要提取的文本文件路径（比如打包后的 HTML / 词库）
  cacheEnabled?: boolean; // 是否启用缓存
  fontDisplay?: string; // font-display 属性值
  hinting?: boolean; // 是否保留 hinting （保证小字体是否更清晰，但文件体积会大一点）
})
```

### 2.检查字体文件是否存在

```ts
if (!fs.existsSync(fontPath)) {
  console.error(` [fontmin] 字体文件不存在: ${fontPath}`);
  return;
}
```

### 3.读取文本内容

**两种文本源处理方式**

- 如果 `textSource`是单个文件，直接读取
- 如果 `textSource` 是 `src/**/\*.vue` 这种模式，用node提供的 glob 找出所有 Vue 文件，然后逐个读取里面的文本。

```ts
let textContent: string;

//  如果 textSource 是单个文件，直接读取
if (fs.existsSync(textSource)) {
  textContent = fs.readFileSync(textSource, 'utf-8');
} else {
  // 如果 textSource 是 src/**/*.vue 这种模式，用 glob 找出所有 Vue 文件，然后逐个读取里面的文本。
  const patterns = [textSource];
  textContent = extractTextFromFiles(patterns);
}
```

```ts
// glob模式提取文本内容
function extractTextFromFiles(patterns: string[]): string {
  let text = '';
  patterns.forEach((pattern) => {
    try {
      const files = glob.sync(pattern);
      files.forEach((file) => {
        const content = fs.readFileSync(file, 'utf-8');
        text += content;
      });
    } catch (error) {
      console.warn(` [fontmin] 扫描文件失败: ${pattern}`, error);
    }
  });
  return text;
}
```

**扫描过程**：

- 使用 glob.sync() 匹配文件模式

- 逐个读取文件内容

- 累加所有文本内容

- 错误处理确保流程不中断

### 4.缓存机制

将生成的文件采用hash值命名，如果再次检查先从缓存里检查，如果缓存里有跳过生成文件。

```ts
// 基于内容生成哈希值
const hash = hashContent(textContent);
const cacheFile = path.resolve(distPath, `${hash}.woff2`);

// 缓存检查
if (cacheEnabled && fs.existsSync(cacheFile)) {
  console.log('使用缓存字体:', path.basename(cacheFile));
  return; // 跳过生成过程
}
```

```ts
// 生成hash
function hashContent(content: string): string {
  return crypto.createHash('md5').update(content).digest('hex').substring(0, 8);
}
```

**缓存策略**：

- 哈希算法：`MD5` 生成 8 位哈希值

- 缓存键：基于文本内容变化自动更新

- 性能提升：避免重复生成相同字体

### 5.字体子集化处理

```ts
const fontmin = new Fontmin()
  .src(fontPath) // 源字体文件
  .use(
    Fontmin.glyph({
      // 子集化处理器
      text: textContent, // 要保留的文本
      hinting: hinting, // hinting控制
    })
  )
  .use(Fontmin.ttf2woff2()) // 格式转换
  .dest(distPath); // 输出目录

  await new Promise<void>((resolve, reject) => {
    fontmin.run((err, files) => {
      if (err) {
        console.error(' [fontmin] 字体生成失败:', err);
        return reject(err);
      }

      // 重命名文件为 hash.woff2，并创建固定名称的副本
      files.forEach((file: any) => {
        const hashFile = path.resolve(distPath, `${hash}.woff2`);
        const fixedNameFile = path.resolve(distPath, 'SourceHanSansCN-Medium.woff2');

        try {
          if (file.path && fs.existsSync(file.path)) {
            // 先重命名为哈希值文件
            fs.renameSync(file.path, hashFile);

            // 再创建一个固定名称的副本，用于 CSS 引用
            fs.copyFileSync(hashFile, fixedNameFile);

            console.log(' [fontmin] 创建固定名称字体文件:', 'SourceHanSansCN-Medium.woff2');
          }
        } catch (error) {
          console.warn(' [fontmin] 文件操作失败:', error);
        }
      });

      console.log(' [fontmin] 子集字体生成完成:', `${hash}.woff2`);
      resolve();
    });
  });
```

处理流程：

- 字体子集化：只保留实际使用的字符

- 格式转换：TTF → WOFF2（体积减少 30-50%）

- 异步处理：使用 Promise 处理字体生成，创建固定名称的副本方便使用

## 四、使用

在`vite.config.js`中：

```js
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import fontminPlugin from './plugin/vite-plugin-fontmin';

export default defineConfig({
  plugins: [
    vue(),
    fontminPlugin({
      fontPath: 'src/assets/fonts/SourceHanSansCN-Medium.ttf', // 原始字体文件
      distPath: 'public/fonts', // 输出目录
      textSource: 'src/**/*.{vue,ts,js,tsx,jsx,html}', // 扫描文本的文件范围
      cacheEnabled: true, // 启用缓存
      fontDisplay: 'swap', // 字体显示方式
      hinting: false, // 不保留 hinting
    }),
  ],
});
```

在`style.css`里全局定义字体：

```css
@font-face {
  font-family: 'MyFont';
  src: url('/fonts/SourceHanSansCN-Medium.woff2') format('woff2');
  font-display: swap;
}
```

## 五、完整代码

```ts
// vite-plugin-fontmin.js
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import Fontmin from 'fontmin';
import { glob } from 'glob';

interface FontminOptions {
  fontPath: string; // 原始字体路径
  distPath: string; // 输出字体路径
  textSource: string; // 需要提取的文本文件路径（比如打包后的 HTML / 词库）
  cacheEnabled?: boolean; // 是否启用缓存
  fontDisplay?: string; // font-display 属性值
  hinting?: boolean; // 是否保留 hinting （保证小字体是否更清晰，但文件体积会大一点）
}

// 生成hash
function hashContent(content: string): string {
  return crypto.createHash('md5').update(content).digest('hex').substring(0, 8);
}

// glob模式提取文本内容
function extractTextFromFiles(patterns: string[]): string {
  let text = '';
  patterns.forEach((pattern) => {
    try {
      const files = glob.sync(pattern);
      files.forEach((file) => {
        const content = fs.readFileSync(file, 'utf-8');
        text += content;
      });
    } catch (error) {
      console.warn(` [fontmin] 扫描文件失败: ${pattern}`, error);
    }
  });
  return text;
}

export default function fontminPlugin(options: FontminOptions) {
  const { fontPath, distPath, textSource, cacheEnabled = true, fontDisplay = 'swap', hinting = false } = options;

  return {
    name: 'vite-plugin-fontmin',

    async configResolved() {
      // 配置解析完成后执行，确保配置已确定
      console.log(` [fontmin] 配置信息:
        - 字体源: ${fontPath}
        - 输出目录: ${distPath}
        - 文本源: ${textSource}
        - 缓存: ${cacheEnabled ? '启用' : '禁用'}
        - 字体显示: ${fontDisplay}
      `);
    },

    async buildStart() {
      try {
        console.log(' [fontmin] 开始字体子集化...');

        // 1.检查字体文件是否存在
        if (!fs.existsSync(fontPath)) {
          console.error(` [fontmin] 字体文件不存在: ${fontPath}`);
          return;
        }

        // 2. 读取文本内容
        let textContent: string;

        //  如果 textSource 是单个文件，直接读取
        if (fs.existsSync(textSource)) {
          textContent = fs.readFileSync(textSource, 'utf-8');
        } else {
          // 如果 textSource 是 src/**/*.vue 这种模式，用 glob 找出所有 Vue 文件，然后逐个读取里面的文本。
          const patterns = [textSource];
          textContent = extractTextFromFiles(patterns);
        }

        if (!textContent || textContent.trim().length === 0) {
          console.warn(' [fontmin] 未找到文本内容，跳过字体子集化');
          return;
        }

        // 基于内容生成哈希值
        const hash = hashContent(textContent);
        const cacheFile = path.resolve(distPath, `${hash}.woff2`);

        // 缓存检查
        if (cacheEnabled && fs.existsSync(cacheFile)) {
          console.log('✨ [fontmin] 使用缓存字体:', path.basename(cacheFile));
          return;
        }

        console.log(' [fontmin] 生成新的子集字体...');

        // 确保输出目录存在
        fs.mkdirSync(distPath, { recursive: true });

        const fontmin = new Fontmin()
          .src(fontPath) // 源字体文件
          .use(
            Fontmin.glyph({
              // 子集化处理器
              text: textContent, // 要保留的文本
              hinting: hinting, // hinting控制
            })
          )
          .use(Fontmin.ttf2woff2()) // 格式转换
          .dest(distPath); // 输出目录

        await new Promise<void>((resolve, reject) => {
          fontmin.run((err, files) => {
            if (err) {
              console.error(' [fontmin] 字体生成失败:', err);
              return reject(err);
            }

            // 重命名文件为 hash.woff2，并创建固定名称的副本
            files.forEach((file: any) => {
              const hashFile = path.resolve(distPath, `${hash}.woff2`);
              const fixedNameFile = path.resolve(distPath, 'SourceHanSansCN-Medium.woff2');

              try {
                if (file.path && fs.existsSync(file.path)) {
                  // 先重命名为哈希值文件
                  fs.renameSync(file.path, hashFile);

                  // 再创建一个固定名称的副本，用于 CSS 引用
                  fs.copyFileSync(hashFile, fixedNameFile);

                  console.log(' [fontmin] 创建固定名称字体文件:', 'SourceHanSansCN-Medium.woff2');
                }
              } catch (error) {
                console.warn(' [fontmin] 文件操作失败:', error);
              }
            });

            console.log(' [fontmin] 子集字体生成完成:', `${hash}.woff2`);
            resolve();
          });
        });
      } catch (error) {
        console.error(' [fontmin] 插件执行失败:', error);
      }
    },
  };
}

```

