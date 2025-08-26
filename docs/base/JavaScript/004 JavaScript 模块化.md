---
title: 004 JavaScript 模块化
theme: solarized-dark
---

# JavaScript 模块化

## 简介

模块化是现代 JavaScript 开发的核心概念，它将代码分割成独立、可复用的模块。JavaScript 模块化经历了从无到有的发展过程，从早期的全局变量到现代的 ES6 模块，解决了代码组织、依赖管理和命名冲突等问题。

## 模块化的发展历程

### **1. 全局变量时代**

最早期的 JavaScript 没有模块系统，所有代码都在全局作用域中。

```javascript
// 早期的代码组织方式
var userName = 'Alice';
var userAge = 25;

function getUserInfo() {
  return userName + ' is ' + userAge + ' years old';
}

function updateUser(name, age) {
  userName = name;
  userAge = age;
}

// 问题：全局污染、命名冲突、依赖关系不明确
```

> **总结**：全局变量方式简单直接，但容易造成命名冲突和代码管理困难。

### **2. 命名空间模式**

通过对象来组织代码，减少全局变量污染。

```javascript
// 命名空间模式
var MyApp = {
  version: '1.0.0',
  modules: {},

  utils: {
    formatDate: function (date) {
      return date.toLocaleDateString();
    },

    generateId: function () {
      return Date.now().toString(36);
    },
  },

  user: {
    data: {
      name: '',
      age: 0,
    },

    setInfo: function (name, age) {
      this.data.name = name;
      this.data.age = age;
    },

    getInfo: function () {
      return this.data.name + ' is ' + this.data.age + ' years old';
    },
  },
};

// 使用
MyApp.user.setInfo('Alice', 25);
console.log(MyApp.user.getInfo());
```

> **总结**：命名空间模式减少了全局污染，但仍然无法解决依赖管理和私有性问题。

### **3. IIFE 模式**

使用立即执行函数表达式创建独立作用域。

```javascript
// IIFE 模块模式
var UserModule = (function () {
  // 私有变量
  var name = '';
  var age = 0;

  // 私有方法
  function validate(name, age) {
    return name && age > 0;
  }

  // 公共接口
  return {
    setInfo: function (userName, userAge) {
      if (validate(userName, userAge)) {
        name = userName;
        age = userAge;
        return true;
      }
      return false;
    },

    getInfo: function () {
      return name + ' is ' + age + ' years old';
    },

    getName: function () {
      return name;
    },

    getAge: function () {
      return age;
    },
  };
})();

// 使用
UserModule.setInfo('Alice', 25);
console.log(UserModule.getInfo()); // "Alice is 25 years old"
console.log(UserModule.name); // undefined - 私有变量无法访问
```

> **总结**：IIFE 模式实现了真正的私有变量和方法，是早期模块化的重要解决方案。

## CommonJS 规范

### **基本概念**

CommonJS 是 Node.js 使用的模块系统，采用同步加载方式。

```javascript
// math.js - 导出模块
function add(a, b) {
  return a + b;
}

function subtract(a, b) {
  return a - b;
}

function multiply(a, b) {
  return a * b;
}

// 导出方式1：逐个导出
exports.add = add;
exports.subtract = subtract;

// 导出方式2：整体导出
module.exports = {
  add: add,
  subtract: subtract,
  multiply: multiply,
};

// 导出方式3：直接赋值
module.exports = multiply;
```

```javascript
// calculator.js - 导入和使用模块
const math = require('./math');
const { add, subtract } = require('./math');

console.log(math.add(5, 3)); // 8
console.log(subtract(5, 3)); // 2

// 导入整个模块
const fs = require('fs');
const path = require('path');

// 使用内置模块
const filePath = path.join(__dirname, 'data.txt');
fs.readFile(filePath, 'utf8', (err, data) => {
  if (err) {
    console.error('读取文件失败:', err);
  } else {
    console.log('文件内容:', data);
  }
});
```

> **总结**：CommonJS 提供了完整的模块系统，支持导入导出、依赖管理，主要用于 Node.js 环境。

### **特点和机制**

```javascript
// 模块缓存机制
// counter.js
let count = 0;

module.exports = {
  increment: function () {
    return ++count;
  },

  getCount: function () {
    return count;
  },
};

// main.js
const counter1 = require('./counter');
const counter2 = require('./counter');

console.log(counter1.increment()); // 1
console.log(counter2.increment()); // 2 - 同一个实例
console.log(counter1 === counter2); // true - 模块被缓存

// 动态加载
function loadModule(name) {
  try {
    return require(name);
  } catch (error) {
    console.log('模块加载失败:', error.message);
    return null;
  }
}

const dynamicModule = loadModule('./optional-module');
if (dynamicModule) {
  dynamicModule.someFunction();
}
```

