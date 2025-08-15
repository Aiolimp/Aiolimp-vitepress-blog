---
title: TypeScript 基础语法
theme: solarized-dark
---

# TypeScript 基础语法

## 简介

TypeScript 是由 Microsoft 开发的开源编程语言，它是 JavaScript 的超集，为 JavaScript 添加了静态类型检查。TypeScript 代码最终会编译成纯 JavaScript 代码，可以在任何支持 JavaScript 的环境中运行。

## 为什么使用 TypeScript？

### **主要优势**

1. **静态类型检查** - 在编译时发现错误，而不是运行时
2. **更好的 IDE 支持** - 代码补全、重构、导航
3. **增强的代码可读性** - 类型注解使代码更易理解
4. **更好的团队协作** - 明确的接口定义
5. **渐进式采用** - 可以逐步将 JavaScript 项目迁移到 TypeScript

## 基础类型

### 1. **基础数据类型**

```typescript
// 字符串
let name: string = 'TypeScript';
let message: string = `Hello, ${name}!`;

// 数字
let age: number = 25;
let pi: number = 3.14;
let binary: number = 0b1010; // 二进制
let octal: number = 0o744; // 八进制
let hex: number = 0xf00d; // 十六进制

// 布尔值
let isActive: boolean = true;
let isCompleted: boolean = false;

// undefined 和 null
let u: undefined = undefined;
let n: null = null;
```

### 2. **数组类型**

```typescript
// 基本数组类型
let numbers: number[] = [1, 2, 3, 4, 5];
let strings: string[] = ['a', 'b', 'c'];

// 泛型数组
let items: Array<number> = [1, 2, 3];
let names: Array<string> = ['Alice', 'Bob'];

// 只读数组
let readonlyNumbers: readonly number[] = [1, 2, 3];
let readonlyItems: ReadonlyArray<string> = ['x', 'y', 'z'];

// 多维数组
let matrix: number[][] = [
  [1, 2, 3],
  [4, 5, 6],
  [7, 8, 9],
];
```

### 3. **元组类型（Tuple）**

```typescript
// 基本元组
let tuple: [string, number] = ['hello', 42];

// 访问元组元素
let first: string = tuple[0];
let second: number = tuple[1];

// 可选元素
let optionalTuple: [string, number?] = ['hello'];

// 剩余元素
let restTuple: [string, ...number[]] = ['hello', 1, 2, 3, 4];

// 命名元组
let namedTuple: [name: string, age: number] = ['Alice', 30];
```

### 4. **枚举类型（Enum）**

- 枚举用于定义一组命名常量，提高代码可读性和类型安全性，常用于状态管理和选项定义。

```typescript
// 数字枚举
enum Direction {
  Up, // 0
  Down, // 1
  Left, // 2
  Right, // 3
}

// 自定义起始值
enum Status {
  Pending = 1,
  Approved, // 2
  Rejected, // 3
}

// 字符串枚举
enum Color {
  Red = 'red',
  Green = 'green',
  Blue = 'blue',
}

// 常量枚举
const enum Theme {
  Light = 'light',
  Dark = 'dark',
}

// 使用枚举
let userStatus: Status = Status.Pending;
let selectedColor: Color = Color.Red;
```

### 5. **联合类型和字面量类型**

- 联合类型允许值为多种类型中的一种，字面量类型限制值为特定的字面量，增强类型约束。

```typescript
// 联合类型
let id: string | number;
id = 'abc';
id = 123;

// 字面量联合类型
type Size = 'small' | 'medium' | 'large';
let buttonSize: Size = 'medium';

// 布尔字面量
type Consent = true | false;

// 数字字面量
type DiceValue = 1 | 2 | 3 | 4 | 5 | 6;
```

### 6. **Any、Unknown 和 Never 类型**

- any 关闭类型检查（避免使用），unknown 是类型安全的 any，void 表示无返回值，never 表示永不返回。

```typescript
// any - 任意类型（尽量避免使用）
let anything: any = 42;
anything = 'hello';
anything = true;

// unknown - 更安全的 any
let userInput: unknown;
if (typeof userInput === 'string') {
  console.log(userInput.toUpperCase()); // 安全使用
}

// void - 无返回值
function logMessage(message: string): void {
  console.log(message);
}

// never - 永不返回
function throwError(message: string): never {
  throw new Error(message);
}
```

## 接口（Interface）

### 1. **基本接口**

- 接口定义对象的结构和类型，支持可选属性、只读属性，是 TypeScript 类型系统的基础。

