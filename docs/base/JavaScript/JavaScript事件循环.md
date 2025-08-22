---
title: JavaScript 事件循环
theme: solarized-dark
---

# JavaScript 事件循环

## 简介

事件循环是 JavaScript 运行时的核心机制，它使得 JavaScript 这个单线程语言能够处理异步操作。理解事件循环对于掌握异步编程、性能优化和避免阻塞至关重要。

## 基本概念

### **JavaScript 的单线程特性**

JavaScript 是单线程语言，意味着同一时间只能执行一个任务。但通过事件循环机制，可以实现非阻塞的异步操作。

```javascript
console.log('1');

setTimeout(() => {
  console.log('2');
}, 0);

console.log('3');

// 输出顺序: 1, 3, 2
// 尽管 setTimeout 延迟为 0，但仍然是异步执行
```

> **总结**：JavaScript 单线程执行，但通过事件循环实现异步处理。

### **调用栈（Call Stack）**

调用栈是 JavaScript 执行代码的地方，遵循后进先出（LIFO）的原则。

```javascript
function first() {
  console.log('first');
  second();
}

function second() {
  console.log('second');
  third();
}

function third() {
  console.log('third');
}

first();

// 调用栈执行过程：
// 1. first() 入栈执行
// 2. second() 入栈执行
// 3. third() 入栈执行，输出 'third'，出栈
// 4. second() 继续执行，输出 'second'，出栈
// 5. first() 继续执行，输出 'first'，出栈
```

> **总结**：调用栈管理函数调用的执行顺序，同步代码按照调用顺序执行。

## 事件循环机制

### **任务队列（Task Queue）**

任务队列存储待执行的异步任务，当调用栈为空时，事件循环会将队列中的任务移到调用栈执行。

```javascript
console.log('开始');

setTimeout(() => {
  console.log('定时器1');
}, 0);

setTimeout(() => {
  console.log('定时器2');
}, 0);

console.log('结束');

// 执行过程：
// 1. '开始' 立即执行
// 2. setTimeout 注册回调到任务队列
// 3. '结束' 立即执行
// 4. 调用栈清空，事件循环检查任务队列
// 5. 执行队列中的回调函数

// 输出: 开始, 结束, 定时器1, 定时器2
```

> **总结**：异步操作的回调函数会被放入任务队列，等待调用栈清空后执行。

### **微任务队列（Microtask Queue）**

微任务队列的优先级高于任务队列，每次事件循环都会先清空所有微任务。

```javascript
console.log('开始');

setTimeout(() => {
  console.log('宏任务');
}, 0);

Promise.resolve()
  .then(() => {
    console.log('微任务1');
  })
  .then(() => {
    console.log('微任务2');
  });

console.log('结束');

// 执行顺序：
// 1. 同步代码: 开始, 结束
// 2. 微任务队列: 微任务1, 微任务2
// 3. 宏任务队列: 宏任务

// 输出: 开始, 结束, 微任务1, 微任务2, 宏任务
```

> **总结**：微任务优先级高于宏任务，每轮事件循环都会先执行完所有微任务。

## 宏任务与微任务

### **宏任务（Macrotask）**

宏任务是由宿主环境提供的异步操作，每次事件循环只处理一个宏任务。

```javascript
// 常见的宏任务
setTimeout(() => {
  console.log('setTimeout');
}, 0);

setInterval(() => {
  console.log('setInterval');
}, 1000);

// DOM 事件
document.addEventListener('click', () => {
  console.log('click event');
});

// HTTP 请求（在某些环境中）
fetch('/api/data').then(() => {
  console.log('fetch response');
});
```

> **总结**：宏任务包括 setTimeout、setInterval、DOM 事件等，每轮循环处理一个。

### **微任务（Microtask）**

微任务是由 JavaScript 引擎提供的异步操作，优先级更高。

```javascript
// 常见的微任务
Promise.resolve().then(() => {
  console.log('Promise.then');
});

// async/await 本质上也是 Promise
async function asyncTask() {
  console.log('async 开始');
  await Promise.resolve();
  console.log('async 结束');
}

asyncTask();

// queueMicrotask API
queueMicrotask(() => {
  console.log('queueMicrotask');
});

// MutationObserver
const observer = new MutationObserver(() => {
  console.log('DOM 变化');
});
```