> **总结**：CommonJS 模块会被缓存，支持动态加载，但主要适用于服务器端环境。

## AMD 规范

### **基本概念**

AMD（Asynchronous Module Definition）专为浏览器环境设计，支持异步加载。

```javascript
// 定义模块 - math.js
define(['dependency1', 'dependency2'], function (dep1, dep2) {
  function add(a, b) {
    return a + b;
  }

  function subtract(a, b) {
    return a - b;
  }

  // 返回模块接口
  return {
    add: add,
    subtract: subtract,
    version: '1.0.0',
  };
});

// 无依赖模块
define(function () {
  return {
    PI: 3.14159,

    circleArea: function (radius) {
      return this.PI * radius * radius;
    },
  };
});

// 使用 require 加载模块
require(['math', 'geometry'], function (math, geometry) {
  console.log(math.add(5, 3)); // 8
  console.log(geometry.circleArea(10)); // 314.159
});

// RequireJS 配置
require.config({
  baseUrl: 'js/modules',
  paths: {
    jquery: 'https://cdn.jsdelivr.net/npm/jquery@3.6.0/dist/jquery.min',
    lodash: '../vendor/lodash.min',
  },
  shim: {
    'legacy-lib': {
      exports: 'LegacyLib',
    },
  },
});
```

> **总结**：AMD 专为浏览器设计，支持异步加载和依赖管理，但语法相对复杂。

## UMD 规范

### **通用模块定义**

UMD（Universal Module Definition）兼容多种模块系统。

```javascript
// umd-module.js
(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD 环境
    define(['dependency'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS 环境
    module.exports = factory(require('dependency'));
  } else {
    // 浏览器全局变量
    root.MyModule = factory(root.Dependency);
  }
})(typeof self !== 'undefined' ? self : this, function (dependency) {
  function MyModule() {
    this.version = '1.0.0';
  }

  MyModule.prototype.init = function () {
    console.log('模块初始化');
  };

  MyModule.prototype.destroy = function () {
    console.log('模块销毁');
  };

  return MyModule;
});

// 使用示例
// AMD 环境
require(['umd-module'], function (MyModule) {
  var instance = new MyModule();
  instance.init();
});

// CommonJS 环境
const MyModule = require('./umd-module');
const instance = new MyModule();
instance.init();

// 浏览器环境
const instance = new window.MyModule();
instance.init();
```

> **总结**：UMD 提供跨环境兼容性，但代码结构相对复杂。

## ES6 模块

### **基本语法**

ES6 引入了原生模块系统，语法简洁，支持静态分析。

```javascript
// math.js - 导出模块
// 命名导出
export function add(a, b) {
  return a + b;
}

export function subtract(a, b) {
  return a - b;
}

export const PI = 3.14159;

// 批量导出
function multiply(a, b) {
  return a * b;
}

function divide(a, b) {
  return a / b;
}

export { multiply, divide };

// 重命名导出
function power(base, exponent) {
  return Math.pow(base, exponent);
}

export { power as pow };

// 默认导出
export default function calculator(operation, a, b) {
  switch (operation) {
    case 'add':
      return add(a, b);
    case 'subtract':
      return subtract(a, b);
    case 'multiply':
      return multiply(a, b);
    case 'divide':
      return divide(a, b);
    default:
      throw new Error('Unknown operation: ' + operation);
  }
}
```

```javascript
// main.js - 导入模块
// 命名导入
import { add, subtract, PI } from './math.js';

// 重命名导入
import { pow as power } from './math.js';

// 批量导入
import * as mathUtils from './math.js';

// 默认导入
import calculator from './math.js';

// 混合导入
import calc, { add, subtract } from './math.js';

// 使用
console.log(add(5, 3)); // 8
console.log(mathUtils.multiply(4, 7)); // 28
console.log(calculator('add', 10, 20)); // 30
console.log(power(2, 8)); // 256
```

> **总结**：ES6 模块语法简洁明了，支持静态分析，是现代 JavaScript 的标准模块系统。

### **高级特性**

