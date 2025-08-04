---
title: React组件
theme: solarized-dark
---

# React 组件基础

## 一、组件

### 1. 什么是组件？

此时 App 是一个单体，我们在真正做项目的时候，我们需要把它分解成可管理的，可描述的组件。 React 对于什么是组件和什么不是组件并没有任何硬性规定，这完全取决于你！

React 优秀项目 <https://win11.blueedge.me/>

### 2. 定义第一个组件

如果你没有组件开发的经验，那你一定要记住我的准则:

- 如果它在程序里是一个块，那么它就是一个组件
- 如果它在程序里面经常出现，那么也它也是组件

使用通用的 UI 元素作为组件，可以让你只更改一处，就能更改所有使用该组件的地方

### 3. 编写 Card 组件

例如项目中经常会用到一个卡片组件我们来编写一个卡片组件

我们新建一个文件夹`components`

目录结构：

- components
- Card
  - index.tsx
  - index.css

**index.css**

```css
.card {
  background: white;
  border-radius: 5px;
  border: 1px solid #ccc;
  max-width: 500px;
  box-shadow: 3px 3px 3px #ccc;

  header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid #ccc;
    padding: 10px;

    div:last-child {
      color: #1677ff;
    }
  }

  main {
    min-height: 200px;
    border-bottom: 1px solid #ccc;
    padding: 10px;
  }
  footer {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    padding: 10px;
    button {
      margin-left: 10px;
      padding: 3px 10px;
    }
  }
}
```

**index.tsx**

```tsx
import './index.css';

export default function Card() {
  return (
    <div className="card">
      <header>
        <div>标题</div>
        <div>副标题</div>
      </header>
      <main>内容区域</main>
      <footer>
        <button>确认</button>
        <button>取消</button>
      </footer>
    </div>
  );
}
```

**App.tsx 引入 Card 组件**

这种称之为局部组件在哪一个页面需要使用就在哪一个页面引入即可！

```tsx
import Card from './components/Card'; // 引入组件
function App() {
  return (
    <>
      <Card></Card>
      <Card></Card>
      <Card></Card>
    </>
  );
}
```

### 4. 全局组件

目录结构：

- components
- Message
  - index.tsx
  - index.css

**Message/index.css**

```css
.message {
  width: 160px;
  height: 30px;
  position: fixed;
  top: 10px;
  left: 50%;
  margin-left: -80px;
  background: #fff;
  border: 1px solid #ccc;
  text-align: center;
  line-height: 30px;
  border-radius: 5px;
}
```

**Message/index.tsx**

创建一个 queue 队列因为可以点击多次需要存到数组，并且累加每次的高度，使元素没有进行重叠，而是顺移，所以需要一个 queue 队列，删除的时候就按顺序删除即可。

```tsx
import ReactDom from 'react-dom/client';
import './index.css';
const Message = () => {
  return <div>提示组件</div>;
};
interface Itesm {
  messageContainer: HTMLDivElement;
  root: ReactDom.Root;
}
const queue: Itesm[] = [];
window.onShow = () => {
  const messageContainer = document.createElement('div');
  messageContainer.className = 'message';
  messageContainer.style.top = `${queue.length * 50}px`;
  document.body.appendChild(messageContainer);
  const root = ReactDom.createRoot(messageContainer);
  root.render(<Message />); //渲染组件
  queue.push({
    messageContainer,
    root,
  });
  //2秒后移除
  setTimeout(() => {
    const item = queue.find((item) => item.messageContainer === messageContainer)!;
    item.root.unmount(); //卸载
    document.body.removeChild(item.messageContainer);
    queue.splice(queue.indexOf(item), 1);
  }, 2000);
};

//声明扩充
declare global {
  interface Window {
    onShow: () => void;
  }
}

export default Message;
```

在 main.tsx 注入即可使用 `import './components/Message/index.tsx'`

App.tsx Card.tsx 使用

