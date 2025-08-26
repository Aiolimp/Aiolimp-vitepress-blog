---
title: 008 从 single-spa 到 qiankun
theme: solarized-dark
---

# 从 single-spa 到 qiankun 的演进与实践

## 一、微前端核心框架原理

### 1.1 single-spa 核心原理

**single-spa** 是微前端的基础框架，其核心思想是将不同框架的 SPA 聚合成整体应用。

#### 核心架构

- **主应用**：负责注册微应用、路由管理、提供容器
- **微应用**：提供生命周期函数、独立运行能力

#### 运行机制

```javascript
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

```javascript
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

### 1.2 qiankun 核心原理

**qiankun** 是对 single-spa 的二次封装，提供了更完善的微前端解决方案。

#### 核心特性

- **HTML Entry**：支持直接加载 HTML，自动解析资源
- **沙箱隔离**：JS 沙箱和样式隔离
- **资源预加载**：支持微应用资源预加载
- **通信机制**：提供应用间通信能力

## 二、qiankun 基于 single-spa 的封装和优化

### 2.1 注册方式简化

**single-spa 原始方式**：

```javascript
registerApplication({
  name: 'react-app',
  app: () => {
    return fetchApp(['http://localhost:3000/vendors.js', 'http://localhost:3000/main.js']);
  },
  activeWhen: '/react',
  customProps: { container: 'micro-app-container' },
});
```

**qiankun 简化方式**：

```javascript
registerMicroApps([
  {
    name: 'react-app',
    entry: 'http://localhost:3000', // 直接配置 HTML 地址
    container: '#micro-app-container',
    activeRule: '/react',
  },
]);
```

### 2.2 资源加载优化

#### HTML Entry 模式

- **自动解析**：自动解析 HTML 中的 JS 和 CSS 资源
- **资源处理**：外联 CSS 自动内联，JS 脚本按序执行
- **缓存机制**：多级缓存避免重复请求

#### import-html-entry 核心功能

```javascript
const { template, execScripts, getExternalScripts } = await importEntry(url);

// 1. 解析 HTML，提取资源
// 2. 外联样式内联化
// 3. 脚本按序执行
// 4. 生命周期函数识别
```

### 2.3 沙箱隔离机制

#### JS 沙箱实现

```javascript
// 1. 快照沙箱（兼容性方案）
class SnapshotSandbox {
  active() {
    this.windowSnapshot = {};
    for (const prop in window) {
      this.windowSnapshot[prop] = window[prop];
    }
  }

  inactive() {
    for (const prop in window) {
      if (window[prop] !== this.windowSnapshot[prop]) {
        delete window[prop];
      }
    }
  }
}

// 2. Proxy 沙箱（现代方案）
class ProxySandbox {
  constructor() {
    const fakeWindow = {};
    this.proxyWindow = new Proxy(fakeWindow, {
      get: (target, prop) => (prop in target ? target[prop] : window[prop]),
      set: (target, prop, value) => (target[prop] = value),
    });
  }
}
```

#### 样式隔离方案

```javascript
// 1. Shadow DOM 隔离
const shadowRoot = container.attachShadow({ mode: 'open' });
shadowRoot.appendChild(microAppContent);

// 2. CSS 作用域隔离
const scopedCSS = addScopeToCSS(cssText, scopeId);

// 3. 动态样式表管理
function addStyleSheet(cssText, microAppName) {
  const style = document.createElement('style');
  style.setAttribute('data-qiankun', microAppName);
  style.textContent = cssText;
  document.head.appendChild(style);
}
```

## 三、应用通信机制

### 3.1 主应用与子应用通信

#### Props 传递

```javascript
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

```javascript
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

### 3.2 子应用间通信

#### 事件总线

```javascript
// 全局事件总线
class EventBus {
  constructor() {
    this.events = {};
  }

  on(event, callback) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(callback);
  }

  emit(event, data) {
    if (this.events[event]) {
      this.events[event].forEach((callback) => callback(data));
    }
  }
}

window.__GLOBAL_EVENT_BUS__ = new EventBus();
```

## 四、样式隔离解决方案

### 4.1 CSS 隔离策略

#### 1. Scoped CSS

```javascript
// Vue 组件
<style scoped>
.container { color: red; }
</style>

// 编译后
<style>
.container[data-v-123] { color: red; }
</style>
```

#### 2. CSS Modules

```javascript
// styles.module.css
.container {
  color: red;
}

// 组件中
import styles from './styles.module.css';
<div className={styles.container}>Content</div>
```

#### 3. CSS-in-JS

```javascript
const StyledComponent = styled.div`
  color: red;
  background: blue;
`;
```

### 4.2 qiankun 样式隔离实现

#### 动态样式表管理

```javascript
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

#### Shadow DOM 隔离

```javascript
// 创建 Shadow DOM 容器
const container = document.getElementById('micro-app-container');
const shadowRoot = container.attachShadow({ mode: 'open' });

// 微应用内容渲染到 Shadow DOM
shadowRoot.innerHTML = microAppHTML;
```

## 五、公共依赖处理

### 5.1 依赖共享策略

#### 1. 外部化共享依赖

```javascript
// webpack.config.js
module.exports = {
  externals: {
    'react': 'React',
    'react-dom': 'ReactDOM',
    'vue': 'Vue'
  }
};

