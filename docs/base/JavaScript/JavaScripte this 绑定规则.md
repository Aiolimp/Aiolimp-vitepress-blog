---
title: JavaScript this 绑定规则
theme: solarized-dark
---

# JavaScript this 绑定规则

## 简介

`this` 是 JavaScript 中最容易混淆的概念之一。它的值不是在函数定义时确定的，而是在函数调用时根据调用方式动态绑定的。理解 `this` 的绑定规则是掌握 JavaScript 面向对象编程的关键。

## this 绑定的四种规则

### **1. 默认绑定**

当函数独立调用时，`this` 指向全局对象（浏览器中是 `window`，严格模式下是 `undefined`）。

```javascript
function sayHello() {
  console.log(this); // 浏览器中指向 window
  console.log(this.name); // undefined（如果 window.name 不存在）
}

sayHello(); // 独立调用

// 严格模式下
('use strict');
function sayHelloStrict() {
  console.log(this); // undefined
}

sayHelloStrict();
```

> **总结**：独立函数调用时，this 指向全局对象，严格模式下为 undefined。

### **2. 隐式绑定**

当函数作为对象的方法调用时，`this` 指向调用该方法的对象。

```javascript
const person = {
  name: 'Alice',
  greet: function () {
    console.log(`Hello, I'm ${this.name}`);
  },
};

person.greet(); // "Hello, I'm Alice" - this 指向 person

// 多层嵌套的情况
const obj = {
  name: 'Object',
  nested: {
    name: 'Nested',
    getName: function () {
      return this.name;
    },
  },
};

console.log(obj.nested.getName()); // "Nested" - this 指向 nested
```

> **总结**：作为对象方法调用时，this 指向调用该方法的对象。

### **3. 显式绑定**

使用 `call`、`apply` 或 `bind` 方法可以显式指定 `this` 的值。

```javascript
function introduce() {
  console.log(`Hi, I'm ${this.name}, I'm ${this.age} years old`);
}

const person1 = { name: 'Alice', age: 25 };
const person2 = { name: 'Bob', age: 30 };

// 使用 call
introduce.call(person1); // "Hi, I'm Alice, I'm 25 years old"
introduce.call(person2); // "Hi, I'm Bob, I'm 30 years old"

// 使用 apply（参数以数组形式传递）
function greetWithTime(greeting, time) {
  console.log(`${greeting}, I'm ${this.name}. It's ${time} now.`);
}

greetWithTime.apply(person1, ['Good morning', '9 AM']);
// "Good morning, I'm Alice. It's 9 AM now."

// 使用 bind（创建新函数）
const boundIntroduce = introduce.bind(person1);
boundIntroduce(); // "Hi, I'm Alice, I'm 25 years old"
```

> **总结**：call/apply 立即调用函数并绑定 this，bind 创建新函数并绑定 this。

### **4. new 绑定**

使用 `new` 操作符调用函数时，`this` 指向新创建的对象实例。

```javascript
function Person(name, age) {
  this.name = name;
  this.age = age;
  this.introduce = function () {
    console.log(`Hi, I'm ${this.name}, I'm ${this.age} years old`);
  };
}

const alice = new Person('Alice', 25);
const bob = new Person('Bob', 30);

alice.introduce(); // "Hi, I'm Alice, I'm 25 years old"
bob.introduce(); // "Hi, I'm Bob, I'm 30 years old"

console.log(alice instanceof Person); // true
```

> **总结**：使用 new 调用构造函数时，this 指向新创建的对象实例。

## 绑定优先级

当多种绑定规则同时存在时，优先级从高到低为：

```javascript
function test() {
  console.log(this.name);
}

const obj1 = {
  name: 'obj1',
  test: test,
};

const obj2 = {
  name: 'obj2',
};

// 1. new 绑定 > 显式绑定
function Test(name) {
  this.name = name;
}

const boundTest = Test.bind(obj1);
const instance = new boundTest('new binding');
console.log(instance.name); // "new binding" - new 绑定优先