> **总结**：微任务包括 Promise.then、async/await、queueMicrotask 等，优先级最高。

## 事件循环的执行过程

### **完整的事件循环步骤**

```javascript
console.log('1');

setTimeout(() => console.log('2'), 0);

Promise.resolve()
  .then(() => {
    console.log('3');
    return Promise.resolve();
  })
  .then(() => {
    console.log('4');
  });

setTimeout(() => console.log('5'), 0);

console.log('6');

// 执行步骤分析：
// 1. 执行同步代码: 1, 6
// 2. 检查微任务队列: 3, 4
// 3. 执行第一个宏任务: 2
// 4. 检查微任务队列: 无
// 5. 执行第二个宏任务: 5

// 输出: 1, 6, 3, 4, 2, 5
```

> **总结**：事件循环按照同步代码 → 微任务 → 宏任务的顺序执行。

### **复杂示例分析**

```javascript
console.log('脚本开始');

setTimeout(() => {
  console.log('宏任务1');
  Promise.resolve().then(() => {
    console.log('宏任务1中的微任务');
  });
}, 0);

Promise.resolve()
  .then(() => {
    console.log('微任务1');
    setTimeout(() => {
      console.log('微任务1中的宏任务');
    }, 0);
  })
  .then(() => {
    console.log('微任务2');
  });

setTimeout(() => {
  console.log('宏任务2');
}, 0);

console.log('脚本结束');

// 详细执行过程：
// 第1轮事件循环：
//   同步代码: 脚本开始, 脚本结束
//   微任务: 微任务1, 微任务2
//   宏任务: 宏任务1
// 第2轮事件循环：
//   微任务: 宏任务1中的微任务
//   宏任务: 宏任务2
// 第3轮事件循环：
//   宏任务: 微任务1中的宏任务

// 输出: 脚本开始, 脚本结束, 微任务1, 微任务2, 宏任务1, 宏任务1中的微任务, 宏任务2, 微任务1中的宏任务
```

> **总结**：每轮事件循环都会完全清空微任务队列，然后处理一个宏任务。

## 实际应用场景

### **1. DOM 更新优化**

```javascript
// 使用微任务批量更新 DOM
function batchDOMUpdates(updates) {
  let scheduled = false;

  return function scheduleUpdate() {
    if (!scheduled) {
      scheduled = true;

      // 使用微任务确保在下次重绘前执行
      Promise.resolve().then(() => {
        updates.forEach((update) => update());
        scheduled = false;
      });
    }
  };
}

// 使用示例
const updateQueue = [];
const scheduleUpdate = batchDOMUpdates(updateQueue);

function updateElement(id, content) {
  updateQueue.push(() => {
    document.getElementById(id).textContent = content;
  });
  scheduleUpdate();
}

// 多次调用会被批量处理
updateElement('title', '新标题');
updateElement('content', '新内容');
updateElement('footer', '新页脚');
```

> **总结**：利用微任务的优先级实现 DOM 更新的批量处理。

### **2. 异步数据处理**

```javascript
class DataProcessor {
  constructor() {
    this.pendingTasks = [];
    this.processing = false;
  }

  async processData(data) {
    return new Promise((resolve) => {
      this.pendingTasks.push({ data, resolve });
      this.scheduleProcessing();
    });
  }

  scheduleProcessing() {
    if (!this.processing) {
      this.processing = true;

      // 使用微任务确保批量处理
      queueMicrotask(() => {
        this.processBatch();
      });
    }
  }

  processBatch() {
    const batch = this.pendingTasks.splice(0, 10); // 每批处理10个

    batch.forEach(({ data, resolve }) => {
      // 模拟数据处理
      const result = this.transform(data);
      resolve(result);
    });

    this.processing = false;

    // 如果还有待处理任务，继续处理
    if (this.pendingTasks.length > 0) {
      this.scheduleProcessing();
    }
  }

  transform(data) {
    return { ...data, processed: true, timestamp: Date.now() };
  }
}

// 使用示例
const processor = new DataProcessor();

async function handleMultipleData() {
  const promises = [];

  for (let i = 0; i < 25; i++) {
    promises.push(processor.processData({ id: i, value: `data-${i}` }));
  }

  const results = await Promise.all(promises);
  console.log('处理完成:', results.length);
}

handleMultipleData();
```