// 主应用模板
<script src="https://unpkg.com/react@17/umd/react.production.min.js"></script>
<script src="https://unpkg.com/react-dom@17/umd/react-dom.production.min.js"></script>
```

#### 2. Module Federation

```javascript
// webpack.config.js
const ModuleFederationPlugin = require('@module-federation/webpack');

module.exports = {
  plugins: [
    new ModuleFederationPlugin({
      name: 'shell',
      shared: {
        react: { singleton: true },
        'react-dom': { singleton: true },
      },
    }),
  ],
};
```

#### 3. systemjs-importmap

```javascript
// importmap 配置
{
  "imports": {
    "react": "https://cdn.skypack.dev/react",
    "react-dom": "https://cdn.skypack.dev/react-dom"
  }
}

// 微应用中
import React from 'react';
import ReactDOM from 'react-dom';
```

### 5.2 版本管理

```javascript
// 依赖版本检查
function checkDependencyVersion(name, requiredVersion) {
  const currentVersion = window[name]?.version;
  if (!semver.satisfies(currentVersion, requiredVersion)) {
    throw new Error(`Dependency ${name} version mismatch`);
  }
}
```

## 六、子应用独立部署

### 6.1 部署架构设计

#### 1. 独立构建和部署

```bash
# 各微应用独立构建
cd micro-app-1 && npm run build
cd micro-app-2 && npm run build
cd main-app && npm run build

# 独立部署到不同域名
micro-app-1.example.com
micro-app-2.example.com
main-app.example.com
```

#### 2. 配置中心管理

```javascript
// 配置中心
const microAppConfig = {
  'vue-app': {
    entry: 'https://vue-app.example.com',
    activeRule: '/vue',
  },
  'react-app': {
    entry: 'https://react-app.example.com',
    activeRule: '/react',
  },
};

// 动态注册
Object.values(microAppConfig).forEach((config) => {
  registerMicroApps([config]);
});
```

### 6.2 环境隔离

#### 1. 多环境配置

```javascript
// 环境配置
const envConfig = {
  development: {
    'vue-app': 'http://localhost:8080',
  },
  staging: {
    'vue-app': 'https://vue-app-staging.example.com',
  },
  production: {
    'vue-app': 'https://vue-app.example.com',
  },
};
```

#### 2. 跨域处理

```javascript
// 开发环境代理
devServer: {
  proxy: {
    '/api/vue-app': {
      target: 'http://localhost:8080',
      changeOrigin: true
    }
  }
}

// 生产环境 CORS
response.setHeader('Access-Control-Allow-Origin', '*');
response.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
```

## 七、微前端性能问题与优化

### 7.1 主要性能问题

#### 1. 加载性能问题

- **首屏加载慢**：多个微应用资源并行加载
- **重复依赖**：相同依赖被多次加载
- **资源体积大**：缺乏有效的代码分割

#### 2. 运行时性能问题

- **内存泄漏**：微应用卸载不完全
- **事件监听器泄漏**：全局事件未清理
- **定时器泄漏**：定时器未清除

### 7.2 性能优化方案

#### 1. 资源预加载

```javascript
// qiankun 预加载
import { prefetchApps } from 'qiankun';

// 预加载微应用资源
prefetchApps([
  { name: 'vue-app', entry: 'http://localhost:8080' },
  { name: 'react-app', entry: 'http://localhost:3000' },
]);
```

#### 2. 懒加载策略

```javascript
// 按需加载
const LazyMicroApp = React.lazy(() => {
  return new Promise((resolve) => {
    // 只有当路由匹配时才加载微应用
    if (location.pathname.startsWith('/vue')) {
      loadMicroApp('vue-app').then(() => {
        resolve({ default: MicroAppContainer });
      });
    }
  });
});
```

#### 3. 缓存优化

```javascript
// HTTP 缓存策略
Cache-Control: public, max-age=31536000  // 静态资源
Cache-Control: no-cache  // HTML 入口文件

// 应用级缓存
const microAppCache = new Map();

function loadMicroApp(name) {
  if (microAppCache.has(name)) {
    return microAppCache.get(name);
  }

  const promise = importEntry(getEntryUrl(name));
  microAppCache.set(name, promise);
  return promise;
}
```

## 八、qiankun 沙箱原理深度解析

### 8.1 JS 沙箱实现

#### 1. 快照沙箱（SnapshotSandbox）

```javascript
class SnapshotSandbox {
  constructor() {
    this.windowSnapshot = {};
    this.modifyPropsMap = {};
  }

  active() {
    // 记录当前 window 状态
    this.windowSnapshot = {};
    for (const prop in window) {
      this.windowSnapshot[prop] = window[prop];
    }

    // 恢复之前的修改
    Object.keys(this.modifyPropsMap).forEach((p) => {
      window[p] = this.modifyPropsMap[p];
    });
  }

