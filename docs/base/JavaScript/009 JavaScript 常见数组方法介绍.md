---
title: 009 JavaScript 常见数组方法介绍
theme: solarized-dark
---

# JavaScript 常见数组方法介绍

## 简介

JavaScript 数组是最常用的数据结构之一，提供了丰富的内置方法来操作和处理数据。掌握这些方法是高效 JavaScript 编程的基础。本文将详细介绍最常用的数组方法，包括使用场景、语法和实例。

## 数组方法分类

### **按功能分类**

- **变异方法**：会修改原数组
- **非变异方法**：不修改原数组，返回新数组或值
- **遍历方法**：用于遍历数组元素
- **查找方法**：用于查找特定元素
- **转换方法**：用于数组转换

## 遍历方法

### 1. **forEach() - 遍历执行**

```javascript
// 基本用法
const numbers = [1, 2, 3, 4, 5];

numbers.forEach((item, index, array) => {
  console.log(`索引 ${index}: ${item}`);
});
// 输出: 索引 0: 1, 索引 1: 2, ...

// 实际应用 - 渲染列表
const users = [
  { name: 'Alice', age: 25 },
  { name: 'Bob', age: 30 },
];

users.forEach((user) => {
  console.log(`${user.name} is ${user.age} years old`);
});
```

> **总结**：对数组每个元素执行回调函数，无返回值，适用于副作用操作如日志输出、DOM 操作等。

### 2. **map() - 映射转换**

```javascript
// 基本转换
const numbers = [1, 2, 3, 4, 5];
const doubled = numbers.map((num) => num * 2);
console.log(doubled); // [2, 4, 6, 8, 10]

// 对象属性提取
const users = [
  { name: 'Alice', age: 25 },
  { name: 'Bob', age: 30 },
  { name: 'Charlie', age: 35 },
];

const names = users.map((user) => user.name);
console.log(names); // ['Alice', 'Bob', 'Charlie']

// 复杂转换
const products = [
  { name: 'iPhone', price: 999 },
  { name: 'iPad', price: 799 },
];

const formatted = products.map((product) => ({
  ...product,
  formattedPrice: `$${product.price}`,
  category: 'Electronics',
}));
```

> **总结**：对数组每个元素执行回调函数并返回新数组，是数据转换的核心方法，保持原数组不变。

### 3. **filter() - 条件过滤**

```javascript
// 基本过滤
const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
const evenNumbers = numbers.filter((num) => num % 2 === 0);
console.log(evenNumbers); // [2, 4, 6, 8, 10]

// 对象数组过滤
const users = [
  { name: 'Alice', age: 25, active: true },
  { name: 'Bob', age: 17, active: false },
  { name: 'Charlie', age: 35, active: true },
];

// 过滤成年活跃用户
const activeAdults = users.filter((user) => user.age >= 18 && user.active);
console.log(activeAdults); // [{ name: 'Alice', age: 25, active: true }, { name: 'Charlie', age: 35, active: true }]

// 字符串过滤
const words = ['apple', 'banana', 'cherry', 'date'];
const longWords = words.filter((word) => word.length > 5);
console.log(longWords); // ['banana', 'cherry']
```

> **总结**：根据条件过滤数组元素，返回符合条件的新数组，是数据筛选的核心方法。

### 4. **reduce() - 累积计算**

```javascript
// 基本累加
const numbers = [1, 2, 3, 4, 5];
const sum = numbers.reduce((acc, curr) => acc + curr, 0);
console.log(sum); // 15

// 找最大值
const max = numbers.reduce((acc, curr) => Math.max(acc, curr));
console.log(max); // 5

// 统计计数
const fruits = ['apple', 'banana', 'apple', 'cherry', 'banana', 'apple'];
const count = fruits.reduce((acc, fruit) => {
  acc[fruit] = (acc[fruit] || 0) + 1;
  return acc;
}, {});
console.log(count); // { apple: 3, banana: 2, cherry: 1 }

// 数组扁平化
const nested = [
  [1, 2],
  [3, 4],
  [5, 6],
];
const flattened = nested.reduce((acc, curr) => acc.concat(curr), []);
console.log(flattened); // [1, 2, 3, 4, 5, 6]

// 对象数组转换
const users = [
  { id: 1, name: 'Alice' },
  { id: 2, name: 'Bob' },
];

const userMap = users.reduce((acc, user) => {
  acc[user.id] = user.name;
  return acc;
}, {});
console.log(userMap); // { 1: 'Alice', 2: 'Bob' }
```