> **总结**：利用事件循环机制实现高效的批量数据处理。

### **3. 性能监控**

```javascript
class PerformanceMonitor {
  constructor() {
    this.frameCount = 0;
    this.lastTime = performance.now();
    this.fps = 0;
  }

  startMonitoring() {
    this.measureFrame();
  }

  measureFrame() {
    this.frameCount++;

    // 使用 requestAnimationFrame 测量帧率
    requestAnimationFrame(() => {
      const currentTime = performance.now();
      const deltaTime = currentTime - this.lastTime;

      if (deltaTime >= 1000) {
        this.fps = Math.round((this.frameCount * 1000) / deltaTime);
        console.log(`当前 FPS: ${this.fps}`);

        this.frameCount = 0;
        this.lastTime = currentTime;
      }

      this.measureFrame();
    });
  }

  measureTaskDuration(taskName, task) {
    const startTime = performance.now();

    // 使用微任务测量异步任务时长
    Promise.resolve().then(async () => {
      await task();
      const endTime = performance.now();
      const duration = endTime - startTime;

      if (duration > 16.67) {
        // 超过一帧的时间
        console.warn(`任务 ${taskName} 耗时过长: ${duration.toFixed(2)}ms`);
      }
    });
  }
}

// 使用示例
const monitor = new PerformanceMonitor();
monitor.startMonitoring();

// 监控长时间运行的任务
monitor.measureTaskDuration('数据处理', async () => {
  // 模拟耗时任务
  for (let i = 0; i < 1000000; i++) {
    Math.random();
  }
});
```

> **总结**：利用不同类型的任务测量和监控应用性能。

## 常见问题和陷阱

### **1. 微任务死循环**

```javascript
// ❌ 危险：无限创建微任务
function dangerousLoop() {
  Promise.resolve().then(() => {
    console.log('微任务执行');
    dangerousLoop(); // 递归创建微任务
  });
}

// dangerousLoop(); // 不要运行！会导致浏览器卡死

// ✅ 安全：使用宏任务避免阻塞
function safeLoop(count = 0) {
  console.log('任务执行:', count);

  if (count < 10) {
    setTimeout(() => {
      safeLoop(count + 1);
    }, 0);
  }
}

safeLoop();
```

> **总结**：避免在微任务中递归创建微任务，会导致事件循环阻塞。

### **2. 定时器精度问题**

```javascript
// 定时器的实际延迟
console.time('定时器测试');

setTimeout(() => {
  console.timeEnd('定时器测试'); // 实际时间可能大于 100ms
}, 100);

// 更精确的定时器实现
class PreciseTimer {
  static async delay(ms) {
    const startTime = performance.now();

    return new Promise((resolve) => {
      function check() {
        const elapsed = performance.now() - startTime;

        if (elapsed >= ms) {
          resolve();
        } else {
          // 使用 requestAnimationFrame 提高精度
          requestAnimationFrame(check);
        }
      }

      check();
    });
  }
}

// 使用示例
async function testPreciseTimer() {
  console.time('精确定时器');
  await PreciseTimer.delay(100);
  console.timeEnd('精确定时器');
}

testPreciseTimer();
```

> **总结**：定时器的精度受到事件循环影响，可以使用 requestAnimationFrame 提高精度。

### **3. 异步错误处理**

```javascript
// 异步错误的正确处理
function handleAsyncErrors() {
  // 同步错误
  try {
    throw new Error('同步错误');
  } catch (error) {
    console.log('捕获同步错误:', error.message);
  }

  // 异步错误 - Promise
  Promise.reject(new Error('Promise 错误')).catch((error) => {
    console.log('捕获 Promise 错误:', error.message);
  });

  // 异步错误 - setTimeout
  setTimeout(() => {
    try {
      throw new Error('setTimeout 错误');
    } catch (error) {
      console.log('setTimeout 内捕获错误:', error.message);
    }
  }, 0);
}

// 全局错误处理
window.addEventListener('error', (event) => {
  console.log('全局错误处理:', event.error.message);
});

window.addEventListener('unhandledrejection', (event) => {
  console.log('未处理的 Promise 错误:', event.reason.message);
  event.preventDefault(); // 阻止错误输出到控制台
});

handleAsyncErrors();
```