  inactive() {
    this.modifyPropsMap = {};

    for (const prop in window) {
      if (window[prop] !== this.windowSnapshot[prop]) {
        // 记录变更
        this.modifyPropsMap[prop] = window[prop];
        // 还原
        window[prop] = this.windowSnapshot[prop];
      }
    }
  }
}
```

#### 2. 代理沙箱（ProxySandbox）

```javascript
class ProxySandbox {
  constructor() {
    const rawWindow = window;
    const fakeWindow = {};

    this.proxyWindow = new Proxy(fakeWindow, {
      get: (target, prop) => {
        return prop in target ? target[prop] : rawWindow[prop];
      },

      set: (target, prop, value) => {
        if (this.active) {
          target[prop] = value;
        }
        return true;
      },

      deleteProperty: (target, prop) => {
        if (this.active) {
          delete target[prop];
        }
        return true;
      },
    });
  }
}
```

### 8.2 样式沙箱实现

#### 1. 严格样式隔离

```javascript
// 使用 Shadow DOM 实现完全隔离
function createShadowSandbox(container, appHTML) {
  const shadowRoot = container.attachShadow({ mode: 'open' });
  shadowRoot.innerHTML = appHTML;
  return shadowRoot;
}
```

#### 2. 作用域样式隔离

```javascript
// CSS 选择器前缀隔离
function scopedCSS(cssText, scope) {
  return cssText.replace(/([^{}]+){/g, (match, selector) => {
    return `${scope} ${selector.trim()}{`;
  });
}

// 使用示例
const scopedStyle = scopedCSS(originalCSS, '[data-qiankun-app="vue-app"]');
```

## 九、项目实践中的微前端问题与解决方案

### 9.1 常见问题与解决方案

#### 1. 路由冲突问题

**问题**：主应用和子应用路由冲突

```javascript
// 解决方案：路由前缀隔离
// 主应用路由
const mainRoutes = [
  { path: '/', component: Home },
  { path: '/about', component: About },
];

// 子应用路由
const subAppRoutes = [
  { path: '/vue-app/dashboard', component: Dashboard },
  { path: '/vue-app/profile', component: Profile },
];
```

#### 2. 全局状态污染

**问题**：微应用修改全局状态影响其他应用

```javascript
// 解决方案：状态隔离
class StateManager {
  constructor(appName) {
    this.appName = appName;
    this.state = {};
  }

  setState(newState) {
    this.state = { ...this.state, ...newState };
    // 只通知当前应用的订阅者
    this.notifySubscribers(this.appName);
  }
}
```

#### 3. 依赖版本冲突

**问题**：不同微应用使用不同版本的相同依赖

```javascript
// 解决方案：版本兼容性检查
function checkCompatibility(deps) {
  return deps.every(({ name, version }) => {
    const existingVersion = window.__SHARED_DEPS__[name];
    return !existingVersion || semver.satisfies(version, `^${existingVersion}`);
  });
}
```

### 9.2 生产环境最佳实践

#### 1. 错误边界处理

```javascript
class MicroAppErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // 上报错误
    reportError({
      microApp: this.props.appName,
      error: error.message,
      stack: error.stack,
    });
  }

  render() {
    if (this.state.hasError) {
      return <div>微应用加载失败，请刷新重试</div>;
    }
    return this.props.children;
  }
}
```

#### 2. 监控和日志

```javascript
// 微应用性能监控
function trackMicroAppPerformance(appName) {
  const startTime = performance.now();

  return {
    markMountTime() {
      const mountTime = performance.now() - startTime;
      analytics.track('micro_app_mount', {
        app: appName,
        duration: mountTime,
      });
    },

    markUnmountTime() {
      const unmountTime = performance.now() - startTime;
      analytics.track('micro_app_unmount', {
        app: appName,
        duration: unmountTime,
      });
    },
  };
}
```

#### 3. 资源加载策略

```javascript
// 智能预加载
class IntelligentPreloader {
  constructor() {
    this.userBehavior = new Map();
    this.preloadQueue = [];
  }

  trackUserBehavior(route) {
    const count = this.userBehavior.get(route) || 0;
    this.userBehavior.set(route, count + 1);
  }

  getPreloadCandidates() {
    // 根据用户行为预测下一个可能访问的应用
    return Array.from(this.userBehavior.entries())
      .sort(([, a], [, b]) => b - a)
      .slice(0, 2)
      .map(([route]) => route);
  }
}
```

## 十、总结

微前端作为解决大型前端应用架构问题的重要方案，从 single-spa 的基础框架到 qiankun 的完善封装，体现了技术演进的必然性。通过深入理解其原理和最佳实践，我们可以构建出既灵活又稳定的微前端系统。

**核心要点回顾**：

1. **框架选择**：根据项目需求选择合适的微前端框架
2. **沙箱隔离**：确保微应用间的独立性和安全性
3. **通信机制**：设计清晰的应用间通信方案
4. **性能优化**：通过预加载、缓存等手段提升用户体验
5. **工程化**：建立完善的开发、构建、部署流程
6. **监控运维**：确保微前端系统的稳定运行

微前端不是银弹，需要结合具体业务场景和技术栈进行合理的架构设计和技术选型。只有在充分理解其原理和限制的基础上，才能发挥微前端的最大价值。