> **总结**：对数组元素进行累积计算，返回单个值，是最强大的数组方法，可实现求和、统计、转换等复杂操作。

## 查找方法

### 1. **find() - 查找元素**

```javascript
const users = [
  { id: 1, name: 'Alice', role: 'admin' },
  { id: 2, name: 'Bob', role: 'user' },
  { id: 3, name: 'Charlie', role: 'admin' },
];

// 查找第一个管理员
const admin = users.find((user) => user.role === 'admin');
console.log(admin); // { id: 1, name: 'Alice', role: 'admin' }

// 查找特定 ID
const userById = users.find((user) => user.id === 2);
console.log(userById); // { id: 2, name: 'Bob', role: 'user' }

// 查找不存在的元素
const notFound = users.find((user) => user.role === 'guest');
console.log(notFound); // undefined
```

> **总结**：查找第一个符合条件的元素并返回，找不到返回 undefined，适用于查找唯一或第一个匹配项。

### 2. **findIndex() - 查找索引**

```javascript
const numbers = [10, 20, 30, 40, 50];

const index = numbers.findIndex((num) => num > 25);
console.log(index); // 2 (元素 30 的索引)

const users = [
  { name: 'Alice', active: false },
  { name: 'Bob', active: true },
  { name: 'Charlie', active: false },
];

const activeUserIndex = users.findIndex((user) => user.active);
console.log(activeUserIndex); // 1
```

> **总结**：查找第一个符合条件的元素索引，找不到返回 -1，适用于需要知道元素位置的场景。

### 3. **includes() - 判断是否包含**

```javascript
const numbers = [1, 2, 3, 4, 5];

console.log(numbers.includes(3)); // true
console.log(numbers.includes(6)); // false
console.log(numbers.includes(3, 3)); // false (从索引 3 开始查找)

// 字符串数组
const fruits = ['apple', 'banana', 'cherry'];
console.log(fruits.includes('banana')); // true
```

> **总结**：判断数组是否包含某个元素，返回 boolean 值，是最直观的包含性检查方法。

## 条件判断方法

### 1. **some() - 某些满足**

```javascript
const numbers = [1, 2, 3, 4, 5];

// 是否有偶数
const hasEven = numbers.some((num) => num % 2 === 0);
console.log(hasEven); // true

// 是否有大于 10 的数
const hasLarge = numbers.some((num) => num > 10);
console.log(hasLarge); // false

// 对象数组检查
const users = [
  { name: 'Alice', age: 17 },
  { name: 'Bob', age: 25 },
  { name: 'Charlie', age: 16 },
];

const hasAdult = users.some((user) => user.age >= 18);
console.log(hasAdult); // true
```

> **总结**：检查是否至少有一个元素满足条件，只要有一个满足就返回 true，适用于存在性验证。

### 2. **every() - 全部满足**

```javascript
const numbers = [2, 4, 6, 8, 10];

// 是否全部都是偶数
const allEven = numbers.every((num) => num % 2 === 0);
console.log(allEven); // true

// 是否全部都大于 0
const allPositive = numbers.every((num) => num > 0);
console.log(allPositive); // true

// 是否全部都大于 5
const allLarge = numbers.every((num) => num > 5);
console.log(allLarge); // false

// 表单验证示例
const formFields = [
  { name: 'email', value: 'test@example.com', valid: true },
  { name: 'password', value: '123456', valid: true },
  { name: 'confirm', value: '123456', valid: true },
];

const isFormValid = formFields.every((field) => field.valid);
console.log(isFormValid); // true
```

