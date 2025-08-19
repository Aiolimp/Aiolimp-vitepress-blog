---
title: qiankun常见问题及解决方案
theme: solarized-dark
---

# qiankun 常见问题及解决方案

## 一、**什么是微前端？为什么需要 qiankun？**

- 微前端借鉴了微服务的思想，把前端大应用拆分成多个独立子应用，解决了 **单体应用臃肿、版本升级困难、技术栈难统一** 的问题。
- 传统 iframe 虽然能隔离，但体验差。qiankun 提供了 **无刷新切换、应用沙箱、样式隔离、资源预加载** 等能力，让多团队协作和技术栈共存更顺畅。

## 二、**qiankun 和 single-spa 的关系是什么？**

### 1. single-spa

- **single-spa** 是微前端的基础框架，其核心思想是将不同框架的 SPA 聚合成整体应用。

#### 核心架构

- **主应用**：负责注册微应用、路由管理、提供容器
- **微应用**：提供生命周期函数、独立运行能力

#### 运行机制

```ts
// 1. 注册微应用
registerApplication({
  name: 'vue-app',
  app: () => import('./vue-app/main.js'),
  activeWhen: '/vue',
  customProps: { container: 'micro-app-container' },
});

// 2. 启动框架
start();
```

#### 生命周期管理

```ts
export async function bootstrap() {
  /* 应用初始化 */
}
export async function mount(props) {
  /* 应用挂载 */
}
export async function unmount(props) {
  /* 应用卸载 */
}
```

#### 路由监听机制

- 监听 `hashchange` 和 `popstate` 事件
- 重写 `history.pushState` 和 `history.replaceState`
- 手动创建和分发 `popstate` 事件
- 延迟执行机制避免事件冲突

### 2.qiankun

- **qiankun** 是对 single-spa 的二次封装，提供了更完善的微前端解决方案。

- **qiankun** 基于 single-spa，增强了：

1. **应用加载**（`import-html-entry` 动态加载 HTML/JS/CSS）。
2. **JS 沙箱隔离**（`proxy` 沙箱）。
3. **样式隔离**（Shadow DOM / scoped CSS）。
4. **预加载、全局通信**等工程能力。（开启`prefetch`实现预加载）。

- 总结：single-spa 是“内核”，qiankun 是“工程化落地方案”。

## **三、 qiankun 是如何加载子应用的？**

### 1.**主应用如何注册子应用**

主应用通过 `registerMicroApps` 注册子应用

```ts
registerMicroApps([
  {
    name: 'subApp', // 子应用名称
    entry: '//localhost:7100', // 子应用入口地址
    container: '#subapp', // 子应用挂载的 DOM 容器
    activeRule: '/subapp', // 什么时候激活（路由规则）
  },
]);
```

### 2. 加载子应用的流程

#### 2.1 触发激活

- 当浏览器 URL 匹配到子应用的 `activeRule`，qiankun 判断子应用需要被加载。

#### 2.2 拉取 HTML

- 调用 **import-html-entry**（qiankun 内部依赖库），去请求 entry 地址的 HTML。
- 把 HTML 中的内容解析出来：
  - **模板 HTML**（body 内容）
  - **script 脚本**（包括 entry js）
  - **style 样式**（link/style 标签）

```ts
import { importEntry } from 'import-html-entry';

const { template, execScripts, getExternalScripts } = await importEntry('//localhost:7100');
```

### 2.3 注入 DOM

- qiankun 把子应用的 HTML 模板插入到 container 容器里。
- 同时收集 `<style>` / `<link>` 标签，按样式隔离策略处理（例如 Shadow DOM、加 scope 前缀）。

### 2.4 执行脚本

- 执行子应用的 JS 脚本（在沙箱环境下）。

- 脚本里通常会导出 3 个生命周期方法：

  ```ts
  export async function bootstrap(props) {
    console.log('子应用初始化')
  }

  export async function mount(props) {
    console.log('子应用挂载')
    render(props.container)
  }

  export async function unmount(props) {
    console.log('子应用卸载')
    ReactDOM.unmountComponentAtNode(props.container)
  ```

  主应用通过 registerMicroApps 注册子应用（配置 entry、container、activeRule）。

### 3.**整体执行顺序**

1. **主应用路由切换** → 判断子应用是否要激活
2. **加载子应用 HTML**（fetch + 解析）
3. **挂载容器 DOM**（插入 template）
4. **沙箱执行 JS 脚本**（暴露生命周期）
5. **调用 bootstrap → mount → unmount**

