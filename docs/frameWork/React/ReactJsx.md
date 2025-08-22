---
title: React JSX用法
theme: solarized-dark
---

## 一、组件

### **1.什么是 React 组件？**

**React 组件**就是可以重复使用的小模块，用来组成页面的。

每个组件本质上就是一个 **函数**，返回一段 **JSX** 结构。

简单理解：

👉 **组件 = 函数 + 返回界面内容**

### 2.**React 组件的分类**

| **类型**                      | **解释**                                      | **示例**                                     |
| ----------------------------- | --------------------------------------------- | -------------------------------------------- |
| 函数组件 (Function Component) | 用函数来定义组件，简单、推荐使用。            | const MyComponent = () => {}                 |
| 类组件 (Class Component)      | 用 class 来定义，老版用得多。现在一般少用了。 | class MyComponent extends React.Component {} |

**注意**：现在开发推荐只用**函数组件**，配合 Hook，比如 useState、useEffect。

### 3.小结一下

✅ 组件名首字母必须大写。

✅ 组件返回的内容只能有一个最外层标签（比如 `<div>`）。

✅ 一个组件可以在另一个组件里被引入和复用。

✅ 现在推荐用**函数组件 + Hook**开发。

## 二、JSX 基本使用

React 的 JSX 是一种 JavaScript 语法扩展，它允许你在 JavaScript 代码中写 HTML 样式的标记。JSX 的最终目的是生成 React 元素，React 会根据这些元素构建 UI。

以下是 JSX 语法的一些关键点：

### **1.** **基础结构**

JSX 语法看起来像 HTML，但它是 JavaScript 的一部分。每个 JSX 标签都会转换成 React 元素。例如：

```jsx
const element = <h1>Hello, world!</h1>;
```

### **2.** **表达式插值**

你可以在 JSX 中嵌入 JavaScript 表达式，表达式需要用大括号 {} 包围。

```jsx
const name = 'React';
const element = <h1>Hello, {name}!</h1>;
```

### **3.** **属性**

JSX 属性使用小驼峰命名法，而不是 HTML 中的连字符。例如，class 在 JSX 中变成 className，for 变成 htmlFor。

```jsx
const element = <div className="container">Content</div>;
```

### **4.** **条件渲染**

可以在 JSX 中使用 JavaScript 的条件语句来渲染不同的内容：

```jsx
// 使用三元运算符
const isLoggedIn = true;
const element = <h1>{isLoggedIn ? 'Welcome back!' : 'Please sign up.'}</h1>;

// 使用短路运算符
const element = <h1>{isLoggedIn && 'Welcome back!'}</h1>;
```

### **5.** **事件处理**

React 事件处理使用小驼峰命名法，并且事件处理函数需要作为属性传递。

```jsx
function handleClick() {
  alert('Button clicked!');
}

const element = <button onClick={handleClick}>Click me</button>;
```

### **6.** **嵌套组件**

JSX 可以嵌套组件，也就是可以在一个组件中使用其他组件。

```jsx
function MyComponent() {
  return <h1>Hello from MyComponent</h1>;
}

const element = <MyComponent />;
```

### **7.** **多行 JSX**

JSX 如果跨越多行，需要用括号包裹起来，以确保返回的是一个单一的表达式。

```jsx
const element = (
  <div>
    <h1>Hello, world!</h1>
    <p>This is a JSX example.</p>
  </div>
);
```

### **8.** **JSX 不等于 HTML**

JSX 看起来像 HTML，但它更接近于 JavaScript。比如，在 JSX 中需要使用 className 而不是 class，并且所有标签必须闭合。

```jsx
// JSX 是这样的：
const element = <img src="logo.png" alt="Logo" />;
```

### **9.** **返回多个元素**

React 组件需要返回一个单一的元素。如果你想返回多个元素，必须用一个包裹元素，或者使用 React.Fragment。

```jsx
const element = (
  <>
    <h1>Title</h1>
    <p>Description</p>
  </>
);
```

### 10. 组件使用

可以在 JSX 中使用自定义组件，且组件名称必须以大写字母开头。

```jsx
function Welcome(props) {
  return <h1>Hello, {props.name}!</h1>;
}

const element = <Welcome name="Sara" />;
```

这些是 JSX 语法的一些基本概念。使用 JSX 编写的代码最后会通过 Babel 等工具转换成 React.createElement 调用，从而生成最终的 UI。

## 三、JSX 规则

在 React 中使用 JSX 时，有一些特定的规则和约定需要遵守。以下是 JSX 中的一些常见规则：

### **1.** **所有标签必须闭合**

在 JSX 中，每个标签必须被正确闭合。即使是像 <img> 或 <br> 这样的自闭合标签，也需要在末尾加上斜杠。

```jsx
// 正确的写法
const element = <img src="logo.png" alt="Logo" />;
```

如果忘记加斜杠，React 会报错。

### **2.** **JSX 不能返回多个根元素**

每个 JSX 表达式只能返回一个根元素。若需要多个元素，可以使用 React.Fragment 或空标签 <> 来包裹它们。

```jsx
// 正确的写法
const element = (
  <>
    <h1>Title</h1>
    <p>Description</p>
  </>
);
```

### **3.** **属性使用小驼峰命名法**

在 JSX 中，HTML 属性名必须使用小驼峰命名法，而不是 HTML 中的标准属性名。例如：

- class -> className
- for -> htmlFor
- tabindex -> tabIndex

```jsx
const element = (
  <div className="container" tabIndex={1}>
    test
  </div>
);
```

