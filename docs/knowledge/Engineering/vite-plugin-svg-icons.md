---
title: vite-plugin-svg-icons
theme: solarized-dark
---

# vite-plugin-svg-icons

官方文档：https://github.com/vbenjs/vite-plugin-svg-icons/blob/main/README.zh_CN.md

## 一、插件核心价值与特性

**vite-plugin-svg-icons** 是一款专为 Vite 构建工具设计的 SVG 图标管理插件，其核心价值在于通过自动化雪碧图生成和组件化方案，解决前端项目中 SVG 图标管理混乱、重复请求等痛点。相较于传统图标方案，它具备以下优势：

### 1.性能优化

预生成雪碧图减少 HTTP 请求
内置缓存机制，仅当文件修改时重新生成
支持按需加载，降低初始包体积

### 2.开发体验提升

热更新（HMR）支持实时预览
组件化调用方式简化使用流程
自动类型提示（TypeScript 友好）

### 3.灵活配置

支持自定义 symbolId 命名规则（如 icon-[dir]-[name]）
可配置图标目录和 DOM 插入位置
兼容 Vue2/3、React 等多框架

## 二、完整实现方案

### 1. 环境准备

- Node.js ≥ v12.0
- Vite ≥ v2.0
- Vue3 推荐组合（支持 Vue2）

### 2. 安装与配置

```shell
yarn add vite-plugin-svg-icons -D
# or
npm i vite-plugin-svg-icons -D
# or
pnpm install vite-plugin-svg-icons -D
```

### 3.使用

- vite.config.ts 中的配置插件

  ```ts
  import { createSvgIconsPlugin } from 'vite-plugin-svg-icons'
  import path from 'path'

  export default () => {
    return {
      plugins: [
        createSvgIconsPlugin({
          // 指定需要缓存的图标文件夹
          iconDirs: [path.resolve(process.cwd(), 'src/icons')],
          // 定义生成的symbol ID格式，这里使用'icon-[dir]-[name]'格式
          // [dir]会被替换为图标所在目录名，[name]会被替换为图标文件名
          symbolId: 'icon-[dir]-[name]',

          /**
           * 自定义插入位置
           * @default: body-last
           */
          inject?: 'body-last' | 'body-first'

          /**
           * custom dom id
           * @default: __svg__icons__dom__
           */
          customDomId: '__svg__icons__dom__',
          // 配置SVGO选项，用于优化SVG文件
          svgoOptions: true,
        }),
      ],
    }
  }
  ```

- 在 src/main.ts 内引入注册脚本（**必须**）

```ts
import 'virtual:svg-icons-register';
```

- 目录规范建议

```
src/
├─ assets/
│  └─ icons/
│     ├─ common/      # 公共图标
│     │  ├─ home.svg
│     │  └─ user.svg
│     └─ feature/     # 功能模块图标
│        ├─ chart.svg
│        └─ report.svg
```

### 4.如何在组件使用

**定义 icon 组件：/src/components/SvgIcon.vue**

```vue
<script setup lang="ts">
const props = defineProps<{
  className?: string; // 继承文本颜色
  name: string; // 图标文件名
  color?: string; // 继承文本颜色
  size?: string; // 支持px/em单位
}>();

const iconName = computed(() => `#icon-${props.name}`);
const svgClass = computed(() => {
  if (props.className) {
    return `svg-icon ${props.className}`;
  }
  return 'svg-icon';
});
</script>

<template>
  <svg :class="svgClass" aria-hidden="true" :style="{ fontSize: size }">
    <use :xlink:href="iconName" :fill="color" />
  </svg>
</template>

<style scope lang="scss">
.sub-el-icon,
.nav-icon {
  position: relative;
  display: inline-block;
  margin-right: 12px;
  font-size: 15px;
}
.svg-icon {
  position: relative;
  width: 1em;
  height: 1em;
  vertical-align: -2px;
  fill: currentColor;
}
</style>
```

```vue
<!-- 基础用法 -->
<SvgIcon name="home" />

<!-- 尺寸颜色控制 -->
<SvgIcon name="chart" size="24px" color="#1890ff" />

<!-- 添加动画 -->
<SvgIcon name="loading" class="animate-spin" />
```

## 三、常见问题解决方案

### 1.图标不显示

- 检查 virtual:svg-icons-register 是否引入
- 确认 symbolId 命名规则与文件名一致
- 查看浏览器控制台是否有 404 错误
- 重启项目试试

### 2.样式冲突

```css
/* 重置默认样式 */
svg {
  outline: none;
  &:not([fill]) {
    fill: currentColor;
  }
}
```

### 3.动态图标方案

```vue
<script setup>
const iconName = ref('home');
// 通过API动态获取图标名
const fetchIcon = async () => {
  const res = await fetch('/api/current-icon');
  iconName.value = res.data.name;
};
</script>

<template>
  <SvgIcon :name="iconName" />
</template>
```

### 4.修改 svg 颜色不起作用

将引入的 svg 图片中的 fill 属性给删除掉