## **四、qiankun 的沙箱原理是什么？**

### 1.**为什么需要沙箱**

在微前端里，不同子应用都是 **独立项目**，但它们最后都运行在同一个浏览器里。

会出现的问题：

- **全局变量冲突**：子应用 A 把 window.name 改了，子应用 B 用不了。
- **样式冲突**：A 的 CSS 覆盖了 B。
- **全局事件冲突**：A 注册的事件可能误伤 B。

所以 qiankun 必须“隔离”环境，避免互相污染。

### 2.`JS`沙箱

- 利用 **ES6 Proxy** 劫持对 `window` 的访问。
- 每个子应用会得到一个代理过的 `window`，子应用改了 window.abc，不会影响别的子应用。

```ts
const fakeWindow = {};
const proxy = new Proxy(window, {
  get(target, key) {
    return key in fakeWindow ? fakeWindow[key] : target[key];
  },
  set(target, key, value) {
    fakeWindow[key] = value; // 写在子应用私有空间
    return true;
  },
});
```

### 3.**`CSS` 沙箱**

1. **严格模式**：通过 Shadow DOM 或 Scoped CSS（需要配合构建工具），让样式只作用于子应用范围。
2. **动态样式隔离**：子应用卸载时，qiankun 会自动移除它注入的 `<style>` 和 `<link>` 标签。

## **五、 主应用和子应用如何通信？**

### 1.主应用与子应用通信

#### Props 传递

- 主应用注册时，通过`props`传递方法和数据，子应用在`mount`声明周期接收`props`。

```ts
// 主应用
registerMicroApps([
  {
    name: 'vue-app',
    entry: 'http://localhost:8080',
    props: {
      data: { user: 'admin' },
      methods: { onRouteChange: handleRouteChange },
    },
  },
]);

// 子应用
export async function mount(props) {
  console.log(props.data.user); // 'admin'
  props.methods.onRouteChange('/new-route');
}
```

#### Actions 通信

- 在主应用里通过`initGlobalState`创建`actions`，子应用里通过`onGlobalStateChange`监听主应用传递的参数变化。

```ts
// 主应用
import { initGlobalState } from 'qiankun';

const actions = initGlobalState({
  user: 'admin',
  permissions: ['read', 'write'],
});

// 子应用
export async function mount(props) {
  props.onGlobalStateChange((state, prev) => {
    console.log('状态变更:', state, prev);
  });

  props.setGlobalState({ user: 'new-user' });
}
```

### 2.子应用间通信

- 在主应用里写一个事件总线（如 `mitt`、`Node.js EventEmitter`），子应用通过 props 拿到这个 bus，就能互相触发和监听事件。

```ts
// 主应用
import mitt from 'mitt';
const emitter = mitt();

registerMicroApps([
  {
    name: 'subApp1',
    entry: '//localhost:7100',
    container: '#subapp-viewport',
    activeRule: '/subapp1',
    props: { emitter },
  },
  {
    name: 'subApp2',
    entry: '//localhost:7200',
    container: '#subapp-viewport',
    activeRule: '/subapp2',
    props: { emitter },
  },
]);

// 子应用1
props.emitter.emit('sendMsg', { from: 'subApp1', msg: 'hello subApp2' });

// 子应用2
props.emitter.on('sendMsg', (data) => {
  console.log('收到消息:', data);
});
```

## **六、 qiankun 如何做样式隔离？**

### 1.**qiankun 提供的样式隔离机制**

通过`start`方法启动`qiankun`的时候在`standbox`里添加`strictStyleIsolation`和`experimentalStyleIsolation`

```ts
 sandbox: {
   strictStyleIsolation: true, // 开启严格样式隔离
   experimentalStyleIsolation: true // 实验性样式隔离,加前缀
 }
```

- **strictStyleIsolation：**为子应用开启`Shadow DOM`，彻底隔离（但不支持全局样式）。
- **experimentalStyleIsolation**：在子应用样式上 **加前缀**（scope 作用域），类似 `css-modules` 或 `vue scoped` 的效果。（不是 100%隔离）

### 2. 动态样式表管理

```ts
// 微应用激活时
function addMicroAppStyles(microAppName, styles) {
  styles.forEach((style) => {
    const styleElement = document.createElement('style');
    styleElement.setAttribute('data-qiankun-app', microAppName);
    styleElement.textContent = style;
    document.head.appendChild(styleElement);
  });
}

// 微应用卸载时
function removeMicroAppStyles(microAppName) {
  const styles = document.querySelectorAll(`[data-qiankun-app="${microAppName}"]`);
  styles.forEach((style) => style.remove());
}
```

