---
title: Vite 原理之热更新
theme: solarized-dark
---

# Vite 原理之热更新

## 简介

热更新（Hot Module Replacement，简称 HMR）是 Vite 最核心的功能之一，它能够在不刷新整个页面的情况下，实时更新修改的模块。Vite 的 HMR 实现相比传统工具有着质的飞跃，能够实现毫秒级的更新响应。

## HMR 基本概念

### **什么是热更新？**

热更新是指在应用运行时，能够替换、添加或删除模块，而无需重新加载整个页面。这样可以：

- **保持应用状态**：组件状态、表单数据等不会丢失
- **提升开发效率**：无需等待页面重新加载
- **精确更新**：只更新发生变化的部分

### **传统 HMR 的局限性**

```
webpack HMR 流程：
文件修改 → 重新编译模块及依赖 → 生成更新补丁 → 推送到浏览器 → 应用更新
问题：编译时间随项目复杂度增加，更新变慢
```

## Vite HMR 核心原理

### 1. **基于 ES Modules 的更新机制**

- 模块依赖图：Vite 在内存中维护完整的模块依赖关系

- 精确追踪：准确知道每个模块的导入者和被导入者

- 智能更新：只更新必要的模块，避免过度更新

#### **模块依赖图**

Vite 在内存中维护一个模块依赖图：

```javascript
// Vite 内部的依赖图结构
class ModuleGraph {
  constructor() {
    this.urlToModuleMap = new Map(); // URL 到模块的映射
    this.idToModuleMap = new Map(); // ID 到模块的映射
    this.fileToModulesMap = new Map(); // 文件到模块的映射
  }

  // 获取模块信息
  getModuleByUrl(url) {
    return this.urlToModuleMap.get(url);
  }

  // 更新模块
  updateModuleInfo(url, module) {
    this.urlToModuleMap.set(url, module);
  }
}
```

#### **模块节点结构**

```javascript
// 每个模块的节点信息
interface ModuleNode {
  id: string; // 模块 ID
  file: string; // 文件路径
  url: string; // 请求 URL
  type: 'js' | 'css'; // 模块类型
  importers: Set<ModuleNode>; // 导入此模块的模块
  importedModules: Set<ModuleNode>; // 此模块导入的模块
  acceptedHmrDeps: Set<ModuleNode>; // HMR 接受的依赖
  isSelfAccepting: boolean; // 是否自接受更新
  transformResult: TransformResult; // 转换结果
  lastHMRTimestamp: number; // 最后 HMR 时间戳
}
```

### 2. **文件监听与变更检测**

#### **文件监听器设置**

- 使用 `chokidar` 监听文件系统变化

- 实时检测文件的增删改操作

- 忽略不必要的目录（node_modules、.git 等）

```javascript
// Vite 的文件监听实现
import { FSWatcher } from 'chokidar';

class ViteDevServer {
  setupFileWatcher() {
    const watcher = chokidar.watch(this.config.root, {
      ignored: ['**/node_modules/**', '**/.git/**', '**/dist/**'],
      ignoreInitial: true,
      ignorePermissionErrors: true,
    });

    watcher.on('change', this.handleFileChange.bind(this));
    watcher.on('add', this.handleFileAdd.bind(this));
    watcher.on('unlink', this.handleFileDelete.bind(this));
  }

  async handleFileChange(file) {
    const timestamp = Date.now();
    const modules = this.moduleGraph.getModulesByFile(file);

    if (modules.size > 0) {
      this.updateModules(modules, timestamp);
    }
  }
}
```

### 3. **模块更新传播机制**

#### **更新传播算法**

```javascript
// 模块更新传播逻辑
class HMRContext {
  async updateModules(modules, timestamp) {
    const hmrUpdates = [];
    const invalidatedModules = new Set();

    for (const mod of modules) {
      this.invalidateModule(mod, invalidatedModules);
    }

    // 收集需要更新的模块
    for (const mod of invalidatedModules) {
      const boundaries = this.propagateUpdate(mod);
      hmrUpdates.push(...boundaries);
    }

    // 发送更新消息到浏览器
    this.ws.send({
      type: 'update',
      updates: hmrUpdates,
      timestamp,
    });
  }

  propagateUpdate(mod, boundaries = [], currentChain = [mod]) {
    if (mod.isSelfAccepting) {
      boundaries.push({
        type: 'js-update',
        path: mod.url,
        acceptedPath: mod.url,
        timestamp: Date.now(),
      });
      return boundaries;
    }

    // 向上传播到父模块
    for (const importer of mod.importers) {
      if (!currentChain.includes(importer)) {
        this.propagateUpdate(importer, boundaries, [...currentChain, importer]);
      }
    }

    return boundaries;
  }
}
```

