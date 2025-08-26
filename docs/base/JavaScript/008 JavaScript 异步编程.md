---
title: 008 JavaScript 异步编程
theme: solarized-dark
---

# JavaScript 异步编程

## 简介

JavaScript 是单线程语言，但通过异步编程可以处理耗时操作而不阻塞主线程。异步编程从最初的回调函数，发展到 Promise，再到现代的 async/await，让异步代码越来越简洁和易读。

## 回调函数（Callback）

### **基本概念**

回调函数是作为参数传递给其他函数的函数，在特定事件发生或任务完成时被调用。

```javascript
// 基本回调示例
function greet(name, callback) {
  console.log(`Hello, ${name}!`);
  callback();
}

function afterGreet() {
  console.log('Nice to meet you!');
}

greet('Alice', afterGreet);
// 输出:
// Hello, Alice!
// Nice to meet you!

// 异步回调示例
function fetchData(callback) {
  console.log('开始获取数据...');

  setTimeout(() => {
    const data = { id: 1, name: '用户数据' };
    callback(data);
  }, 2000);
}

fetchData((data) => {
  console.log('数据获取完成:', data);
});
console.log('这行会先执行');
```

> **总结**：回调函数是异步编程的基础，通过函数参数传递来处理异步操作的结果。

### **回调地狱问题**

```javascript
// 回调地狱示例
function getUser(userId, callback) {
  setTimeout(() => {
    callback({ id: userId, name: 'Alice' });
  }, 1000);
}

function getPosts(userId, callback) {
  setTimeout(() => {
    callback([
      { id: 1, title: '文章1' },
      { id: 2, title: '文章2' },
    ]);
  }, 1000);
}

function getComments(postId, callback) {
  setTimeout(() => {
    callback([{ id: 1, content: '评论内容' }]);
  }, 1000);
}

// 嵌套调用导致回调地狱
getUser(1, (user) => {
  console.log('用户:', user);

  getPosts(user.id, (posts) => {
    console.log('文章:', posts);

    getComments(posts[0].id, (comments) => {
      console.log('评论:', comments);
      // 继续嵌套...
    });
  });
});
```

> **总结**：多层嵌套的回调函数形成"回调地狱"，代码难以阅读和维护。

## Promise

### **基本概念**

Promise 是表示异步操作最终完成或失败的对象，有三种状态：pending（进行中）、fulfilled（已成功）、rejected（已失败）。

```javascript
// 创建 Promise
const myPromise = new Promise((resolve, reject) => {
  const success = true;

  setTimeout(() => {
    if (success) {
      resolve('操作成功！');
    } else {
      reject('操作失败！');
    }
  }, 1000);
});

// 使用 Promise
myPromise
  .then((result) => {
    console.log(result); // '操作成功！'
  })
  .catch((error) => {
    console.log(error);
  });

// Promise 状态演示
function createPromise(shouldResolve) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (shouldResolve) {
        resolve('成功数据');
      } else {
        reject(new Error('失败原因'));
      }
    }, 1000);
  });
}

createPromise(true)
  .then((data) => console.log('成功:', data))
  .catch((error) => console.log('失败:', error.message));
```

> **总结**：Promise 提供了更优雅的异步处理方式，避免了回调地狱问题。

### **Promise 链式调用**

```javascript
// 重写回调地狱示例
function getUser(userId) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ id: userId, name: 'Alice' });
    }, 1000);
  });
}

function getPosts(userId) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        { id: 1, title: '文章1' },
        { id: 2, title: '文章2' },
      ]);
    }, 1000);
  });
}

function getComments(postId) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([{ id: 1, content: '评论内容' }]);
    }, 1000);
  });
}

// 链式调用
getUser(1)
  .then((user) => {
    console.log('用户:', user);
    return getPosts(user.id);
  })
  .then((posts) => {
    console.log('文章:', posts);
    return getComments(posts[0].id);
  })
  .then((comments) => {
    console.log('评论:', comments);
  })
  .catch((error) => {
    console.log('错误:', error);
  });
```

> **总结**：Promise 链式调用使异步代码更线性和易读，每个 then 处理前一步的结果。

### **Promise 静态方法**

