---
title: JavaScript 原型与原型链
theme: solarized-dark
---

# JavaScript 原型与原型链

## 简介

原型与原型链是 JavaScript 面向对象编程的核心概念，它们实现了对象之间的继承关系。理解这个概念对于掌握 JavaScript 面向对象编程至关重要。

## 什么是原型

### **基本概念**

在 JavaScript 中，每个对象都有一个内部链接指向另一个对象，这个对象就叫做它的**原型（prototype）**。原型本身也是一个对象，也可能有自己的原型。

```javascript
// 构造函数
function Person(name) {
  this.name = name;
}

// 在原型上添加方法
Person.prototype.sayHello = function () {
  console.log(`Hello, I'm ${this.name}`);
};

// 创建实例
const alice = new Person('Alice');
const bob = new Person('Bob');

// 实例可以访问原型上的方法
alice.sayHello(); // "Hello, I'm Alice"
bob.sayHello(); // "Hello, I'm Bob"
```

> **总结**：原型是一个对象，为其他对象提供共享的属性和方法。

### prototype 与 proto

```javascript
function Animal(name) {
  this.name = name;
}

Animal.prototype.eat = function () {
  console.log(`${this.name} is eating`);
};

const cat = new Animal('Cat');

// prototype: 构造函数的原型对象
console.log(Animal.prototype); // { eat: function, constructor: Animal }

// __proto__: 实例对象的原型链接（非标准，但广泛支持）
console.log(cat.__proto__ === Animal.prototype); // true

// 标准方法获取原型
console.log(Object.getPrototypeOf(cat) === Animal.prototype); // true
```

> **总结**：prototype 是构造函数的属性，**proto** 是实例对象的内部链接，指向构造函数的 prototype。

## 什么是原型链

### **基本概念**

原型链是由原型对象连接起来的链式结构。当访问对象的属性或方法时，JavaScript 会沿着原型链向上查找，直到找到该属性或到达链的顶端。

```javascript
function Animal(name) {
  this.name = name;
}

Animal.prototype.breathe = function () {
  console.log(`${this.name} is breathing`);
};

function Dog(name, breed) {
  Animal.call(this, name); // 继承属性
  this.breed = breed;
}

// 设置原型链：Dog.prototype -> Animal.prototype -> Object.prototype -> null
Dog.prototype = Object.create(Animal.prototype);
Dog.prototype.constructor = Dog;

Dog.prototype.bark = function () {
  console.log(`${this.name} is barking`);
};

const myDog = new Dog('Buddy', 'Golden Retriever');

// 原型链查找过程
myDog.bark(); // 在 Dog.prototype 中找到
myDog.breathe(); // 在 Animal.prototype 中找到
myDog.toString(); // 在 Object.prototype 中找到

console.log(myDog.name); // 在实例自身找到
console.log(myDog.breed); // 在实例自身找到
```

> **总结**：原型链是对象原型的链式连接，实现了属性和方法的继承查找机制。

### **原型链查找过程**

```javascript
const obj = {
  name: 'example',
};

// 查找过程演示
console.log(obj.name); // 1. 在 obj 自身找到
console.log(obj.toString); // 2. 在 obj 自身没找到，去 Object.prototype 找到
console.log(obj.nonExistent); // 3. 自身和原型链都没找到，返回 undefined

// 原型链结构
console.log(obj.__proto__ === Object.prototype); // true
console.log(Object.prototype.__proto__ === null); // true (链的顶端)
```

> **总结**：属性查找遵循"就近原则"，从实例自身开始，沿原型链向上查找，直到找到或到达 null。

## 实际应用示例

### **1. 基本继承**

```javascript
// 父类
function Vehicle(type) {
  this.type = type;
}

Vehicle.prototype.start = function () {
  console.log(`${this.type} is starting...`);
};

// 子类
function Car(brand, model) {
  Vehicle.call(this, 'Car'); // 继承属性
  this.brand = brand;
  this.model = model;
}

// 建立原型链
Car.prototype = Object.create(Vehicle.prototype);
Car.prototype.constructor = Car;

// 添加子类特有方法
Car.prototype.drive = function () {
  console.log(`Driving ${this.brand} ${this.model}`);
};

const myCar = new Car('Toyota', 'Camry');
myCar.start(); // "Car is starting..."
myCar.drive(); // "Driving Toyota Camry"
```

> **总结**：通过原型链实现类与类之间的继承关系。

### **2. 方法重写**

```javascript
function Animal(name) {
  this.name = name;
}