- qiankun 默认会在子应用加载时，把它的 `<style>` / `<link>` 标签记录下来。
- 卸载子应用时，**自动移除对应的样式**，避免残留影响主应用或其他子应用。

### 3.CSS 隔离策略

#### 3.1. Scoped CSS

```css
// Vue 组件
<style scoped>
.container { color: red; }
</style>

// 编译后
<style>
.container[data-v-123] { color: red; }
</style>
```

#### 3.2. CSS Modules

```css
// styles.module.css
.container {
  color: red;
}

// 组件中
import styles from './styles.module.css';
<div className={styles.container}>Content</div>
```

#### 3.3. CSS-in-JS

```css
const StyledComponent = styled.div`
  color: red;
  background: blue;
`;
```

## **七、 qiankun 如何解决公共依赖重复打包问题？**

在 **qiankun 微前端** 项目里，如果每个子应用都自己打包一份 **React / Vue / antd / element-plus**，就会出现：

- **重复加载**：主应用和多个子应用里都有 React，浪费带宽。
- **版本冲突**：主应用 React17，子应用 React18，可能会报错。

qiankun 本身不做打包优化，但它提供了机制，**让主子应用共享依赖**。

### 1.**原理思路**

解决“公共依赖重复打包” → **externals + CDN/host 注入 + 运行时共享**

核心思想：

- **不把 React/Vue 这些库打进子应用 bundle**
- 由 **主应用提供公共依赖**，子应用在运行时直接复用

### 2.**主应用注入公共依赖**

主应用在 index.html 或入口文件里，通过 `<script>` 提前引入这些依赖：

```ts
<!-- 主应用 index.html -->
<script src="https://cdn.jsdelivr.net/npm/react@17/umd/react.production.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/react-dom@17/umd/react-dom.production.min.js"></script>
```

这样子应用运行时就能拿到 window.React、window.ReactDOM。

### 3.**Webpack externals**

在子应用构建时，把 React/Vue 等标记为 externals，这样不会打进 bundle：

```ts
// webpack.config.js
module.exports = {
  externals: {
    react: 'React',
    'react-dom': 'ReactDOM',
  },
};
```

### 4.**Webpack Module Federation（进阶）**

如果主子应用都用 webpack5，可以用 **模块联邦**（Module Federation）：

- 主应用暴露公共依赖（shared）。
- 子应用声明共享，不自己打包。

```ts
// 主应用 webpack.config.js
plugins: [
  new ModuleFederationPlugin({
    name: 'main',
    remotes: {},
    shared: ['react', 'react-dom'],
  }),
];
```

```ts
// 子应用 webpack.config.js
plugins: [
  new ModuleFederationPlugin({
    name: 'subApp',
    filename: 'remoteEntry.js',
    exposes: { './App': './src/App' },
    shared: ['react', 'react-dom'],
  }),
];
```

## **八、 Qiankun 主应用子应用怎么统一路由**

- 主应用管理 **全局路由前缀**，比如 /app1、/app2。
- 子应用管理自己的内部路由（例如 /home、/list）。
- 跨应用跳转时通过全局 actions 或 props.$parentRouter 调用主应用路由，避免硬编码。

**做法：**

- 主应用定义 actions：

```ts
import { initGlobalState } from 'qiankun';
const actions = initGlobalState({});

actions.onGlobalStateChange((state, prev) => {
  console.log('state changed:', state);
});
export default actions;
```

- 子应用调用：

```ts
props.actions.setGlobalState({
  route: '/app2/home',
});
```

- 主应用监听到 route 改变时，执行 router.push(state.route)。

## **九、 **常见问题以及解决方案

- **样式冲突** → 使用 qiankun 样式隔离 + BEM 命名。
- **路由不统一** → 主子应用约定前缀（如 /app1/\*），避免冲突。
- **通信复杂** → 统一封装 EventBus，减少 props 层层传递。
- **性能问题** → 开启 prefetch 预加载子应用资源。

## 十、应用加载原理？

### 1. HTML Entry 解析

- HTML 解析：请求和解析 HTML 文本，自动提取 JS 和 CSS 资源

- 样式处理：请求外联 CSS 资源，通过内联方式嵌入 HTML

- 脚本执行：请求外联 JS 资源，通过 (0, eval) 动态执行脚本

- 生命周期识别：识别微应用入口脚本并解析导出的生命周期函数
