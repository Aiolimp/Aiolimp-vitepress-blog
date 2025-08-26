---
title: 006 JavaScript 执行上下文与闭包
theme: solarized-dark
---

# JavaScript 执行上下文与闭包

## 简介

执行上下文和闭包是 JavaScript 中两个重要且相关的概念。执行上下文决定了代码的执行环境，而闭包则是 JavaScript 函数式编程的核心特性。理解这两个概念对于掌握 JavaScript 的运行机制至关重要。

## 什么是执行上下文

### **基本概念**

执行上下文是 JavaScript 代码执行时的环境，它包含了变量、函数声明、this 值等信息。每当代码执行时，都会创建一个对应的执行上下文。

```javascript
// 全局执行上下文
var globalVar = 'Global';

function outerFunction() {
  // outerFunction 执行上下文
  var outerVar = 'Outer';

  function innerFunction() {
    // innerFunction 执行上下文
    var innerVar = 'Inner';
    console.log(globalVar); // 'Global'
    console.log(outerVar); // 'Outer'
    console.log(innerVar); // 'Inner'
  }

  innerFunction();
}

outerFunction();
```

> **总结**：执行上下文是代码执行时的环境，包含变量、函数和 this 的信息。

### **执行上下文的类型**

```javascript
// 1. 全局执行上下文
var globalVariable = 'I am global';

// 2. 函数执行上下文
function myFunction() {
  var functionVariable = 'I am in function';
  return functionVariable;
}

// 3. eval 执行上下文（不推荐使用）
eval('var evalVariable = "I am in eval"');

console.log(globalVariable); // 'I am global'
console.log(myFunction()); // 'I am in function'
```

> **总结**：主要有全局执行上下文和函数执行上下文两种类型。

### **执行栈（Call Stack）**

```javascript
function first() {
  console.log('First function');
  second();
}

function second() {
  console.log('Second function');
  third();
}

function third() {
  console.log('Third function');
}

// 执行栈过程：
// 1. 全局执行上下文入栈
// 2. first() 执行上下文入栈
// 3. second() 执行上下文入栈
// 4. third() 执行上下文入栈
// 5. third() 执行完毕，出栈
// 6. second() 执行完毕，出栈
// 7. first() 执行完毕，出栈
// 8. 只剩全局执行上下文

first();
```

> **总结**：执行栈管理执行上下文的创建和销毁，遵循后进先出的原则。

## 什么是闭包

### **基本概念**

闭包是指函数能够访问其外部作用域变量的特性，即使外部函数已经执行完毕。闭包由函数和其词法环境组成。

```javascript
function outerFunction(x) {
  // 外部函数的变量
  var outerVariable = x;

  // 内部函数（闭包）
  function innerFunction(y) {
    // 可以访问外部函数的变量
    console.log(outerVariable + y);
  }

  return innerFunction;
}

// 创建闭包
var myClosure = outerFunction(10);

// 调用闭包，仍能访问 outerVariable
myClosure(5); // 输出: 15

// 外部函数已执行完毕，但 outerVariable 仍然可访问
```

> **总结**：闭包使函数能够"记住"其创建时的词法环境，访问外部作用域的变量。

### **闭包的形成条件**

```javascript
// 条件1：嵌套函数
function outer() {
  var data = 'secret';

  // 条件2：内部函数引用外部变量
  function inner() {
    return data;
  }

  // 条件3：内部函数被返回或传递到外部
  return inner;
}

var getClosure = outer();
console.log(getClosure()); // 'secret' - 闭包形成

// 另一种形式 - 回调函数中的闭包
function setupTimer() {
  var count = 0;

  setInterval(function () {
    count++;
    console.log(`Count: ${count}`);
  }, 1000);
}

setupTimer(); // 每秒输出递增的数字
```

> **总结**：闭包需要嵌套函数、内部函数引用外部变量、内部函数被外部访问三个条件。

## 闭包的实际应用

### **1. 数据私有化**

```javascript
function createCounter() {
  var count = 0; // 私有变量

  return {
    increment: function () {
      count++;
      return count;
    },
    decrement: function () {
      count--;
      return count;
    },
    getCount: function () {
      return count;
    },
  };
}

var counter = createCounter();
console.log(counter.increment()); // 1
console.log(counter.increment()); // 2
console.log(counter.getCount()); // 2

// count 变量无法直接访问，实现了数据私有化
console.log(counter.count); // undefined
```

> **总结**：闭包可以创建私有变量，实现数据封装和信息隐藏。

### **2. 模块模式**

```javascript
var Calculator = (function () {
  // 私有变量和方法
  var result = 0;

  function log(operation, value) {
    console.log(`${operation}: ${value}, Result: ${result}`);
  }

  // 公共接口
  return {
    add: function (value) {
      result += value;
      log('Add', value);
      return this;
    },

    subtract: function (value) {
      result -= value;
      log('Subtract', value);
      return this;
    },

    multiply: function (value) {
      result *= value;
      log('Multiply', value);
      return this;
    },

    getResult: function () {
      return result;
    },

    reset: function () {
      result = 0;
      log('Reset', 0);
      return this;
    },
  };
})();

// 使用模块
Calculator.add(10).multiply(2).subtract(5);

console.log(Calculator.getResult()); // 15
```

> **总结**：闭包可以创建模块，提供公共接口同时隐藏内部实现。