### 4.JSX 中只能嵌入 JavaScript 表达式

JSX 中的内容必须是有效的 JavaScript 表达式。例如，字符串、数字、函数调用等都可以放在大括号 {} 中。

```jsx
const name = 'React';
const element = <h1>Hello, {name}!</h1>; // 这是一种有效的 JavaScript 表达式
```

**不能嵌入语句：**

```jsx
// 错误写法
const element = <h1>{if (true) { console.log("Hello"); }}</h1>;
```

### **5.** **事件处理函数使用小驼峰命名法**

在 JSX 中，事件处理函数采用小驼峰命名法。例如，onClick、onChange 等。

```jsx
function handleClick() {
  alert('Button clicked!');
}

const element = <button onClick={handleClick}>Click me</button>;
```

### **6.** JavaScript 表达式需用大括号 {} 包裹

在 JSX 中插入 JavaScript 代码时，需要使用大括号 {}。只有 JavaScript 表达式能放入大括号，不能放入语句或函数。

```jsx
const sum = 1 + 2;
const element = <h1>{sum}</h1>; // 正确
```

### **7.** **每个组件必须返回一个元素**

React 组件需要返回一个包含 UI 的单一元素。如果组件返回多个元素，它们需要被包装在一个根元素中，如 div 或 React.Fragment。

```jsx
// 正确的写法
function MyComponent() {
  return (
    <>
      <h1>Hello</h1>
      <p>World</p>
    </>
  );
}
```

### **8.** **属性值的类型**

在 JSX 中，属性值通常是字符串，但它也可以是 JavaScript 表达式。如果属性值是 JavaScript 表达式，需要用大括号包裹。

```jsx
const name = 'Sara';
const element = <h1>Hello, {name}!</h1>; // 使用 JavaScript 表达式
```

### **9.** **避免使用关键字**

JSX 中不允许使用 JavaScript 保留的关键字作为属性名或变量名。比如 for 和 class 是关键字，所以不能用作属性。

```tsx
// 错误的写法
const element = <div for="input">Content</div>;

// 正确的写法
const element = <div htmlFor="input">Content</div>;
```

### **10.** 多行 JSX 需要包裹在括号中

如果 JSX 的代码占用多行，最好将其包裹在括号中，以便于代码的可读性和避免语法错误。

```tsx
const element = (
  <div>
    <h1>Hello</h1>
    <p>World</p>
  </div>
);
```

### 11.避免属性值为 false 或 null

如果属性值为 false 或 null，React 会将该属性从渲染的元素中移除。例如：

```tsx
// 这不会渲染任何属性
const element = <div disabled={false}>Content</div>;
```

## 四、渲染数组

在 React 中，JSX 可以渲染数组，通常用于动态生成多个元素。要渲染一个数组，你可以使用 map() 方法将数组中的每个元素转换为 React 元素，并返回它们。

### 1.使用 map() 渲染数组

```jsx
const items = ['Apple', 'Banana', 'Cherry'];

const element = (
  <ul>
    {items.map((item, index) => (
      <li key={index}>{item}</li> // 每个元素需要一个唯一的 `key` 属性
    ))}
  </ul>
);
```

在上面的例子中，map() 方法遍历 items 数组并为每个元素生成一个 li 标签。**key** 是 React 用来标识哪些元素发生变化的一个特殊属性。React 需要一个唯一的 key 来优化渲染性能。

### 2.**渲染对象数组**

```jsx
const users = [
  { id: 1, name: 'Alice', age: 25 },
  { id: 2, name: 'Bob', age: 30 },
  { id: 3, name: 'Charlie', age: 35 },
];

const element = (
  <ul>
    {users.map((user) => (
      <li key={user.id}>
        {user.name} is {user.age} years old.
      </li>
    ))}
  </ul>
);
```

### **3.渲染数组中的其他 React 组件**

```jsx
function User({ name, age }) {
  return (
    <div>
      <h2>{name}</h2>
      <p>Age: {age}</p>
    </div>
  );
}

const users = [
  { id: 1, name: 'Alice', age: 25 },
  { id: 2, name: 'Bob', age: 30 },
  { id: 3, name: 'Charlie', age: 35 },
];

const element = (
  <div>
    {users.map((user) => (
      <User key={user.id} name={user.name} age={user.age} />
    ))}
  </div>
);
```

### 4.**渲染条件数组**

```jsx
const items = [];

const element = (
  <div>
    {items.length > 0 ? (
      <ul>
        {items.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ul>
    ) : (
      <p>No items available</p>
    )}
  </div>
);
```

### 5.**避免使用索引作为 key（除非数据不会变化）**

**何时可以使用索引作为 key？**

- 数据不会发生变化：如果数据是静态的（即渲染后不会进行排序或修改）
- 数据没有独特标识符：如果你的数据没有唯一标识符，而数据本身是静态的，使用索引也可以。

```jsx
const element = (
  <ul>
    {['Apple', 'Banana', 'Cherry'].map((item, index) => (
      <li key={index}>{item}</li> // 使用索引作为 key，因为数据不会改变
    ))}
  </ul>
);
```

**尽量使用对象的 id | 数据库中的唯一标识符 | 其他唯一字段**

```jsx
const users = [
  { id: 'u1', name: 'Alice' },
  { id: 'u2', name: 'Bob' },
  { id: 'u3', name: 'Charlie' },
];

const element = (
  <ul>
    {users.map((user) => (
      <li key={user.id}>{user.name}</li> // 使用唯一的 id 作为 key
    ))}
  </ul>
);
```