> **总结**：不同类型的异步错误需要不同的处理方式，建立全局错误处理机制。

## 调试和优化技巧

### **可视化事件循环**

```javascript
class EventLoopVisualizer {
  constructor() {
    this.logs = [];
  }

  log(type, message) {
    this.logs.push({
      type,
      message,
      timestamp: performance.now(),
      stack: new Error().stack,
    });
  }

  async visualizeExecution() {
    this.log('sync', '同步代码开始');

    setTimeout(() => {
      this.log('macro', '宏任务执行');
    }, 0);

    Promise.resolve().then(() => {
      this.log('micro', '微任务执行');
    });

    this.log('sync', '同步代码结束');

    // 等待所有异步任务完成
    await new Promise((resolve) => setTimeout(resolve, 10));

    // 输出执行顺序
    this.printExecutionOrder();
  }

  printExecutionOrder() {
    console.table(
      this.logs.map((log) => ({
        类型: log.type,
        消息: log.message,
        时间: log.timestamp.toFixed(2) + 'ms',
      }))
    );
  }
}

// 使用示例
const visualizer = new EventLoopVisualizer();
visualizer.visualizeExecution();
```

> **总结**：通过可视化工具理解和调试事件循环的执行顺序。

### **性能分析工具**

```javascript
class TaskProfiler {
  constructor() {
    this.tasks = new Map();
  }

  profile(name, task) {
    const startTime = performance.now();

    if (task.constructor.name === 'AsyncFunction') {
      return task().finally(() => {
        this.recordTask(name, startTime);
      });
    } else {
      const result = task();
      this.recordTask(name, startTime);
      return result;
    }
  }

  recordTask(name, startTime) {
    const duration = performance.now() - startTime;

    if (!this.tasks.has(name)) {
      this.tasks.set(name, []);
    }

    this.tasks.get(name).push(duration);
  }

  getReport() {
    const report = {};

    for (const [name, durations] of this.tasks) {
      const avg = durations.reduce((a, b) => a + b, 0) / durations.length;
      const max = Math.max(...durations);
      const min = Math.min(...durations);

      report[name] = {
        调用次数: durations.length,
        平均耗时: avg.toFixed(2) + 'ms',
        最大耗时: max.toFixed(2) + 'ms',
        最小耗时: min.toFixed(2) + 'ms',
      };
    }

    return report;
  }
}

// 使用示例
const profiler = new TaskProfiler();

// 测试同步任务
profiler.profile('同步计算', () => {
  let sum = 0;
  for (let i = 0; i < 1000000; i++) {
    sum += i;
  }
  return sum;
});

// 测试异步任务
profiler.profile('异步请求', async () => {
  await new Promise((resolve) => setTimeout(resolve, 100));
});

// 一段时间后查看报告
setTimeout(() => {
  console.table(profiler.getReport());
}, 200);
```

> **总结**：使用性能分析工具识别耗时任务，优化事件循环性能。

## 核心要点总结

### **事件循环机制**

- **单线程** - JavaScript 主线程只能同时执行一个任务
- **调用栈** - 管理同步代码的执行顺序
- **任务队列** - 存储异步操作的回调函数
- **微任务队列** - 优先级高于宏任务的异步操作

### **执行优先级**

1. **同步代码** - 直接在调用栈中执行
2. **微任务** - Promise.then、async/await、queueMicrotask
3. **宏任务** - setTimeout、setInterval、DOM 事件

### **关键原则**

- **微任务优先** - 每轮事件循环都会先清空所有微任务
- **非阻塞** - 长时间运行的任务应该分片处理
- **批量处理** - 利用微任务实现批量操作

### **实际应用**

- **DOM 操作** - 批量更新提高性能
- **数据处理** - 异步处理大量数据
- **性能监控** - 测量和优化任务执行时间
- **错误处理** - 全局异步错误捕获

### **最佳实践**

- **避免微任务死循环** - 防止阻塞事件循环
- **合理使用定时器** - 理解定时器的精度限制
- **建立错误处理机制** - 处理各种异步错误
- **性能监控** - 识别和优化性能瓶颈

理解事件循环是掌握 JavaScript 异步编程的关键，它解释了异步代码的执行顺序和性能特征！