```javascript
// 动态导入
async function loadModule() {
  try {
    // 动态导入返回 Promise
    const mathModule = await import('./math.js');
    console.log(mathModule.add(5, 3));

    // 条件导入
    if (someCondition) {
      const { heavyFunction } = await import('./heavy-module.js');
      heavyFunction();
    }
  } catch (error) {
    console.error('模块加载失败:', error);
  }
}

// 使用 import() 进行代码分割
button.addEventListener('click', async () => {
  const { showModal } = await import('./modal.js');
  showModal();
});

// 转发导出
// utils/index.js
export { add, subtract } from './math.js';
export { formatDate } from './date.js';
export { default as validator } from './validator.js';

// 重新导出所有
export * from './string-utils.js';

// 模块顶层 await (ES2022)
// data.js
const response = await fetch('/api/config');
const config = await response.json();

export default config;
```

> **总结**：ES6 模块支持动态导入、代码分割、转发导出等高级特性，功能强大且灵活。

## 模块打包工具

### **Webpack 配置示例**

```javascript
// webpack.config.js
const path = require('path');

module.exports = {
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
    library: 'MyLibrary',
    libraryTarget: 'umd',
  },

  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
          },
        },
      },
    ],
  },

  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      utils: path.resolve(__dirname, 'src/utils'),
    },
  },

  optimization: {
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
        },
      },
    },
  },
};

// 使用别名导入
import { formatDate } from '@/utils/date';
import { validateEmail } from 'utils/validator';
```

### **Rollup 配置示例**

```javascript
// rollup.config.js
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import babel from '@rollup/plugin-babel';

export default {
  input: 'src/index.js',
  output: [
    {
      file: 'dist/bundle.cjs.js',
      format: 'cjs',
    },
    {
      file: 'dist/bundle.esm.js',
      format: 'esm',
    },
    {
      file: 'dist/bundle.umd.js',
      format: 'umd',
      name: 'MyLibrary',
    },
  ],

  plugins: [
    resolve(),
    commonjs(),
    babel({
      babelHelpers: 'bundled',
      exclude: 'node_modules/**',
    }),
  ],

  external: ['lodash', 'moment'],
};
```

> **总结**：现代打包工具提供了强大的模块处理能力，支持代码分割、Tree Shaking 等优化。

## 实际应用场景

### **1. 组件库开发**

```javascript
// components/Button/index.js
import './Button.css';

export default class Button {
  constructor(element, options = {}) {
    this.element = element;
    this.options = {
      variant: 'primary',
      size: 'medium',
      disabled: false,
      ...options
    };

    this.init();
  }

  init() {
    this.element.className = this.getClassName();
    this.element.disabled = this.options.disabled;
    this.bindEvents();
  }

  getClassName() {
    const { variant, size } = this.options;
    return `btn btn--${variant} btn--${size}`;
  }

  bindEvents() {
    this.element.addEventListener('click', this.handleClick.bind(this));
  }

  handleClick(event) {
    if (this.options.disabled) {
      event.preventDefault();
      return;
    }

    this.options.onClick?.(event);
  }

  setDisabled(disabled) {
    this.options.disabled = disabled;
    this.element.disabled = disabled;
  }
}

// components/Modal/index.js
export default class Modal {
  constructor(options = {}) {
    this.options = {
      title: '',
      content: '',
      closable: true,
      ...options
    };

    this.element = null;
    this.overlay = null;
  }

  show() {
    this.render();
    document.body.appendChild(this.overlay);
    this.bindEvents();
  }

  hide() {
    if (this.overlay && this.overlay.parentNode) {
      this.overlay.parentNode.removeChild(this.overlay);
    }
  }

  render() {
    this.overlay = document.createElement('div');
    this.overlay.className = 'modal-overlay';

    this.element = document.createElement('div');
    this.element.className = 'modal';
    this.element.innerHTML = `
      <div class="modal__header">
        <h3>${this.options.title}</h3>
        ${this.options.closable ? '<button class="modal__close">×</button>' : ''}
      </div>
      <div class="modal__content">
        ${this.options.content}
      </div>
    `;

    this.overlay.appendChild(this.element);
  }

  bindEvents() {
    if (this.options.closable) {
      const closeBtn = this.element.querySelector('.modal__close');
      closeBtn.addEventListener('click', () => this.hide());

      this.overlay.addEventListener('click', (e) => {
        if (e.target === this.overlay) {
          this.hide();
        }
      });
    }
  }
}

// components/index.js - 统一导出
export { default as Button } from './Button';
export { default as Modal } from './Modal';
export { default as Dropdown } from './Dropdown';
export { default as Tooltip } from './Tooltip';

// 使用组件库
import { Button, Modal } from './components';

const button = new Button(document.getElementById('myButton'), {
  variant: 'success',
  onClick: () => {
    const modal = new Modal({
      title: '确认操作',
      content: '确定要执行此操作吗？'
    });
    modal.show();
  }
});
```