> **总结**：检查是否所有元素都满足条件，全部满足才返回 true，适用于完整性验证。

## 修改数组方法

### 1. **push() / pop() - 末尾操作**

```javascript
const fruits = ['apple', 'banana'];

// 添加元素
fruits.push('cherry');
console.log(fruits); // ['apple', 'banana', 'cherry']

// 添加多个元素
fruits.push('date', 'elderberry');
console.log(fruits); // ['apple', 'banana', 'cherry', 'date', 'elderberry']

// 移除末尾元素
const lastFruit = fruits.pop();
console.log(lastFruit); // 'elderberry'
console.log(fruits); // ['apple', 'banana', 'cherry', 'date']

// 栈操作示例
const stack = [];
stack.push(1);
stack.push(2);
stack.push(3);
console.log(stack.pop()); // 3 (后进先出)
```

> **总结**：push 在末尾添加元素，pop 移除末尾元素，是栈操作的基础，会修改原数组。

### 2. **unshift() / shift() - 开头操作**

```javascript
const numbers = [2, 3, 4];

// 在开头添加元素
numbers.unshift(1);
console.log(numbers); // [1, 2, 3, 4]

// 添加多个元素
numbers.unshift(-1, 0);
console.log(numbers); // [-1, 0, 1, 2, 3, 4]

// 移除开头元素
const firstNumber = numbers.shift();
console.log(firstNumber); // -1
console.log(numbers); // [0, 1, 2, 3, 4]

// 队列操作示例
const queue = [];
queue.push('first');
queue.push('second');
queue.push('third');
console.log(queue.shift()); // 'first' (先进先出)
```

> **总结**：unshift 在开头添加元素，shift 移除开头元素，是队列操作的基础，会修改原数组。

### 3. **splice() - 万能修改**

```javascript
const fruits = ['apple', 'banana', 'cherry', 'date', 'elderberry'];

// 删除元素 splice(start, deleteCount)
const deleted = fruits.splice(1, 2); // 从索引 1 开始删除 2 个元素
console.log(deleted); // ['banana', 'cherry']
console.log(fruits); // ['apple', 'date', 'elderberry']

// 插入元素 splice(start, 0, ...items)
fruits.splice(1, 0, 'blueberry', 'coconut');
console.log(fruits); // ['apple', 'blueberry', 'coconut', 'date', 'elderberry']

// 替换元素 splice(start, deleteCount, ...items)
fruits.splice(2, 1, 'cherry'); // 删除 1 个元素并插入新元素
console.log(fruits); // ['apple', 'blueberry', 'cherry', 'date', 'elderberry']
```

> **总结**：splice 是最强大的数组修改方法，可以删除、插入、替换元素，会修改原数组并返回删除的元素。

## 非变异方法

### 1. **slice() - 提取片段**

```javascript
const fruits = ['apple', 'banana', 'cherry', 'date', 'elderberry'];

// 提取从索引 1 到 3（不包含 3）
const sliced = fruits.slice(1, 3);
console.log(sliced); // ['banana', 'cherry']
console.log(fruits); // 原数组不变

// 从索引 2 到末尾
const fromIndex = fruits.slice(2);
console.log(fromIndex); // ['cherry', 'date', 'elderberry']

// 负数索引（从末尾开始）
const lastTwo = fruits.slice(-2);
console.log(lastTwo); // ['date', 'elderberry']

// 复制整个数组
const copy = fruits.slice();
console.log(copy); // ['apple', 'banana', 'cherry', 'date', 'elderberry']
```

> **总结**：slice 提取数组的一部分返回新数组，不修改原数组，常用于数组切片和复制。

### 2. **join() - 转换为字符串**