```javascript
// Promise.all - 等待所有 Promise 完成
const promise1 = Promise.resolve(1);
const promise2 = Promise.resolve(2);
const promise3 = Promise.resolve(3);

Promise.all([promise1, promise2, promise3]).then((values) => {
  console.log(values); // [1, 2, 3]
});

// Promise.race - 返回最先完成的 Promise
const fastPromise = new Promise((resolve) => setTimeout(() => resolve('快'), 100));
const slowPromise = new Promise((resolve) => setTimeout(() => resolve('慢'), 1000));

Promise.race([fastPromise, slowPromise]).then((value) => {
  console.log(value); // '快'
});

// Promise.allSettled - 等待所有 Promise 完成（无论成功失败）
const promises = [Promise.resolve('成功1'), Promise.reject('失败'), Promise.resolve('成功2')];

Promise.allSettled(promises).then((results) => {
  console.log(results);
  // [
  //   { status: 'fulfilled', value: '成功1' },
  //   { status: 'rejected', reason: '失败' },
  //   { status: 'fulfilled', value: '成功2' }
  // ]
});

// Promise.any - 返回第一个成功的 Promise
const promises2 = [Promise.reject('错误1'), Promise.resolve('成功'), Promise.reject('错误2')];

Promise.any(promises2)
  .then((value) => {
    console.log(value); // '成功'
  })
  .catch((error) => {
    console.log('所有都失败了');
  });
```

> **总结**：Promise 静态方法提供了处理多个异步操作的强大工具。

## async/await

### **基本概念**

async/await 是基于 Promise 的语法糖，让异步代码看起来像同步代码，更易读和维护。

```javascript
// async 函数声明
async function fetchData() {
  return '数据'; // 自动包装在 Promise 中
}

// 等价于
function fetchDataPromise() {
  return Promise.resolve('数据');
}

// await 使用
async function getData() {
  try {
    const result = await fetchData();
    console.log(result); // '数据'
  } catch (error) {
    console.log('错误:', error);
  }
}

getData();

// 处理异步操作
function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function sequentialTasks() {
  console.log('开始任务');

  await delay(1000);
  console.log('任务1完成');

  await delay(1000);
  console.log('任务2完成');

  return '所有任务完成';
}

sequentialTasks().then((result) => console.log(result));
```

> **总结**：async/await 让异步代码更像同步代码，提高了代码的可读性和维护性。

### **错误处理**

```javascript
// try-catch 错误处理
async function handleErrors() {
  try {
    const data1 = await Promise.resolve('成功数据');
    console.log(data1);

    const data2 = await Promise.reject(new Error('网络错误'));
    console.log(data2); // 不会执行
  } catch (error) {
    console.log('捕获错误:', error.message); // '网络错误'
  }
}

handleErrors();

// 分别处理不同错误
async function handleMultipleErrors() {
  try {
    const userData = await getUser(1);
    console.log('用户数据:', userData);
  } catch (error) {
    console.log('获取用户失败:', error);
    return; // 提前返回
  }

  try {
    const postsData = await getPosts(1);
    console.log('文章数据:', postsData);
  } catch (error) {
    console.log('获取文章失败:', error);
    // 继续执行其他代码
  }
}

// 使用 Promise.catch() 的另一种方式
async function alternativeErrorHandling() {
  const userData = await getUser(1).catch((error) => {
    console.log('用户获取失败:', error);
    return null; // 提供默认值
  });

  if (userData) {
    console.log('用户数据:', userData);
  } else {
    console.log('使用默认用户数据');
  }
}
```

> **总结**：async/await 使用 try-catch 进行错误处理，比 Promise 的 catch 更直观。

### **并发执行**

```javascript
// 串行执行（等待每个完成）
async function serialExecution() {
  console.time('串行执行');

  const result1 = await delay(1000);
  const result2 = await delay(1000);
  const result3 = await delay(1000);

  console.timeEnd('串行执行'); // 约 3000ms
  return [result1, result2, result3];
}

// 并行执行（同时开始）
async function parallelExecution() {
  console.time('并行执行');

  const promise1 = delay(1000);
  const promise2 = delay(1000);
  const promise3 = delay(1000);

  const results = await Promise.all([promise1, promise2, promise3]);

  console.timeEnd('并行执行'); // 约 1000ms
  return results;
}

// 实际应用示例
async function fetchUserData(userId) {
  // 并行获取用户基本信息和设置
  const [userInfo, userSettings, userPosts] = await Promise.all([
    getUser(userId),
    getUserSettings(userId),
    getPosts(userId),
  ]);

  return {
    info: userInfo,
    settings: userSettings,
    posts: userPosts,
  };
}

// 有条件的并行执行
async function conditionalParallel(userId) {
  const user = await getUser(userId);

  // 根据用户类型决定获取哪些数据
  const promises = [getPosts(userId)];

  if (user.isPremium) {
    promises.push(getPremiumContent(userId));
  }

  if (user.isAdmin) {
    promises.push(getAdminData(userId));
  }

  const results = await Promise.all(promises);
  return results;
}
```