> **总结**：模块化使组件库的开发和维护更加规范，便于复用和扩展。

### **2. 工具库开发**

```javascript
// utils/string.js
export function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function camelCase(str) {
  return str.replace(/-([a-z])/g, (match, letter) => letter.toUpperCase());
}

export function kebabCase(str) {
  return str.replace(/[A-Z]/g, (match) => '-' + match.toLowerCase());
}

export function truncate(str, maxLength, suffix = '...') {
  if (str.length <= maxLength) {
    return str;
  }
  return str.slice(0, maxLength - suffix.length) + suffix;
}

// utils/array.js
export function chunk(array, size) {
  const chunks = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

export function unique(array) {
  return [...new Set(array)];
}

export function groupBy(array, key) {
  return array.reduce((groups, item) => {
    const groupKey = typeof key === 'function' ? key(item) : item[key];
    groups[groupKey] = groups[groupKey] || [];
    groups[groupKey].push(item);
    return groups;
  }, {});
}

// utils/validation.js
export const validators = {
  email: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),

  phone: (value) => /^1[3-9]\d{9}$/.test(value),

  required: (value) => value !== null && value !== undefined && value !== '',

  minLength: (min) => (value) => value && value.length >= min,

  maxLength: (max) => (value) => !value || value.length <= max,

  pattern: (regex) => (value) => regex.test(value),
};

export function validate(value, rules) {
  const errors = [];

  for (const rule of rules) {
    if (typeof rule === 'function') {
      if (!rule(value)) {
        errors.push('验证失败');
      }
    } else if (typeof rule === 'object') {
      const { validator, message } = rule;
      if (!validator(value)) {
        errors.push(message || '验证失败');
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

// utils/index.js - 统一导出
export * from './string.js';
export * from './array.js';
export * from './validation.js';

// 或者分类导出
export * as string from './string.js';
export * as array from './array.js';
export * as validation from './validation.js';

// 使用工具库
import { capitalize, chunk, validators, validate } from './utils';

// 字符串处理
const title = capitalize('hello world');

// 数组处理
const batches = chunk([1, 2, 3, 4, 5, 6], 2);

// 表单验证
const emailValidation = validate('test@example.com', [validators.required, validators.email]);

console.log(emailValidation); // { valid: true, errors: [] }
```

> **总结**：模块化的工具库便于按需引入，减少打包体积，提高代码复用性。

### **3. 状态管理**

```javascript
// store/index.js
class Store {
  constructor(initialState = {}) {
    this.state = { ...initialState };
    this.listeners = [];
    this.middlewares = [];
  }

  getState() {
    return { ...this.state };
  }

  setState(newState) {
    const prevState = this.getState();
    this.state = { ...this.state, ...newState };

    this.listeners.forEach((listener) => {
      listener(this.state, prevState);
    });
  }

  subscribe(listener) {
    this.listeners.push(listener);

    // 返回取消订阅函数
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  use(middleware) {
    this.middlewares.push(middleware);
  }

  dispatch(action) {
    let result = action;

    // 应用中间件
    for (const middleware of this.middlewares) {
      result = middleware(this, result);
    }

    return result;
  }
}

// store/modules/user.js
export const userModule = {
  state: {
    currentUser: null,
    isLoggedIn: false,
    permissions: [],
  },

  actions: {
    login: (store, { username, password }) => {
      // 模拟登录
      return new Promise((resolve) => {
        setTimeout(() => {
          const user = {
            id: 1,
            username,
            email: `${username}@example.com`,
          };

          store.setState({
            currentUser: user,
            isLoggedIn: true,
            permissions: ['read', 'write'],
          });

          resolve(user);
        }, 1000);
      });
    },

    logout: (store) => {
      store.setState({
        currentUser: null,
        isLoggedIn: false,
        permissions: [],
      });
    },
  },
};

// store/modules/cart.js
export const cartModule = {
  state: {
    items: [],
    total: 0,
  },

  actions: {
    addItem: (store, item) => {
      const state = store.getState();
      const existingItem = state.items.find((i) => i.id === item.id);

      let newItems;
      if (existingItem) {
        newItems = state.items.map((i) => (i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i));
      } else {
        newItems = [...state.items, { ...item, quantity: 1 }];
      }

      const newTotal = newItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

      store.setState({
        items: newItems,
        total: newTotal,
      });
    },

    removeItem: (store, itemId) => {
      const state = store.getState();
      const newItems = state.items.filter((item) => item.id !== itemId);
      const newTotal = newItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

      store.setState({
        items: newItems,
        total: newTotal,
      });
    },
  },
};

// 中间件
export const loggerMiddleware = (store, action) => {
  console.log('Action:', action);
  console.log('State before:', store.getState());

  const result = action(store);

  console.log('State after:', store.getState());
  return result;
};

// 创建应用状态管理
import { Store } from './store';
import { userModule, cartModule, loggerMiddleware } from './store/modules';

const store = new Store({
  ...userModule.state,
  ...cartModule.state,
});

// 使用中间件
store.use(loggerMiddleware);

// 绑定 actions
const actions = {
  ...userModule.actions,
  ...cartModule.actions,
};

// 使用示例
async function example() {
  // 订阅状态变化
  const unsubscribe = store.subscribe((newState, prevState) => {
    console.log('状态变化:', { newState, prevState });
  });

  // 执行操作
  await actions.login(store, { username: 'alice', password: '123456' });

  actions.addItem(store, {
    id: 1,
    name: '商品1',
    price: 99.99,
  });

  // 取消订阅
  unsubscribe();
}
```