### **3. 函数工厂**

```javascript
function createMultiplier(multiplier) {
  return function (number) {
    return number * multiplier;
  };
}

// 创建不同的乘法器
var double = createMultiplier(2);
var triple = createMultiplier(3);
var quadruple = createMultiplier(4);

console.log(double(5)); // 10
console.log(triple(5)); // 15
console.log(quadruple(5)); // 20

// 每个函数都"记住"了自己的 multiplier 值
```

> **总结**：闭包可以创建定制化的函数，每个函数保持自己的状态。

### **4. 防抖和节流**

```javascript
// 防抖函数
function debounce(func, delay) {
  var timeoutId;

  return function () {
    var context = this;
    var args = arguments;

    clearTimeout(timeoutId);
    timeoutId = setTimeout(function () {
      func.apply(context, args);
    }, delay);
  };
}

// 节流函数
function throttle(func, limit) {
  var inThrottle;

  return function () {
    var context = this;
    var args = arguments;

    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(function () {
        inThrottle = false;
      }, limit);
    }
  };
}

// 使用示例
var debouncedSave = debounce(function () {
  console.log('Saving data...');
}, 1000);

var throttledScroll = throttle(function () {
  console.log('Scroll event');
}, 100);
```

> **总结**：闭包在防抖和节流等性能优化场景中发挥重要作用。

## 常见问题和注意事项

### **1. 循环中的闭包问题**

```javascript
// ❌ 常见错误
var buttons = [];
for (var i = 0; i < 3; i++) {
  buttons[i] = function () {
    console.log(`Button ${i} clicked`); // 总是输出 "Button 3 clicked"
  };
}

buttons[0](); // "Button 3 clicked"
buttons[1](); // "Button 3 clicked"

// ✅ 解决方案1: 使用 IIFE（立即执行函数）
var buttonsFixed1 = [];
for (var i = 0; i < 3; i++) {
  buttonsFixed1[i] = (function (index) {
    return function () {
      console.log(`Button ${index} clicked`);
    };
  })(i);
}

// ✅ 解决方案2: 使用 let
var buttonsFixed2 = [];
for (let i = 0; i < 3; i++) {
  buttonsFixed2[i] = function () {
    console.log(`Button ${i} clicked`);
  };
}

buttonsFixed1[0](); // "Button 0 clicked"
buttonsFixed2[1](); // "Button 1 clicked"
```

> **总结**：循环中创建闭包要注意变量的作用域问题，使用 IIFE 或 let 来解决。

### **2. 内存泄漏问题**

```javascript
// ❌ 可能导致内存泄漏
function attachListener() {
  var largeData = new Array(1000000).fill('data');

  document.getElementById('button').onclick = function () {
    // 即使不使用 largeData，闭包也会保持对它的引用
    console.log('Button clicked');
  };
}

// ✅ 避免内存泄漏
function attachListenerFixed() {
  var largeData = new Array(1000000).fill('data');

  document.getElementById('button').onclick = function () {
    console.log('Button clicked');
  };

  // 手动清除不需要的引用
  largeData = null;
}

// 更好的方案：只引用需要的数据
function attachListenerBetter() {
  var largeData = new Array(1000000).fill('data');
  var neededData = largeData.length; // 只保留需要的信息
  largeData = null; // 立即清除

  document.getElementById('button').onclick = function () {
    console.log(`Data length was: ${neededData}`);
  };
}
```

> **总结**：闭包会保持对外部变量的引用，要注意及时清理不需要的数据避免内存泄漏。

## 执行上下文与闭包的关系

### **词法环境和变量对象**

```javascript
function createFunction() {
  var outerVar = 'I am outer';

  return function (innerVar) {
    // 这个函数的词法环境包含：
    // 1. 自己的变量 innerVar
    // 2. 外部函数的变量 outerVar
    // 3. 全局变量

    console.log(innerVar); // 当前作用域
    console.log(outerVar); // 外部作用域（闭包）
    console.log(window); // 全局作用域
  };
}

var myFunction = createFunction();
myFunction('I am inner');

// 执行上下文为闭包提供了变量查找的机制
// 闭包保持了对外部词法环境的引用
```

> **总结**：执行上下文的词法环境机制是闭包能够访问外部变量的基础。

## 核心要点总结

### **执行上下文**

- **定义** - 代码执行时的环境，包含变量、函数和 this
- **类型** - 全局执行上下文、函数执行上下文
- **管理** - 通过执行栈管理创建和销毁

### **闭包**

- **定义** - 函数能够访问其外部作用域变量的特性
- **形成条件** - 嵌套函数 + 引用外部变量 + 被外部访问
- **核心价值** - 数据私有化、状态保持、模块封装

### **实际应用**

- **数据封装** - 创建私有变量和方法
- **模块模式** - 实现代码组织和信息隐藏
- **函数工厂** - 创建定制化的函数
- **性能优化** - 防抖、节流等场景

### **注意事项**

- **循环闭包** - 使用 IIFE 或 let 解决变量共享问题
- **内存管理** - 及时清理不需要的引用避免内存泄漏
- **性能考虑** - 闭包会保持外部环境引用，适度使用

理解执行上下文和闭包有助于写出更优雅、更高效的 JavaScript 代码，这是成为 JavaScript 高手的必备知识！