```typescript
// 基本接口定义
interface User {
  id: number;
  name: string;
  email: string;
  age?: number; // 可选属性
  readonly createdAt: Date; // 只读属性
}

// 使用接口
let user: User = {
  id: 1,
  name: 'Alice',
  email: 'alice@example.com',
  createdAt: new Date(),
};
```

### 2. **函数接口**

- 函数接口定义函数的类型签名，可以包含调用签名和属性，实现复合类型定义。

```typescript
// 函数类型接口
interface Calculator {
  (a: number, b: number): number;
}

let add: Calculator = (x, y) => x + y;
let multiply: Calculator = (x, y) => x * y;

// 混合类型接口
interface Counter {
  (start: number): string;
  interval: number;
  reset(): void;
}
```

### 3. **接口继承**

- 接口继承允许扩展已有接口，支持多重继承，实现类型的复用和扩展。

```typescript
// 基本继承
interface Animal {
  name: string;
  age: number;
}

interface Dog extends Animal {
  breed: string;
  bark(): void;
}

let myDog: Dog = {
  name: 'Buddy',
  age: 3,
  breed: 'Golden Retriever',
  bark() {
    console.log('Woof!');
  },
};
```

## 类（Class）

### 1. **基本类定义**

- 类提供面向对象编程支持，包含属性、方法、构造函数、getter/setter，是封装和抽象的基础。

```typescript
class Person {
  // 属性
  name: string;
  age: number;

  // 构造函数
  constructor(name: string, age: number) {
    this.name = name;
    this.age = age;
  }

  // 方法
  greet(): string {
    return `Hello, I'm ${this.name}`;
  }

  // Getter 和 Setter
  get info(): string {
    return `${this.name} (${this.age})`;
  }

  set info(value: string) {
    const [name, age] = value.split(' ');
    this.name = name;
    this.age = parseInt(age);
  }
}
```

### 2. **访问修饰符**

- 访问修饰符控制成员的可见性，public（公开）、private（私有）、protected（受保护）、readonly（只读）

```typescript
class BankAccount {
  public accountNumber: string; // 公共属性
  private balance: number; // 私有属性
  protected owner: string; // 受保护属性
  readonly bankName: string; // 只读属性

  constructor(accountNumber: string, owner: string, initialBalance: number) {
    this.accountNumber = accountNumber;
    this.owner = owner;
    this.balance = initialBalance;
    this.bankName = 'MyBank';
  }

  public getBalance(): number {
    return this.balance;
  }

  private validateAmount(amount: number): boolean {
    return amount > 0 && amount <= this.balance;
  }
}
```

### 3. **继承和抽象类**

- 类继承实现代码复用，抽象类定义通用接口但不能实例化，支持多态和方法重写。

```typescript
// 抽象基类
abstract class Shape {
  abstract area(): number;
  abstract perimeter(): number;

  display(): void {
    console.log(`Area: ${this.area()}, Perimeter: ${this.perimeter()}`);
  }
}

// 派生类
class Rectangle extends Shape {
  constructor(private width: number, private height: number) {
    super();
  }

  area(): number {
    return this.width * this.height;
  }

  perimeter(): number {
    return 2 * (this.width + this.height);
  }
}
```

## 函数

### 1. **函数类型定义**

- 函数类型定义包括参数类型和返回值类型，支持可选参数、默认参数、剩余参数等特性。

```typescript
// 基本函数
function add(a: number, b: number): number {
  return a + b;
}

// 箭头函数
const multiply = (a: number, b: number): number => a * b;

// 可选参数
function greet(name: string, greeting?: string): string {
  return `${greeting || 'Hello'}, ${name}!`;
}

// 默认参数
function createUser(name: string, age: number = 18): object {
  return { name, age };
}

// 剩余参数
function sum(...numbers: number[]): number {
  return numbers.reduce((total, num) => total + num, 0);
}
```

### 2. **函数重载**

- 函数重载允许同一函数根据参数类型提供不同的类型签名，提供更精确的类型推断。

```typescript
// 函数重载声明
function combine(a: string, b: string): string;
function combine(a: number, b: number): number;

// 函数实现
function combine(a: any, b: any): any {
  if (typeof a === 'string' && typeof b === 'string') {
    return a + b;
  }
  if (typeof a === 'number' && typeof b === 'number') {
    return a + b;
  }
}