Animal.prototype.makeSound = function () {
  console.log('Some generic animal sound');
};

function Cat(name) {
  Animal.call(this, name);
}

Cat.prototype = Object.create(Animal.prototype);
Cat.prototype.constructor = Cat;

// 重写父类方法
Cat.prototype.makeSound = function () {
  console.log(`${this.name} says meow`);
};

const cat = new Cat('Whiskers');
cat.makeSound(); // "Whiskers says meow" (调用重写后的方法)
```

> **总结**：子类可以重写父类的方法，实现多态性。

### **3. 共享属性的注意事项**

```javascript
function User(name) {
  this.name = name;
}

// ❌ 错误做法：引用类型放在原型上
User.prototype.hobbies = [];

const user1 = new User('Alice');
const user2 = new User('Bob');

user1.hobbies.push('reading');
console.log(user2.hobbies); // ['reading'] - 被意外修改了！

// ✅ 正确做法：引用类型放在构造函数中
function UserCorrect(name) {
  this.name = name;
  this.hobbies = []; // 每个实例都有独立的数组
}

UserCorrect.prototype.addHobby = function (hobby) {
  this.hobbies.push(hobby);
};
```

> **总结**：基本类型可以放在原型上共享，引用类型应该放在构造函数中避免意外共享。

## ES6 类语法

### **现代语法实现**

```javascript
// ES6 类语法（本质还是原型链）
class Animal {
  constructor(name) {
    this.name = name;
  }

  breathe() {
    console.log(`${this.name} is breathing`);
  }
}

class Dog extends Animal {
  constructor(name, breed) {
    super(name); // 调用父类构造函数
    this.breed = breed;
  }

  bark() {
    console.log(`${this.name} is barking`);
  }
}

const dog = new Dog('Buddy', 'Labrador');
dog.breathe(); // 继承自 Animal
dog.bark(); // Dog 自己的方法

// 验证原型链结构
console.log(dog.__proto__ === Dog.prototype); // true
console.log(Dog.prototype.__proto__ === Animal.prototype); // true
console.log(Animal.prototype.__proto__ === Object.prototype); // true
```

> **总结**：ES6 类语法是原型链的语法糖，底层机制仍然是原型继承。

## 常用方法

### **检测和操作原型**

- 检测原型关系 - `instanceof`、`isPrototypeOf`

- 获取原型 - `Object.getPrototypeOf`

- 属性检测 - `hasOwnProperty`、`getOwnPropertyNames`

```javascript
function Person(name) {
  this.name = name;
}

Person.prototype.greet = function () {
  console.log(`Hello, I'm ${this.name}`);
};

const person = new Person('Alice');

// 1. 检测原型关系
console.log(person instanceof Person); // true
console.log(Person.prototype.isPrototypeOf(person)); // true

// 2. 获取原型
console.log(Object.getPrototypeOf(person) === Person.prototype); // true

// 3. 检测属性来源
console.log(person.hasOwnProperty('name')); // true (自身属性)
console.log(person.hasOwnProperty('greet')); // false (原型属性)

// 4. 获取所有属性
console.log(Object.getOwnPropertyNames(person)); // ['name']
console.log(Object.getOwnPropertyNames(Person.prototype)); // ['constructor', 'greet']

// 5. 设置原型（不推荐，性能差）
const newProto = { newMethod: function () {} };
Object.setPrototypeOf(person, newProto);
```

> **总结**：JavaScript 提供了丰富的 API 来检测和操作原型关系。

## 核心要点总结

### **原型（Prototype）**

- 每个函数都有 `prototype` 属性，指向一个对象
- 每个对象都有内部链接指向其原型（通过 `__proto__` 或 `Object.getPrototypeOf()` 访问）
- 原型用于存储共享的属性和方法

### **原型链（Prototype Chain）**

- 对象原型的链式连接结构
- 属性查找机制：自身 → 原型 → 原型的原型 → ... → `Object.prototype` → `null`
- 实现了 JavaScript 的继承机制

### **继承实现**

- **传统方式**：`Object.create()` + `constructor` 修正
- **ES6 方式**：`class` + `extends` + `super`
- **本质相同**：都是基于原型链的继承

### **最佳实践**

- 共享方法放在 `prototype` 上
- 实例特有属性放在构造函数中
- 使用 ES6 类语法提高代码可读性
- 避免直接修改内置对象的原型

理解原型与原型链是掌握 JavaScript 面向对象编程的关键，它解释了为什么我们可以在对象上调用看似不存在的方法，以及 JavaScript 如何实现继承！