// 2. 显式绑定 > 隐式绑定
obj1.test(); // "obj1" - 隐式绑定
obj1.test.call(obj2); // "obj2" - 显式绑定优先

// 3. 隐式绑定 > 默认绑定
test(); // undefined 或 window.name - 默认绑定
obj1.test(); // "obj1" - 隐式绑定优先
```

> **总结**：优先级顺序：new 绑定 > 显式绑定 > 隐式绑定 > 默认绑定。

## 特殊情况和陷阱

### **1. 隐式丢失**

当方法被赋值给变量或作为参数传递时，会丢失隐式绑定。

```javascript
const person = {
  name: 'Alice',
  greet: function () {
    console.log(`Hello, I'm ${this.name}`);
  },
};

// 情况1：赋值给变量
const greet = person.greet;
greet(); // "Hello, I'm undefined" - 丢失了隐式绑定

// 情况2：作为回调函数
function callFunction(fn) {
  fn(); // 独立调用
}

callFunction(person.greet); // "Hello, I'm undefined"

// 解决方案：使用 bind
const boundGreet = person.greet.bind(person);
callFunction(boundGreet); // "Hello, I'm Alice"
```

> **总结**：方法赋值或传递时容易丢失隐式绑定，使用 bind 可以解决。

### **2. 箭头函数的 this**

箭头函数不绑定自己的 `this`，而是继承外层作用域的 `this`。

```javascript
const obj = {
  name: 'Object',

  // 普通函数
  regularMethod: function () {
    console.log('Regular:', this.name); // "Object"

    // 内部普通函数
    function innerFunction() {
      console.log('Inner regular:', this.name); // undefined（独立调用）
    }

    // 内部箭头函数
    const innerArrow = () => {
      console.log('Inner arrow:', this.name); // "Object"（继承外层 this）
    };

    innerFunction();
    innerArrow();
  },

  // 箭头函数方法
  arrowMethod: () => {
    console.log('Arrow method:', this.name); // undefined（继承全局 this）
  },
};

obj.regularMethod();
obj.arrowMethod();
```

> **总结**：箭头函数继承外层作用域的 this，不能通过 call/apply/bind 改变。

### **3. 事件处理中的 this**

```javascript
const button = document.getElementById('myButton');

const handler = {
  name: 'Handler',

  // 普通函数作为事件处理器
  handleClick: function () {
    console.log(this); // 指向 button 元素
    console.log(this.name); // undefined
  },

  // 箭头函数作为事件处理器
  handleClickArrow: () => {
    console.log(this); // 指向 window 或 undefined
  },

  // 正确的处理方式
  init: function () {
    // 方式1：使用 bind
    button.addEventListener('click', this.handleClick.bind(this));

    // 方式2：使用箭头函数包装
    button.addEventListener('click', () => {
      this.handleClick();
    });
  },
};
```

> **总结**：事件处理器中 this 通常指向触发事件的元素，需要使用 bind 或箭头函数包装来保持原有 this。

## 实际应用场景

### **1. 类和构造函数**

```javascript
// ES5 构造函数
function Car(brand, model) {
  this.brand = brand;
  this.model = model;
  this.start = function () {
    console.log(`${this.brand} ${this.model} is starting...`);
  };
}

const myCar = new Car('Toyota', 'Camry');
myCar.start(); // "Toyota Camry is starting..."

// ES6 类（本质上也是基于 this 绑定）
class ElectricCar {
  constructor(brand, model) {
    this.brand = brand;
    this.model = model;
  }

  start() {
    console.log(`${this.brand} ${this.model} is starting silently...`);
  }

  // 箭头函数方法（绑定实例 this）
  charge = () => {
    console.log(`Charging ${this.brand} ${this.model}...`);
  };
}

const tesla = new ElectricCar('Tesla', 'Model 3');
tesla.start(); // "Tesla Model 3 is starting silently..."