### 4. **WebSocket 通信机制**

- 服务端：维护客户端连接，广播更新消息

- 客户端：监听更新消息，执行模块替换

- 消息类型：update、full-reload、error 等

#### **服务端 WebSocket 实现**

```javascript
// Vite HMR WebSocket 服务
class HMRServer {
  constructor(server) {
    this.wss = new WebSocketServer({ server });
    this.clients = new Set();
  }

  setupWebSocket() {
    this.wss.on('connection', (ws) => {
      this.clients.add(ws);

      ws.on('close', () => {
        this.clients.delete(ws);
      });

      // 发送连接确认
      ws.send(JSON.stringify({ type: 'connected' }));
    });
  }

  // 广播更新消息
  broadcast(message) {
    const payload = JSON.stringify(message);
    this.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(payload);
      }
    });
  }

  // 发送模块更新
  sendUpdate(updates) {
    this.broadcast({
      type: 'update',
      updates,
      timestamp: Date.now(),
    });
  }
}
```

#### **客户端 WebSocket 处理**

```javascript
// 客户端 HMR 处理逻辑
class HMRClient {
  constructor() {
    this.setupWebSocket();
    this.setupErrorOverlay();
  }

  setupWebSocket() {
    const protocol = location.protocol === 'https:' ? 'wss' : 'ws';
    const socket = new WebSocket(`${protocol}://${location.host}`);

    socket.addEventListener('message', async (event) => {
      const payload = JSON.parse(event.data);
      await this.handleMessage(payload);
    });
  }

  async handleMessage(payload) {
    switch (payload.type) {
      case 'connected':
        console.log('[vite] connected.');
        break;

      case 'update':
        await this.handleUpdate(payload.updates);
        break;

      case 'full-reload':
        location.reload();
        break;

      case 'error':
        this.showErrorOverlay(payload.err);
        break;
    }
  }

  async handleUpdate(updates) {
    for (const update of updates) {
      if (update.type === 'js-update') {
        await this.queueUpdate(this.fetchUpdate(update));
      } else if (update.type === 'css-update') {
        this.updateStyle(update);
      }
    }
  }
}
```

## 不同类型文件的 HMR 处理

### 1. **JavaScript/TypeScript 文件**

#### **Vue 单文件组件 HMR**

- Vue SFC：分别处理模板、脚本、样式的更新

```javascript
// Vue SFC HMR 实现
if (import.meta.hot) {
  import.meta.hot.accept((newModule) => {
    if (newModule) {
      // 更新组件定义
      __VUE_HMR_RUNTIME__.updateComponent(id, newModule.default);
    }
  });

  // 模板更新
  import.meta.hot.accept('./Component.vue?vue&type=template', () => {
    __VUE_HMR_RUNTIME__.rerender(id, render);
  });

  // 样式更新
  import.meta.hot.accept('./Component.vue?vue&type=style', () => {
    __VUE_HMR_RUNTIME__.updateStyle(id, styles);
  });
}
```

#### **React 组件 HMR**

- React：集成 React Fast Refresh

```javascript
// React Fast Refresh 集成
if (import.meta.hot) {
  import.meta.hot.accept((newModule) => {
    if (newModule) {
      // 使用 React Fast Refresh
      window.$RefreshReg$(newModule.default, 'MyComponent');
      window.$RefreshSig$();
    }
  });
}
```

### 2. **CSS 文件热更新**

- 直接替换 style 标签内容

- CSS Modules 的类名映射更新

- 无需页面刷新，瞬间生效

```javascript
// CSS HMR 实现
class CSSHMRUpdater {
  updateStyle(update) {
    const { path, timestamp } = update;

    // 查找对应的 style 标签
    const el = document.querySelector(`style[data-vite-dev-id="${path}"]`);

    if (el) {
      // 获取新的 CSS 内容
      fetch(`${path}?t=${timestamp}`)
        .then((res) => res.text())
        .then((css) => {
          el.textContent = css;
          console.log(`[vite] css hot updated: ${path}`);
        });
    }
  }