> **总结**：模块化的状态管理使应用状态更加可预测和可维护。

## 性能优化技巧

### **Tree Shaking**

```javascript
// utils.js - 提供多个工具函数
export function add(a, b) {
  return a + b;
}

export function subtract(a, b) {
  return a - b;
}

export function multiply(a, b) {
  return a * b;
}

export function divide(a, b) {
  return a / b;
}

// main.js - 只导入需要的函数
import { add, multiply } from './utils.js';

console.log(add(5, 3));
console.log(multiply(4, 7));

// 打包工具会自动移除未使用的 subtract 和 divide 函数

// ❌ 错误：导入整个模块会阻止 Tree Shaking
import * as utils from './utils.js';
console.log(utils.add(5, 3));

// ✅ 正确：按需导入
import { debounce, throttle } from 'lodash-es';
```

### **代码分割**

```javascript
// 路由级代码分割
const routes = [
  {
    path: '/',
    component: () => import('./views/Home.vue'),
  },
  {
    path: '/about',
    component: () => import('./views/About.vue'),
  },
  {
    path: '/admin',
    component: () => import('./views/Admin.vue'),
  },
];

// 组件级代码分割
const LazyComponent = React.lazy(() => import('./LazyComponent'));

function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LazyComponent />
    </Suspense>
  );
}

// 条件加载
async function loadFeature() {
  if (window.screen.width > 768) {
    const { DesktopFeature } = await import('./DesktopFeature');
    return new DesktopFeature();
  } else {
    const { MobileFeature } = await import('./MobileFeature');
    return new MobileFeature();
  }
}

// 预加载
const prefetchLink = document.createElement('link');
prefetchLink.rel = 'prefetch';
prefetchLink.href = '/js/admin-module.js';
document.head.appendChild(prefetchLink);
```

> **总结**：合理使用 Tree Shaking 和代码分割可以显著减少包体积，提升加载性能。

## 核心要点总结

### **模块化发展历程**

- **全局变量** - 简单但容易冲突
- **命名空间** - 减少污染但依赖管理困难
- **IIFE** - 真正的私有作用域
- **CommonJS** - Node.js 的模块标准
- **AMD** - 浏览器异步加载方案
- **UMD** - 跨环境兼容方案
- **ES6 模块** - 现代标准，功能完善

### **选择指南**

- **Node.js 项目** - 使用 CommonJS 或 ES6 模块
- **浏览器项目** - 优先使用 ES6 模块
- **库开发** - 考虑 UMD 兼容多环境
- **现代应用** - ES6 模块 + 打包工具

### **最佳实践**

- **按需导入** - 减少包体积，支持 Tree Shaking
- **统一导出** - 使用 index.js 文件统一管理导出
- **命名规范** - 使用清晰的模块和函数命名
- **依赖管理** - 合理组织模块依赖关系

### **性能优化**

- **Tree Shaking** - 移除未使用的代码
- **代码分割** - 按需加载，减少初始包大小
- **模块缓存** - 利用浏览器和打包工具缓存
- **预加载** - 预先加载可能需要的模块

### **工具生态**

- **打包工具** - Webpack、Rollup、Vite、esbuild
- **转换工具** - Babel、TypeScript
- **开发工具** - ESLint、Prettier
- **包管理** - npm、yarn、pnpm

理解模块化是现代 JavaScript 开发的基础，它不仅解决了代码组织问题，更是构建大型应用的必备技能！