// 使用
let result1 = combine('Hello', ' World'); // string
let result2 = combine(1, 2); // number
```

## 泛型（Generics）

### 1. **基本泛型**

- 泛型提供类型参数化，使代码可复用且保持类型安全，支持函数、类、接口的泛型定义。

```typescript
// 泛型函数
function identity<T>(arg: T): T {
  return arg;
}

let result1 = identity<string>('hello'); // 明确指定类型
let result2 = identity('hello'); // 类型推断

// 泛型数组
function getArrayLength<T>(arr: T[]): number {
  return arr.length;
}

// 多个泛型参数
function pair<T, U>(first: T, second: U): [T, U] {
  return [first, second];
}
```

### 2. **泛型约束**

- 泛型约束限制类型参数的范围，extends 关键字确保类型满足特定条件，keyof 操作符获取对象键类型。

```typescript
// 基本约束
interface Lengthwise {
  length: number;
}

function logLength<T extends Lengthwise>(arg: T): T {
  console.log(arg.length);
  return arg;
}

// keyof 约束
function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}

let person = { name: 'Alice', age: 30 };
let name = getProperty(person, 'name'); // string
let age = getProperty(person, 'age'); // number
```

### 3. **泛型接口和类**

- 泛型接口和类实现通用的数据结构和算法，提供类型安全的容器和操作方法。

```typescript
// 泛型接口
interface Repository<T> {
  create(item: T): T;
  findById(id: string): T | null;
  update(id: string, item: Partial<T>): T;
  delete(id: string): boolean;
}

// 泛型类
class GenericArray<T> {
  private items: T[] = [];

  add(item: T): void {
    this.items.push(item);
  }

  get(index: number): T | undefined {
    return this.items[index];
  }

  getAll(): T[] {
    return [...this.items];
  }
}
```

## 类型别名和实用类型

### 1. **类型别名**

- 类型别名为复杂类型提供简洁名称，提高代码可读性和维护性，支持泛型和嵌套定义。

```typescript
// 基本类型别名
type StringOrNumber = string | number;
type EventHandler = (event: Event) => void;

// 对象类型别名
type Point = {
  x: number;
  y: number;
};

type User = {
  id: number;
  name: string;
  email: string;
  profile?: {
    bio: string;
    avatar: string;
  };
};
```

### 2. **内置实用类型**

- 内置实用类型提供常用的类型转换操作，如 Partial、Required、Pick、Omit、Record 等，简化类型操作。

```typescript
interface User {
  id: number;
  name: string;
  email: string;
  password: string;
}

// Partial - 所有属性可选
type PartialUser = Partial<User>;

// Required - 所有属性必需
type RequiredUser = Required<User>;

// Readonly - 所有属性只读
type ReadonlyUser = Readonly<User>;

// Pick - 选择特定属性
type UserProfile = Pick<User, 'id' | 'name' | 'email'>;

// Omit - 排除特定属性
type UserWithoutPassword = Omit<User, 'password'>;

// Record - 创建映射类型
type UserRoles = Record<string, string>;
```

## 类型守卫和断言

### 1. **类型守卫**

- 类型守卫在运行时检查类型，帮助 TypeScript 缩小类型范围，包括 typeof、instanceof 和自定义守卫。

```typescript
// typeof 类型守卫
function processValue(value: string | number) {
  if (typeof value === 'string') {
    return value.toUpperCase(); // TypeScript 知道这里 value 是 string
  }
  return value.toFixed(2); // TypeScript 知道这里 value 是 number
}

// instanceof 类型守卫
class Cat {
  meow() {
    console.log('Meow!');
  }
}

class Dog {
  bark() {
    console.log('Woof!');
  }
}

function makeSound(animal: Cat | Dog) {
  if (animal instanceof Cat) {
    animal.meow();
  } else {
    animal.bark();
  }
}

// 自定义类型守卫
function isString(value: unknown): value is string {
  return typeof value === 'string';
}

function processUnknown(value: unknown) {
  if (isString(value)) {
    console.log(value.toUpperCase()); // 安全使用
  }
}
```

### 2. **类型断言**

- 类型断言告诉编译器变量的具体类型，包括 as 语法、非空断言(!)和 const 断言，需谨慎使用。

```typescript
// as 语法（推荐）
let someValue: unknown = 'this is a string';
let strLength: number = (someValue as string).length;

// 非空断言操作符
function processUser(user: User | null) {
  // 我们确定 user 不为 null
  console.log(user!.name);
}