// 方法赋值不会丢失 this（箭头函数）
const chargeMethod = tesla.charge;
chargeMethod(); // "Charging Tesla Model 3..."
```

> **总结**：构造函数和类中的 this 指向实例对象，箭头函数方法可以避免 this 丢失。

### **2. 回调函数中的 this 处理**

```javascript
class Timer {
  constructor(name) {
    this.name = name;
    this.count = 0;
  }

  // 方法1：使用箭头函数
  startWithArrow() {
    setInterval(() => {
      this.count++;
      console.log(`${this.name}: ${this.count}`);
    }, 1000);
  }

  // 方法2：使用 bind
  startWithBind() {
    setInterval(
      function () {
        this.count++;
        console.log(`${this.name}: ${this.count}`);
      }.bind(this),
      1000
    );
  }

  // 方法3：保存 this 引用
  startWithVariable() {
    const self = this;
    setInterval(function () {
      self.count++;
      console.log(`${self.name}: ${self.count}`);
    }, 1000);
  }
}

const timer = new Timer('MyTimer');
timer.startWithArrow(); // 推荐方式
```

> **总结**：回调函数中使用箭头函数、bind 或保存 this 引用来维持正确的 this 指向。

### **3. 链式调用中的 this**

```javascript
class Calculator {
  constructor() {
    this.value = 0;
  }

  add(num) {
    this.value += num;
    return this; // 返回 this 支持链式调用
  }

  subtract(num) {
    this.value -= num;
    return this;
  }

  multiply(num) {
    this.value *= num;
    return this;
  }

  divide(num) {
    this.value /= num;
    return this;
  }

  getResult() {
    return this.value;
  }
}

const calc = new Calculator();
const result = calc.add(10).multiply(2).subtract(5).divide(3).getResult();

console.log(result); // 5
```

> **总结**：在方法中返回 this 可以实现链式调用，提高代码的流畅性。

## 常用 this 绑定方法对比

### **call vs apply vs bind**

```javascript
function greet(greeting, punctuation) {
  console.log(`${greeting}, I'm ${this.name}${punctuation}`);
}

const person = { name: 'Alice' };

// call：立即调用，参数逐个传递
greet.call(person, 'Hello', '!'); // "Hello, I'm Alice!"

// apply：立即调用，参数以数组形式传递
greet.apply(person, ['Hi', '.']); // "Hi, I'm Alice."

// bind：返回新函数，参数可以分步传递
const boundGreet = greet.bind(person, 'Hey');
boundGreet('?'); // "Hey, I'm Alice?"

// bind 的部分应用
const sayHello = greet.bind(person);
sayHello('Good morning', '!'); // "Good morning, I'm Alice!"
```

> **总结**：call 和 apply 立即执行，bind 返回新函数；apply 用数组传参，call 和 bind 逐个传参。

## 核心要点总结

### **绑定规则**

- **默认绑定** - 独立调用时指向全局对象或 undefined
- **隐式绑定** - 作为对象方法调用时指向该对象
- **显式绑定** - 使用 call/apply/bind 显式指定
- **new 绑定** - 构造函数调用时指向新实例

### **优先级顺序**

new 绑定 > 显式绑定 > 隐式绑定 > 默认绑定

### **特殊情况**

- **箭头函数** - 继承外层作用域的 this，无法改变
- **隐式丢失** - 方法赋值或传递时丢失绑定
- **事件处理** - 通常指向触发事件的元素

### **最佳实践**

- **明确绑定规则** - 根据调用方式确定 this 指向
- **使用箭头函数** - 在回调函数中保持 this 指向
- **合理使用 bind** - 避免隐式绑定丢失
- **ES6 类优先** - 现代化的面向对象编程方式

### **实际应用**

- **构造函数和类** - 创建对象实例
- **事件处理** - 维持正确的上下文
- **回调函数** - 保持 this 指向
- **链式调用** - 返回 this 支持方法链

理解 this 绑定规则是掌握 JavaScript 面向对象编程的关键，它决定了函数执行时的上下文环境！
