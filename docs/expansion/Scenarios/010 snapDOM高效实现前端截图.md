---
title: 010 snapDOM高效实现前端截图
theme: solarized-dark
---

# snapDOM 高效实现前端截图

在日常业务开发里，**DOM 截图** 几乎是刚需场景。

无论是生成分享卡片、导出报表，还是保存一段精美排版内容，前端同学都绕不开它。

但问题来了——市面上的截图工具，比如 html2canvas，虽然用得多，却有一个致命缺陷：慢！ 普通截图动辄 1 秒以上，大一点的 DOM，甚至能直接卡到怀疑人生，用户体验一言难尽。

最近发现一个保存速度惊艳到我的库**snapDOM** 。

这货在性能上的表现，完全可以用“碾压”来形容：

- 👉 相比 html2canvas，快 32 ~ 133 倍
- 👉 相比 modern-screenshot，也快 2 ~ 93 倍

以下是官方基本测试数据：

| 场景                   | snapDOM vs html2canvas | snapDOM vs dom-to-image |
| :--------------------- | :--------------------- | :---------------------- |
| 小元素 (200×100)       | 32 倍                  | 6 倍                    |
| 模态框 (400×300)       | 33 倍                  | 7 倍                    |
| 整页截图 (1200×800)    | 35 倍                  | 13 倍                   |
| 大滚动区域 (2000×1500) | 69 倍                  | 38 倍                   |
| 超大元素 (4000×2000)   | **93 倍 🔥**            | **133 倍**              |

📊 数据来源：snapDOM 官方 benchmark（基于 headless Chromium 实测）。

## 一、为什么它这么快？

二者的实现原理不同

### 1. **html2canvas 的实现方式**

- 原理： 通过遍历 DOM，把每个节点的样式（宽高、字体、背景、阴影、图片等）计算出来，然后在 `<canvas> `上用 Canvas API 重绘一遍。
- 特点：
  - 需要完整计算 CSS 样式 → 排版 → 绘制。
  - 复杂 DOM 时计算量极大，比如渐变、阴影、字体渲染都会消耗 CPU。
  - 整个过程基本是 模拟浏览器的渲染引擎，属于“重造轮子”。

所以一旦 DOM 大、样式复杂，html2canvas 很容易出现 1s+ 延迟甚至卡死。

### 2. **snapDOM 的实现方式**

原理：**利用浏览器 原生渲染能力，而不是自己模拟**。

snapDOM 的 `captureDOM` 并不是自己用 `Canvas API` 去一笔一笔绘制 DOM（像 html2canvas 那样），而是：

1. 复制 DOM 节点（prepareClone）
   - → 生成一个“克隆版”的 DOM，里面包含了样式、结构。
2. 把图片、背景、字体都转成 inline（base64 / dataURL）
   - → 确保克隆 DOM 是完全自包含的。
3. 用 `<foreignObject>` 包在 SVG 里面
   - → 浏览器原生支持直接渲染 HTML 片段到 SVG → 再转成 dataURL。

所以核心就是： 👉 **利用浏览器自己的渲染引擎（SVG foreignObject）来排版和绘制，而不是 JS 重造渲染过程**。

## 二、如何使用 snapDOM

snapDOM 上手非常简单， 学习成本比较低。

### **1. 安装**

通过npm 安装：

```js
npm install @zumer/snapdom
```

或者直接用 CDN 引入：

```js
<script src="https://cdn.jsdelivr.net/npm/@zumer/snapdom/dist/snapdom.min.js"></script>
```

### **2. 基础用法**

只需要一行代码，就能把 DOM 节点“变”成图片：

```js
// 选择你要截图的 DOM 元素
const target = document.querySelector('.card');

// 导出为 PNG 图片
const image = await snapdom.toPng(target);

// 直接添加到页面
document.body.appendChild(image);
```

### **3. 更多导出方式**

除了 PNG，snapDOM 还支持多种输出格式：

```js
// 导出为 JPEG
const jpeg = await snapdom.toJpeg(target);

// 导出为 SVG
const svg = await snapdom.toSvg(target);

// 直接保存为文件
await snapdom.download(target, { format: 'png', filename: 'screenshot.png' });
```

开发中生成海报并保存到， 是非常常见的需求，以前使用html2canvas，也要写不少代码， 还要处理图片失真等问题， 使用snapDOM，真的一行代码能搞定。

```js
 <div ref="posterRef" class="poster">
   ....
</div>

<script setup lang="ts">
  const downloadPoster = async () => {
    if (!posterRef.value) {
        alert("海报元素未找到");
        return;
    }

    try {
        // snapdom 是 UMD 格式，通过全局 window.snapdom 访问
        const snap = (windowas any).snapdom;
        if (!snap) {
            alert("snapdom 库未加载，请刷新页面重试");
            return;
        }
        await snap.download(posterRef.value, {
            format: "png",
            filename: `tech-poster-${Date.now()}`
        });


    } catch (error) {
        console.error("海报生成失败:", error);
        alert("海报生成失败，请重试");
    }
};
</script>
```

相比传统方案需要大量配置和兼容性处理，snapDOM 真正做到了 **一行代码，极速生成**。无论是分享卡片、营销海报还是报表导出，都能轻松搞定。

## **总结**

在前端开发里，DOM 截图是一个常见但“让人头疼”的需求。

- html2canvas 代表的传统方案，虽然功能强大，但性能和体验常常拖后腿；
- 而 snapDOM 借助浏览器原生渲染能力，让截图变得又快又稳。

一句话： 👉 如果你还在为截图慢、卡顿、模糊烦恼，不妨试试 snapDOM —— 可能会刷新你对前端截图的认知。 🚀