// const 断言
const colors = ['red', 'green', 'blue'] as const;
type Color = (typeof colors)[number]; // 'red' | 'green' | 'blue'
```

## 模块

### 1. **ES6 模块**

- ES6 模块系统提供代码组织和复用机制，支持命名导出、默认导出和命名空间导入。

```typescript
// math.ts - 导出
export function add(a: number, b: number): number {
  return a + b;
}

export function subtract(a: number, b: number): number {
  return a - b;
}

export default function multiply(a: number, b: number): number {
  return a * b;
}

// main.ts - 导入
import multiply, { add, subtract } from './math';
import * as MathUtils from './math';
```

### 2. **声明文件**

- 声明文件(.d.ts)为 JavaScript 库提供类型信息，支持模块声明和全局类型扩展。

```typescript
// types.d.ts
declare module 'my-library' {
  export function doSomething(): void;
  export const version: string;
}

// 全局声明
declare global {
  interface Window {
    myApp: {
      version: string;
      init(): void;
    };
  }
}
```

## 配置和工具

### 1. **tsconfig.json 基本配置**

- tsconfig.json 配置 TypeScript 编译选项，包括目标版本、模块系统、输出目录等核心设置。

```json
{
  "compilerOptions": {
    "target": "ES2020", // 编译目标
    "module": "ESNext", // 模块系统
    "lib": ["ES2020", "DOM"], // 包含的库
    "outDir": "./dist", // 输出目录
    "rootDir": "./src", // 根目录
    "strict": true, // 启用严格模式
    "esModuleInterop": true, // ES模块互操作
    "skipLibCheck": true, // 跳过库检查
    "forceConsistentCasingInFileNames": true, // 强制文件名大小写一致
    "declaration": true, // 生成声明文件
    "sourceMap": true // 生成源映射
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

### 2. **常用编译选项**

- 编译选项控制类型检查严格程度和模块解析策略，strict 模式提供最佳的类型安全保障。

```json
{
  "compilerOptions": {
    // 严格检查
    "noImplicitAny": true, // 禁止隐式 any
    "strictNullChecks": true, // 严格空值检查
    "strictFunctionTypes": true, // 严格函数类型检查
    "noImplicitReturns": true, // 禁止隐式返回
    "noUnusedLocals": true, // 检查未使用的局部变量
    "noUnusedParameters": true, // 检查未使用的参数

    // 模块解析
    "moduleResolution": "node", // 模块解析策略
    "baseUrl": "./", // 基础URL
    "paths": {
      // 路径映射
      "@/*": ["src/*"],
      "@components/*": ["src/components/*"]
    }
  }
}
```

## 最佳实践

### 1. **命名约定**

- 遵循一致的命名约定提高代码可读性，PascalCase 用于类型，camelCase 用于变量和函数。

```typescript
// 接口和类型使用 PascalCase
interface UserProfile {}
type ApiResponse<T> = {};

// 枚举使用 PascalCase
enum UserStatus {
  Active = 'active',
  Inactive = 'inactive',
}

// 变量和函数使用 camelCase
const userName = 'Alice';
function getUserById(id: number) {}

// 常量使用 UPPER_SNAKE_CASE
const MAX_RETRY_ATTEMPTS = 3;
const API_BASE_URL = 'https://api.example.com';
```

### 2. **类型设计原则**

- 优先使用 interface 定义对象类型，合理使用 readonly 和 const assertions 保护数据不可变性。

```typescript
// 优先使用接口而不是类型别名（对象形状）
interface User {
  // ✅ 推荐
  id: number;
  name: string;
}

// 使用类型别名用于联合类型
type Status = 'loading' | 'success' | 'error'; // ✅ 推荐

// 使用 readonly 保护数据
interface ReadonlyConfig {
  readonly apiUrl: string;
  readonly timeout: number;
}

// 使用 const assertions 创建不可变数据
const themes = ['light', 'dark'] as const;
```

### 3. **错误处理**

- 使用 Result 模式进行类型安全的错误处理，明确区分成功和失败状态，避免运行时异常。

```typescript
// 使用 Result 模式处理错误
type Result<T, E = Error> =
  | {
      success: true;
      data: T;
    }
  | {
      success: false;
      error: E;
    };

async function fetchUser(id: number): Promise<Result<User>> {
  try {
    const user = await api.getUser(id);
    return { success: true, data: user };
  } catch (error) {
    return { success: false, error: error as Error };
  }
}

// 使用方式
const result = await fetchUser(1);
if (result.success) {
  console.log(result.data.name); // 类型安全
} else {
  console.error(result.error.message);
}
```