  // CSS 模块热更新
  updateCSSModules(update) {
    const { path, timestamp } = update;

    // 重新导入 CSS 模块
    import(`${path}?t=${timestamp}&css-modules`).then((newModule) => {
      // 更新 CSS 类名映射
      Object.assign(cssModules[path], newModule.default);
    });
  }
}
```

### 3. **静态资源热更新**

- 更新所有引用该资源的 DOM 元素

- 添加时间戳防止缓存问题

```javascript
// 静态资源 HMR
class AssetHMRUpdater {
  updateAsset(update) {
    const { path, timestamp } = update;

    // 更新所有使用该资源的元素
    const elements = document.querySelectorAll(`[src*="${path}"], [href*="${path}"]`);

    elements.forEach((el) => {
      const attr = el.tagName === 'LINK' ? 'href' : 'src';
      const oldUrl = el.getAttribute(attr);
      const newUrl = oldUrl.replace(/(\?|&)t=\d+/, '') + `${oldUrl.includes('?') ? '&' : '?'}t=${timestamp}`;
      el.setAttribute(attr, newUrl);
    });
  }
}
```

## HMR API 使用详解

### 1. **基础 HMR API**

```javascript
// 基本的 HMR 接受
if (import.meta.hot) {
  // 接受当前模块的更新
  import.meta.hot.accept(() => {
    console.log('模块已更新');
  });

  // 接受特定依赖的更新
  import.meta.hot.accept('./utils.js', (newUtils) => {
    console.log('utils 模块已更新', newUtils);
  });

  // 接受多个依赖的更新
  import.meta.hot.accept(['./a.js', './b.js'], ([newA, newB]) => {
    console.log('模块 a 和 b 已更新');
  });
}
```

### 2. **高级 HMR API**

```javascript
// 高级 HMR 使用
if (import.meta.hot) {
  // 模块销毁时的清理
  import.meta.hot.dispose((data) => {
    // 保存状态到 data 对象
    data.someState = currentState;

    // 清理副作用
    clearInterval(timer);
    removeEventListener('resize', handler);
  });

  // 获取上一次的状态
  if (import.meta.hot.data) {
    const prevState = import.meta.hot.data.someState;
    // 恢复状态
  }

  // 强制刷新页面
  import.meta.hot.invalidate();

  // 发送自定义事件
  import.meta.hot.send('custom-event', { data: 'some data' });
}
```

### 3. **条件性 HMR 处理**

```javascript
// 智能 HMR 处理
class SmartHMRHandler {
  setupHMR() {
    if (import.meta.hot) {
      import.meta.hot.accept((newModule) => {
        if (this.canHotUpdate(newModule)) {
          this.performHotUpdate(newModule);
        } else {
          // 需要完整刷新
          import.meta.hot.invalidate();
        }
      });
    }
  }

  canHotUpdate(newModule) {
    // 检查是否可以热更新
    return newModule.version === this.version && newModule.schema === this.schema;
  }

  performHotUpdate(newModule) {
    // 执行热更新逻辑
    this.updateComponent(newModule.component);
    this.updateStyles(newModule.styles);
  }
}
```

## 错误处理与恢复

### 1. **HMR 错误处理**

```javascript
// HMR 错误处理机制
class HMRErrorHandler {
  setupErrorHandling() {
    if (import.meta.hot) {
      import.meta.hot.accept((newModule, { module, deps }) => {
        try {
          this.updateModule(newModule);
        } catch (error) {
          console.error('[HMR] 更新失败:', error);

          // 显示错误覆盖层
          this.showErrorOverlay(error);

          // 或者回退到完整刷新
          import.meta.hot.invalidate();
        }
      });

      // 监听 HMR 错误
      import.meta.hot.on('vite:error', (error) => {
        this.handleHMRError(error);
      });
    }
  }