```javascript
const fruits = ['apple', 'banana', 'cherry'];

// 默认用逗号连接
const defaultJoin = fruits.join();
console.log(defaultJoin); // "apple,banana,cherry"

// 自定义分隔符
const customJoin = fruits.join(' - ');
console.log(customJoin); // "apple - banana - cherry"

// 空字符串连接
const noSeparator = fruits.join('');
console.log(noSeparator); // "applebananacherry"

// 实际应用 - URL 路径
const pathSegments = ['api', 'users', '123', 'profile'];
const url = '/' + pathSegments.join('/');
console.log(url); // "/api/users/123/profile"
```

> **总结**：join 将数组元素连接成字符串，可自定义分隔符，不修改原数组。

## 实用技巧

### 1. **链式调用**

```javascript
const users = [
  { name: 'Alice', age: 25, department: 'IT' },
  { name: 'Bob', age: 30, department: 'HR' },
  { name: 'Charlie', age: 35, department: 'IT' },
  { name: 'David', age: 28, department: 'Finance' },
  { name: 'Eve', age: 32, department: 'IT' },
];

// 链式调用：过滤 IT 部门，按年龄排序，提取姓名
const itNames = users
  .filter((user) => user.department === 'IT')
  .sort((a, b) => a.age - b.age)
  .map((user) => user.name);

console.log(itNames); // ['Alice', 'Charlie', 'Eve']
```

> **总结**：链式调用多个数组方法可以优雅地处理复杂的数据转换流程。

### 2. **数组去重**

```javascript
// 基本类型去重
const numbers = [1, 2, 2, 3, 3, 3, 4, 5, 5];

// 方法 1: Set
const unique1 = [...new Set(numbers)];
console.log(unique1); // [1, 2, 3, 4, 5]

// 方法 2: filter + indexOf
const unique2 = numbers.filter((item, index) => numbers.indexOf(item) === index);
console.log(unique2); // [1, 2, 3, 4, 5]

// 对象数组去重
const users = [
  { id: 1, name: 'Alice' },
  { id: 2, name: 'Bob' },
  { id: 1, name: 'Alice' },
  { id: 3, name: 'Charlie' },
];

// 根据 id 去重
const uniqueUsers = users.filter((user, index, arr) => arr.findIndex((u) => u.id === user.id) === index);
console.log(uniqueUsers);
```

> **总结**：数组去重有多种方法，Set 是最简洁的，filter + indexOf 更通用。

## 性能优化建议

### 1. **选择合适的方法**

```javascript
// ❌ 低效：使用 filter 查找唯一元素
const users = [
  /* 大量数据 */
];
const adminUser = users.filter((user) => user.role === 'admin')[0];

// ✅ 高效：使用 find 查找唯一元素
const adminUser2 = users.find((user) => user.role === 'admin');

// ❌ 低效：多次遍历
const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
const evenNumbers = numbers.filter((n) => n % 2 === 0);
const doubledEven = evenNumbers.map((n) => n * 2);

// ✅ 高效：链式调用，减少遍历次数
const result = numbers.filter((n) => n % 2 === 0).map((n) => n * 2);
```

> **总结**：根据需求选择合适的方法，避免不必要的遍历，充分利用链式调用。

## 总结

JavaScript 数组方法是前端开发的基础工具，掌握它们能够：

### **核心价值**

- **提高开发效率** - 减少手动循环代码
- **增强代码可读性** - 方法名称直观表达意图
- **函数式编程** - 支持链式调用和组合操作
- **性能优化** - 内置方法通常比手写循环更高效

### **常用模式**

- **数据转换**：`map()` + `filter()` + `reduce()`
- **数据查找**：`find()` + `findIndex()` + `includes()`
- **数据验证**：`some()` + `every()`
- **数据操作**：`push()` + `pop()` + `splice()`

### **使用建议**

1. **根据需求选择合适的方法** - 查找用 find，转换用 map，过滤用 filter
2. **充分利用链式调用** - 减少中间变量，提高代码简洁性
3. **注意方法的返回值** - 区分变异方法和非变异方法
4. **考虑性能影响** - 大数据量时选择合适的算法和方法