> **总结**：理解串行和并行执行的区别，合理使用 Promise.all 提高性能。

## 实际应用场景

### **1. API 调用**

```javascript
// 封装 HTTP 请求
class ApiClient {
  constructor(baseURL) {
    this.baseURL = baseURL;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API 请求失败:', error);
      throw error;
    }
  }

  async get(endpoint) {
    return this.request(endpoint);
  }

  async post(endpoint, data) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async put(endpoint, data) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async delete(endpoint) {
    return this.request(endpoint, {
      method: 'DELETE',
    });
  }
}

// 使用示例
const api = new ApiClient('https://api.example.com');

async function handleUserOperations() {
  try {
    // 获取用户列表
    const users = await api.get('/users');
    console.log('用户列表:', users);

    // 创建新用户
    const newUser = await api.post('/users', {
      name: 'Alice',
      email: 'alice@example.com',
    });
    console.log('新用户:', newUser);

    // 更新用户
    const updatedUser = await api.put(`/users/${newUser.id}`, {
      name: 'Alice Smith',
    });
    console.log('更新后用户:', updatedUser);
  } catch (error) {
    console.error('操作失败:', error);
  }
}
```

> **总结**：封装 API 调用使异步操作更加规范和易于维护。

### **2. 文件操作**

```javascript
// 文件上传
async function uploadFile(file) {
  const formData = new FormData();
  formData.append('file', file);

  try {
    // 显示上传进度
    const response = await fetch('/upload', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('上传失败');
    }

    const result = await response.json();
    console.log('上传成功:', result);
    return result;
  } catch (error) {
    console.error('上传错误:', error);
    throw error;
  }
}

// 批量文件上传
async function uploadMultipleFiles(files) {
  const uploadPromises = Array.from(files).map((file) => uploadFile(file));

  try {
    const results = await Promise.allSettled(uploadPromises);

    const successful = results.filter((result) => result.status === 'fulfilled');
    const failed = results.filter((result) => result.status === 'rejected');

    console.log(`成功上传 ${successful.length} 个文件`);
    console.log(`失败 ${failed.length} 个文件`);

    return { successful, failed };
  } catch (error) {
    console.error('批量上传错误:', error);
  }
}

// 文件读取
function readFileAsText(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => resolve(event.target.result);
    reader.onerror = (error) => reject(error);

    reader.readAsText(file);
  });
}

async function processFiles(files) {
  for (const file of files) {
    try {
      const content = await readFileAsText(file);
      console.log(`文件 ${file.name} 内容:`, content);
    } catch (error) {
      console.error(`读取文件 ${file.name} 失败:`, error);
    }
  }
}
```

> **总结**：异步编程在文件操作中处理上传、下载、读取等耗时操作。

### **3. 定时任务和动画**

```javascript
// 定时任务管理
class TaskScheduler {
  constructor() {
    this.tasks = [];
    this.isRunning = false;
  }

  // 添加延时任务
  addDelayedTask(fn, delay) {
    return new Promise((resolve) => {
      setTimeout(async () => {
        const result = await fn();
        resolve(result);
      }, delay);
    });
  }

  // 添加重复任务
  addRepeatingTask(fn, interval) {
    const task = {
      id: Date.now(),
      fn,
      interval,
      isActive: true,
    };

    this.tasks.push(task);
    this.runRepeatingTask(task);

    return task.id;
  }

  async runRepeatingTask(task) {
    while (task.isActive) {
      try {
        await task.fn();
      } catch (error) {
        console.error('任务执行错误:', error);
      }

      await this.delay(task.interval);
    }
  }

  // 停止任务
  stopTask(taskId) {
    const task = this.tasks.find((t) => t.id === taskId);
    if (task) {
      task.isActive = false;
    }
  }

  delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

// 使用示例
const scheduler = new TaskScheduler();

// 延时任务
scheduler.addDelayedTask(() => {
  console.log('3秒后执行的任务');
}, 3000);

// 重复任务
const taskId = scheduler.addRepeatingTask(() => {
  console.log('每2秒执行一次:', new Date().toLocaleTimeString());
}, 2000);

// 10秒后停止重复任务
setTimeout(() => {
  scheduler.stopTask(taskId);
  console.log('重复任务已停止');
}, 10000);

// 动画帧处理
class AnimationController {
  constructor() {
    this.animations = [];
  }

  async animate(element, properties, duration) {
    return new Promise((resolve) => {
      const startTime = performance.now();
      const startValues = {};

      // 获取初始值
      for (const prop in properties) {
        startValues[prop] = parseFloat(getComputedStyle(element)[prop]) || 0;
      }

      const animate = (currentTime) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // 应用缓动函数
        const eased = this.easeInOutCubic(progress);

        // 更新样式
        for (const prop in properties) {
          const startValue = startValues[prop];
          const endValue = properties[prop];
          const currentValue = startValue + (endValue - startValue) * eased;

          element.style[prop] = `${currentValue}px`;
        }

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          resolve();
        }
      };

      requestAnimationFrame(animate);
    });
  }

  easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
  }

  async sequence(animations) {
    for (const animation of animations) {
      await this.animate(animation.element, animation.properties, animation.duration);
    }
  }

  async parallel(animations) {
    const promises = animations.map((animation) =>
      this.animate(animation.element, animation.properties, animation.duration)
    );

    await Promise.all(promises);
  }
}
```