  showErrorOverlay(error) {
    // 创建错误覆盖层
    const overlay = document.createElement('div');
    overlay.className = 'vite-error-overlay';
    overlay.innerHTML = this.formatError(error);
    document.body.appendChild(overlay);
  }
}
```

### 2. **状态保持策略**

```javascript
// 状态保持实现
class StatePreserver {
  preserveState() {
    if (import.meta.hot) {
      import.meta.hot.dispose((data) => {
        // 保存组件状态
        data.componentState = this.getState();

        // 保存全局状态
        data.globalState = window.__APP_STATE__;

        // 保存 DOM 状态
        data.scrollPosition = window.scrollY;
        data.focusedElement = document.activeElement;
      });

      import.meta.hot.accept(() => {
        // 恢复状态
        if (import.meta.hot.data) {
          this.restoreState(import.meta.hot.data);
        }
      });
    }
  }

  restoreState(data) {
    // 恢复组件状态
    if (data.componentState) {
      this.setState(data.componentState);
    }

    // 恢复滚动位置
    if (data.scrollPosition) {
      window.scrollTo(0, data.scrollPosition);
    }

    // 恢复焦点
    if (data.focusedElement) {
      data.focusedElement.focus();
    }
  }
}
```

## 性能优化策略

### 1. **批量更新优化**

```javascript
// 批量更新实现
class BatchUpdater {
  constructor() {
    this.updateQueue = [];
    this.isUpdating = false;
  }

  queueUpdate(update) {
    this.updateQueue.push(update);

    if (!this.isUpdating) {
      this.flushUpdates();
    }
  }

  async flushUpdates() {
    this.isUpdating = true;

    // 批量处理更新
    const updates = this.updateQueue.splice(0);

    try {
      await this.processBatch(updates);
    } finally {
      this.isUpdating = false;

      // 处理队列中的新更新
      if (this.updateQueue.length > 0) {
        this.flushUpdates();
      }
    }
  }

  async processBatch(updates) {
    // 按类型分组更新
    const grouped = this.groupByType(updates);

    // 优先处理 CSS 更新（最快）
    if (grouped.css) {
      await this.processCSSUpdates(grouped.css);
    }

    // 然后处理 JS 更新
    if (grouped.js) {
      await this.processJSUpdates(grouped.js);
    }
  }
}
```

### 2. **缓存优化**

```javascript
// HMR 缓存优化
class HMRCache {
  constructor() {
    this.moduleCache = new Map();
    this.transformCache = new Map();
  }

  getCachedModule(url, timestamp) {
    const cached = this.moduleCache.get(url);

    if (cached && cached.timestamp >= timestamp) {
      return cached.module;
    }

    return null;
  }

  cacheModule(url, module, timestamp) {
    this.moduleCache.set(url, {
      module,
      timestamp,
      size: this.calculateSize(module),
    });

    // 清理过期缓存
    this.cleanupCache();
  }

  cleanupCache() {
    const maxSize = 50 * 1024 * 1024; // 50MB
    let currentSize = 0;

    // 按时间戳排序，清理最旧的缓存
    const entries = Array.from(this.moduleCache.entries()).sort((a, b) => b[1].timestamp - a[1].timestamp);

    for (const [url, cached] of entries) {
      currentSize += cached.size;

      if (currentSize > maxSize) {
        this.moduleCache.delete(url);
      }
    }
  }
}
```

## 总结

Vite 的 HMR 实现通过以下核心技术实现了极致的热更新性能：

### **核心优势**

1. **ES Modules 原生支持** - 利用浏览器模块系统
2. **精确的依赖图** - 准确追踪模块关系
3. **智能更新传播** - 最小化更新范围
4. **高效的 WebSocket 通信** - 实时推送更新
5. **类型化的更新处理** - 针对不同文件类型优化

### **技术特点**

- **毫秒级响应**：更新时间与项目规模无关
- **状态保持**：智能保存和恢复应用状态
- **错误恢复**：优雅的错误处理和回退机制
- **批量优化**：智能的更新批处理和缓存

### **开发体验**

Vite 的 HMR 不仅仅是技术上的突破，更是开发体验的革命性提升，让前端开发变得更加高效和愉悦。