```tsx
<button onClick={() => window.onShow()}>确认</button>
```

![组件1.png](https://p0-xtjj-private.juejin.cn/tos-cn-i-73owjymdk6/650cddb98a184270b763cc7564372f46~tplv-73owjymdk6-jj-mark-v1:0:0:0:0:5o6Y6YeR5oqA5pyv56S-5Yy6IEAgVHJlZUZpc2g=:q75.awebp?policy=eyJ2bSI6MywidWlkIjoiMzQ3NDExMjQ3NjYzNjgyNCJ9&rk3s=f64ab15b&x-orig-authkey=f32326d3454f2ac7e96d3d06cdbb035152127018&x-orig-expires=1753946914&x-orig-sign=kkZz8QQl6Rx7n7vf25Aj9rPf%2Fww%3D)

## 二、组件通信

React 组件使用 `props` 来互相通信。每个父组件都可以提供 props 给它的子组件，从而将一些信息传递给它。Props 可能会让你想起 HTML 属性，但你可以通过它们传递任何 JavaScript 值，包括对象、数组和函数 以及 html 元素，这样可以使我们的组件更加灵活。

例如我们在使用原生 html 标签时,我们可以为其传递属性，如下

```html
<img width='500' height='500' alt='xxx' src='xxxxxxx' /
```

那在 React 中，也允许将属性传递给自己编写的`组件` 如下

```tsx
export default function App() {
  return <Card title="标题1" content="内容"></Card>;
}
```

### 1. 父子组件通信

编写一个`子组件` Test

```tsx
const Test = () => {
  return <div>Test</div>;
};
export default Test;
```

在 App.tsx 引入该子组件

```tsx
import Test from './components/Test';
function App() {
  return (
    <>
      <Test></Test>
    </>
  );
}

export default App;
```

### 2. 父向子组件传递 props

支持的类型如下：

- string `title={'测试'}`
- number `id={1}`
- boolean `isGirl={false}`
- null `empty={null}`
- undefined `empty={undefined}`
- object `obj={ { a: 1, b: 2 } }`
- array `arr={[1, 2, 3]}`
- function `cb={(a: number, b: number) => a + b}`
- JSX.Element `element={<div>测试</div>}`

```tsx
function App() {
  return (
    <>
      <Test
        title={'测试'}
        id={1}
        obj={{ a: 1, b: 2 }}
        arr={[1, 2, 3]}
        cb={(a: number, b: number) => a + b}
        empty={null}
        element={<div>测试</div>}
        isGirl={false}
      ></Test>
    </>
  );
}
```

子组件接受父组件传递的 props

props 是一个对象，会作为函数的第一个参数接受传过来的 props 值

**`注意：我们需要遵守单向数据流，子组件不能直接修改父组件的props`**

在 React 源码中会使用`Object.freeze`冻结 props，限制 props 的修改。

Object.freeze() 静态方法可以使一个对象被冻结。冻结对象可以防止扩展，并使现有的属性不可写入和不可配置。被冻结的对象不能再被更改：不能添加新的属性，不能移除现有的属性，不能更改它们的可枚举性、可配置性、可写性或值，对象的原型也不能被重新指定

```tsx
import React from 'react';
interface Props {
  title: string;
  id: number;
  obj: {
    a: number;
    b: number;
  };
  arr: number[];
  cb: (a: number, b: number) => number;
  empty: null;
  element: JSX.Element;
}

const Test: React.FC<Props> = (props) => {
  console.log(props);
  return <div>Test</div>;
};

export default Test;
```

### 3. 定义默认值

#### 3.1 第一种方式

将属性变为可选的这儿使用`title`举例 `title?: string`

然后将 props 进行解构，定义默认值 `{title = '默认标题'}`

```tsx
import React from 'react';
interface Props {
  title?: string;
  id: number;
  obj: {
    a: number;
    b: number;
  };
  arr: number[];
  cb: (a: number, b: number) => number;
  empty: null;
  element: JSX.Element;
}

const Test: React.FC<Props> = ({ title = '默认标题' }) => {
  return <div>Test</div>;
};

export default Test;
```

#### 3.2 第二种方式

使用`defaultProps`进行默认值赋值，最后把 defaultProps 和 props 合并，注意顺序要先写 defaultProps，再写 props 因为 props 会覆盖 defaultProps 的值。

```tsx
import React from 'react';
interface Props {
  title?: string;
  id: number;
  obj: {
    a: number;
    b: number;
  };
  arr: number[];
  cb: (a: number, b: number) => number;
  empty: null;
  element: JSX.Element;
}

const defaultProps: Partial<Props> = {
  title: '默认标题',
};

const Test: React.FC<Props> = (props) => {
  const { title } = { ...defaultProps, ...props };
  return <div>{title}</div>;
};

export default Test;
```

### 4. React.FC

React.FC 是函数式组件，是在 TS 使用的一个范型。FC 是 Function Component 的缩写

React.FC 帮助我们自动推导 Props 的类型。

> 注意：在旧版本的 React.FC 是包含`PropsWithChildren`这个声明新版本已经没有了

### 5. props.children 特殊值

这个功能类似于 Vue 的插槽，直接在子组件内部插入标签会自动一个参数`props.children`

```tsx
function App() {
  return (
    <>
      <Test>
        <div>123</div>
      </Test>
    </>
  );
}
```

子组件使用 children 属性

在之前的版本 children 是不需要手动定义的，在 18 之后改为需要手动定义类型

这样就会把父级的 `<div>123</div>` 插入子组件的 `<div>` 里面

```tsx
import React from 'react';
interface Props {
  children: React.ReactNode; //手动声明children
}

const Test: React.FC<Props> = (props) => {
  return <div>{props.children}</div>;
};

export default Test;
```

### 6. 子组件给父组件传值

React 没有像 Vue 那样的 emit 派发事件，所有我们回调函数模拟 emit 派发事件

父组件传递`函数`过去,其本质就是录用函数的回调

```tsx
import Test from './components/Test';
function App() {
  const fn = (params: string) => {
    console.log('子组件触发父组件', params);
  };
  return (
    <>
      <Test callback={fn}></Test>
    </>
  );
}
```

子组件接受函数，并且在对应的事件调用函数，回调参数回去

```tsx
import React from 'react';
interface Props {
  callback: (params: string) => void;
  children?: React.ReactNode;
}

const Test: React.FC<Props> = (props) => {
  return (
    <div>
      <button onClick={() => props.callback('给父组件传参')}>派发事件</button>
    </div>
  );
};

export default Test;
```

### 7. 兄弟组件通信

定义两个组件放到一起作为兄弟组件，其原理就是`发布订阅`设计模式

### 8. 原生浏览器实现

```tsx
import Card from './components/Card';
import Test from './components/Test';
function App() {
  return (
    <>
      <Test></Test>
      <Card></Card>
    </>
  );
}

export default App;
```

第一个兄弟组件 定义事件模型

```tsx
import React from 'react';
const Test: React.FC = (props) => {
  const event = new Event('on-card'); //添加到事件中心，事件名称不能和原生事件名称重复
  const clickTap = () => {
    console.log(event);
    event.params = { name: '张三' };
    window.dispatchEvent(event); //派发事件
  };
  return (
    <div>
      <button onClick={clickTap}>派发事件</button>
    </div>
  );
};
//扩充event类型
declare global {
  interface Event {
    params: any;
  }
}

export default Test;
```

第二个兄弟组件接受事件

```tsx
import './index.css';
export default function Test2() {
  //接受参数
  window.addEventListener('on-card', (e) => {
    console.log(e.params, '触发了');
  });

  return <div className="card"></div>;
}
```

### 9. mitt 实现通信

官方文档：<https://www.npmjs.com/package/mitt>

**安装**

```sh
pnpm add mitt
# 或者 npm install mitt
```

**创建 mitt 实例 eventBus.ts**

```ts
// src/eventBus.ts
import mitt from 'mitt';
// 定义事件类型（可选但推荐）
type Events = {
  customMessage: string;
};
const emitter = mitt<Events>();
export default emitter;
```

**BrotherA.tsx**

```tsx
// src/components/BrotherA.tsx
import React from 'react';
import emitter from '../eventBus';
function BrotherA() {
  const sendMessage = () => {
    emitter.emit('customMessage', 'Hello from BrotherA 👋');
  };
  return (
    <div style={{ margin: '20px 0', padding: 10, border: '1px solid #ccc' }}>
      <h3>BrotherA 组件</h3>
      <button onClick={sendMessage}>发送消息给 BrotherB</button>
    </div>
  );
}
export default BrotherA;
```

**BrotherB.tsx**

```tsx
// src/components/BrotherB.tsx
import React, { useEffect, useState } from 'react';
import emitter from '../eventBus';
function BrotherB() {
  const [msg, setMsg] = useState('');
  useEffect(() => {
    // 监听消息事件
    const handler = (message: string) => {
      setMsg(message);
    };
    emitter.on('customMessage', handler);
    // 卸载时取消监听
    return () => {
      emitter.off('customMessage', handler);
    };
  }, []);
  return (
    <div style={{ padding: 10, border: '1px solid #ccc' }}>
      <h3>BrotherB 组件</h3>
      <p>收到消息：{msg || '暂无消息'}</p>
    </div>
  );
}
export default BrotherB;
```

## 三、React 受控组件理解和应用

### 1. React 受控组件

受控组件一般是指表单元素，表单的数据由 React 的 State 管理，更新数据时，需要手动调用\*\*setState()\*\*方法，更新数据。因为 React 没有类似于 Vue 的 v-model，所以需要自己实现绑定事件。

### 2. 那为什么需要使用受控组件呢？

使用受控组件可以确保表单数据与组件状态同步、便于集中管理和验证数据，同时提供灵活的事件处理机制以实现数据格式化和 UI 联动效果。

### 3. 案例

我们在界面的输入框中输入内容，这时候你会发现这个 value 是只读的，无法修改，还会报错

> \[!WARNING]
>
> hook.js:608 You provided a value prop to a form field without an onChange handler. This will render a read-only field. If the field should be mutable use defaultValue. Otherwise, set either onChange or readOnly. Error Component Stack

```tsx
import React, { useState } from 'react';

const App: React.FC = () => {
  const [value, setValue] = useState('');
  return (
    <>
      <input type="text" value={value} />
      <div>{value}</div>
    </>
  );
};

export default App;
```

当用户输入内容的时候，value 并不会自动更新，这时候就需要我们手动实现一个 onChange 事件来更新 value。

```tsx
import React, { useState } from 'react';

const App: React.FC = () => {
  const [value, setValue] = useState('');
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
  };
  return (
    <>
      <input type="text" value={value} onChange={handleChange} />
      <div>{value}</div>
    </>
  );
};

export default App;
```

其实就是实现了一个类似 Vue 的 v-model 的机制，通过 onChange 事件来更新 value，这样就实现了受控组件。

> 受控组件适用于所有表单元素，包括 input、textarea、select 等。但是除了 input type="file" 外，其他表单元素都推荐使用受控组件。

### 4. React 非受控组件

非受控组件指的是该表单元素不受 React 的 State 管理，表单的数据由 DOM 管理。通过\*\*useRef()\*\*来获取表单元素的值。

我们使用**defaultValue**来设置表单的默认值，但是你要想实时获取值，就需要使用 useRef()来获取表单元素的值。跟操作 DOM 一样。

```tsx
import React, { useState, useRef } from 'react';
const App: React.FC = () => {
  const value = '张三';
  const inputRef = useRef<HTMLInputElement>(null);
  const handleChange = () => {
    console.log(inputRef.current?.value);
  };
  return (
    <>
      <input type="text" onChange={handleChange} defaultValue={value} ref={inputRef} />
    </>
  );
};

export default App;
```

### 5. 特殊的表单 File

对于 file 类型的表单控件，它是一个特殊的组件，因为它的值只能由用户通过文件选择操作来设置，而不能通过程序直接设置。这使得它在 React 中的处理方式与其他表单元素有所不同。

如果非要把 file 类型设置为受控组件，他就会就行报错

    hook.js:608 A component is changing an uncontrolled input to be controlled. This is likely caused by the value changing from undefined to a defined value, which should not happen. Decide between using a controlled or uncontrolled input element for the lifetime of the component. More info:

报错内容大致为：

> \[!WARNING]
>
> 一个组件正在将一个未受控的输入控件改为受控的。这可能是由于值从未定义变为已定义，这应该不会发生。在组件的生命周期内，决定使用受控还是未受控的输入控件。

```tsx
import React, { useState } from 'react';
const App: React.FC = () => {
  const [files, setFiles] = useState<File | null>(null);
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFiles(e.target.files?.[0]!);
  };
  return (
    <>
      <input type="file" value={files} onChange={handleChange} />
    </>
  );
};

export default App;
```

使用**useRef**修改为非受控组件

```tsx
import React, { useRef } from 'react';
const App: React.FC = () => {
  const inputRef = useRef<HTMLInputElement>(null);
  const handleChange = () => {
    console.log(inputRef.current?.files);
  };
  return (
    <>
      <input type="file" ref={inputRef} onChange={handleChange} />
    </>
  );
};

export default App;
```

## 四、异步组件

#### 1. Suspense

Suspense 是一种异步渲染机制，其核心理念是在组件加载或数据获取过程中，先展示一个占位符（loading state），从而实现更自然流畅的用户界面更新体验。

### 2. 应用场景

- **异步组件加载**：通过代码分包实现组件的按需加载，有效减少首屏加载时的资源体积，提升应用性能。
- **异步数据加载**：在数据请求过程中展示优雅的过渡状态（如 loading 动画、骨架屏等），为用户提供更流畅的交互体验。
- **异步图片资源加载**：智能管理图片资源的加载状态，在图片完全加载前显示占位内容，确保页面布局稳定，提升用户体验。

### 3. 用法

```tsx
<Suspense fallback={<div>Loading...</div>}>
  <AsyncComponent />
</Suspense>
```

**入参:**

- fallback: 指定在组件加载或数据获取过程中展示的组件或元素
- children: 指定要异步加载的组件或数据

### 4. 案例

#### 4.1 异步组件加载

创建一个异步组件

- src/components/Async/index.tsx

```tsx
export const AsyncComponent = () => {
  return <div>Async</div>;
};

export default AsyncComponent;
```

- src/App.tsx

使用`lazy`进行异步加载组件，使用 Suspense 包裹异步组件，fallback 指定加载过程中的占位组件

```tsx
import React, { useRef, useState, Suspense, lazy } from 'react';
const AsyncComponent = lazy(() => import('./components/Async'));
const App: React.FC = () => {
  return (
    <>
      <Suspense fallback={<div>loading</div>}>
        <AsyncComponent />
      </Suspense>
    </>
  );
};

export default App;
```

#### 4.2 异步数据加载

我们实现卡片详情，在数据加载过程中展示骨架屏，数据加载完成后展示卡片详情。

> 建议升级到`React19`, 因为我们会用到一个`use`的 API, 这个 API 在`React18`中是实验性特性，在`React19`纳入正式特性
>
> 模拟数据,我们放到 public 目录下, 方便获取直接(通过地址 + 文件名获取) 例如:

- public/data.json

```json
{
  "data": {
    "id": 1,
    "address": "北京市房山区住岗子村10086",
    "name": "帅哥",
    "age": 26,
    "avatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=帅哥"
  }
}
```

创建一个骨架屏组件，用于在数据加载过程中展示，提升用户体验,当然你封装 loading 组件也是可以的。

- src/components/skeleton/index.tsx

```tsx
import './index.css';
export const Skeleton = () => {
  return (
    <div className="skeleton">
      <header className="skeleton-header">
        <div className="skeleton-name"></div>
        <div className="skeleton-age"></div>
      </header>
      <section className="skeleton-content">
        <div className="skeleton-address"></div>
        <div className="skeleton-avatar"></div>
      </section>
    </div>
  );
};
```

```tsx
.skeleton {
    width: 300px;
    height: 150px;
    border: 1px solid #d6d3d3;
    margin: 30px;
    border-radius: 2px;
}

.skeleton-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid #d6d3d3;
    padding: 10px;
}

.skeleton-name {
    width: 100px;
    height: 20px;
    background-color: #d6d3d3;
    animation: skeleton-loading 1.5s ease-in-out infinite;
}

.skeleton-age {
    width: 50px;
    height: 20px;
    background-color: #d6d3d3;
    animation: skeleton-loading 1.5s ease-in-out infinite;
}

.skeleton-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px;
}

.skeleton-address {
    width: 100px;
    height: 20px;
    background-color: #d6d3d3;
    animation: skeleton-loading 1.5s ease-in-out infinite;
}

.skeleton-avatar {
    width: 50px;
    height: 50px;
    background-color: #d6d3d3;
    animation: skeleton-loading 1.5s ease-in-out infinite;
}

@keyframes skeleton-loading {
    0% {
        opacity: 0.6;
    }
    50% {
        opacity: 1;
    }
    100% {
        opacity: 0.6;
    }
}
```

创建一个卡片组件，用于展示数据，这里面介绍一个新的 API `use`

`use` API 用于获取组件内部的 Promise,或者 Context 的内容，该案例使用了 use 获取 Promise 返回的数据并且故意延迟 2 秒返回，模拟网络请求。

- src/components/Card/index.tsx

```tsx
import { use } from 'react';
import './index.css';
interface Data {
  name: string;
  age: number;
  address: string;
  avatar: string;
}

const getData = async () => {
  await new Promise((resolve) => setTimeout(resolve, 2000));
  return (await fetch('http://localhost:5173/data.json').then((res) => res.json())) as { data: Data };
};

const dataPromise = getData();

const Card: React.FC = () => {
  const { data } = use(dataPromise);
  return (
    <div className="card">
      <header className="card-header">
        <div className="card-name">{data.name}</div>
        <div className="card-age">{data.age}</div>
      </header>
      <section className="card-content">
        <div className="card-address">{data.address}</div>
        <div className="card-avatar">
          <img width={50} height={50} src={data.avatar} alt="" />
        </div>
      </section>
    </div>
  );
};

export default Card;
```

```css
.card {
  width: 300px;
  height: 150px;
  border: 1px solid #d6d3d3;
  margin: 30px;
  border-radius: 2px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #d6d3d3;
  padding: 10px;
}

.card-age {
  font-size: 12px;
  color: #999;
}

.card-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
}
```

使用方式如下: 通过 Suspense 包裹 Card 组件，fallback 指定骨架屏组件

- src/App.tsx

```tsx
import React, { useRef, useState, Suspense, lazy } from 'react';
import Card from './components/Card';
import { Skeleton } from './components/Skeleton';
const App: React.FC = () => {
  return (
    <>
      <Suspense fallback={<Skeleton />}>
        <Card />
      </Suspense>
    </>
  );
};

export default App;
```

> \[!CAUTION]
>
> 本文内容参考[小满大佬](https://juejin.cn/post/7410313831271776256)