> **总结**：异步编程在定时任务和动画中提供流畅的用户体验。

## 错误处理最佳实践

### **全局错误处理**

```javascript
// 全局 Promise 错误处理
window.addEventListener('unhandledrejection', (event) => {
  console.error('未处理的 Promise 错误:', event.reason);

  // 可以选择阻止错误显示在控制台
  event.preventDefault();

  // 发送错误报告
  reportError(event.reason);
});

// 错误报告函数
async function reportError(error) {
  try {
    await fetch('/api/errors', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString(),
      }),
    });
  } catch (reportingError) {
    console.error('错误报告失败:', reportingError);
  }
}

// 统一错误处理装饰器
function withErrorHandling(fn) {
  return async function (...args) {
    try {
      return await fn.apply(this, args);
    } catch (error) {
      console.error(`函数 ${fn.name} 执行错误:`, error);

      // 可以在这里添加通用错误处理逻辑
      throw error; // 重新抛出错误
    }
  };
}

// 使用装饰器
const safeApiCall = withErrorHandling(async function (url) {
  const response = await fetch(url);
  return response.json();
});
```

> **总结**：建立完善的错误处理机制，包括全局捕获和错误报告。

## 性能优化技巧

### **避免常见陷阱**

```javascript
// ❌ 错误：在循环中使用 await（串行执行）
async function slowProcessing(items) {
  const results = [];

  for (const item of items) {
    const result = await processItem(item); // 逐个等待
    results.push(result);
  }

  return results;
}

// ✅ 正确：并行处理
async function fastProcessing(items) {
  const promises = items.map((item) => processItem(item));
  return Promise.all(promises);
}

// ✅ 如果需要控制并发数量
async function controlledProcessing(items, concurrency = 3) {
  const results = [];

  for (let i = 0; i < items.length; i += concurrency) {
    const batch = items.slice(i, i + concurrency);
    const batchPromises = batch.map((item) => processItem(item));
    const batchResults = await Promise.all(batchPromises);
    results.push(...batchResults);
  }

  return results;
}

// 超时处理
function withTimeout(promise, ms) {
  const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error('操作超时')), ms));

  return Promise.race([promise, timeout]);
}

// 使用示例
async function fetchWithTimeout(url) {
  try {
    const response = await withTimeout(fetch(url), 5000);
    return response.json();
  } catch (error) {
    if (error.message === '操作超时') {
      console.log('请求超时');
    }
    throw error;
  }
}

// 重试机制
async function withRetry(fn, maxAttempts = 3, delay = 1000) {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (attempt === maxAttempts) {
        throw error;
      }

      console.log(`尝试 ${attempt} 失败，${delay}ms 后重试`);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
}
```

> **总结**：理解串行和并行的性能差异，合理使用超时和重试机制。

## 核心要点总结

### **异步编程演进**

- **回调函数** - 最基础的异步处理方式，容易形成回调地狱
- **Promise** - 解决回调地狱，提供链式调用和更好的错误处理
- **async/await** - 让异步代码看起来像同步代码，最易读的方式

### **选择指南**

- **简单异步操作** - 使用 async/await
- **多个并行操作** - 使用 Promise.all/Promise.allSettled
- **复杂流程控制** - 结合使用 async/await 和 Promise 方法
- **兼容性要求** - 根据目标环境选择合适的方案

### **最佳实践**

- **错误处理** - 始终处理 Promise 的 rejection
- **性能优化** - 区分串行和并行执行
- **代码组织** - 封装异步操作为可复用的函数
- **调试友好** - 使用有意义的函数名和错误信息

### **实际应用**

- **API 调用** - 网络请求和数据获取
- **文件操作** - 上传、下载、读取文件
- **用户交互** - 动画、定时任务、事件处理
- **状态管理** - 异步状态更新和同步

理解异步编程是现代 JavaScript 开发的核心技能，它让我们能够构建响应式和高性能的应用程序！
