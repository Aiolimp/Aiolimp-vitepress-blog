---
title: 005 React Hooks(副作用、状态传递)
theme: solarized-dark
---

# 副作用

## 一、useEffect

`useEffect` 是 React 中用于处理`副作用`的钩子。并且`useEffect` 还在这里充当生命周期函数，在之前你可能会在类组件中使用 `componentDidMount`、`componentDidUpdate` 和 `componentWillUnmount` 来处理这些生命周期事件。

### 1.什么是副作用函数，什么是纯函数？

**纯函数**

- 输入决定输出：相同的输入永远会得到相同的输出。这意味着函数的行为是可预测的。
- 无副作用：纯函数`不会修改外部状态`，也不会依赖外部可变状态。因此，纯函数内部的操作不会影响外部的变量、文件、数据库等。

```ts
function add(a: number, b: number): number {
  return a + b;
}
```

无论你执行多少次：

```ts
add(1, 2); // 永远都是 3
```

没有修改任何外部变量、没有发请求、没有打印日志 —— 这就是一个纯函数。

**副作用函数**

- 副作用函数 指的是那些在执行时会改变外部状态或依赖外部可变状态的函数。

- 可预测性降低但是副作用不一定是坏事有时候副作用带来的效果才是我们所期待的

- 高耦合度函数非常依赖外部的变量状态紧密
  - 操作引用类型
  - 操作本地存储例如`localStorage`
  - 调用外部 API，例如`fetch` `ajax`
  - 操作`DOM`
  - 计时器

```ts
let globalVariable = 0;

function calculateDouble(number) {
  globalVariable += 1; //修改函数外部环境变量

  localStorage.setItem('globalVariable', globalVariable); //修改 localStorage

  fetch(/*…*/).then((res) => {
    //网络请求
    //…
  });

  document.querySelector('.app').style.color = 'red'; //修改 DOM element

  return number * 2;
}
```

这个函数每次调用都会**改变外部状态**，所以它是一个副作用函数。

### 2.useEffect 用法

```ts
  useEffect(setup, dependencies?)
  useEffect(() => {
  	const connection = createConnection(serverUrl, roomId); // 执行副作用
    connection.connect();
  	return () => { // 清理函数
      connection.disconnect();
  	};
  }, [serverUrl, roomId]) // 依赖项列表

```

**参数**

- setup：Effect 处理函数,可以返回一个**清理函数**。组件挂载时执行 setup,依赖项更新时先执行 cleanup 再执行 setup,组件卸载时执行 cleanup。
- dependencies(可选)：setup 中使用到的响应式值列表(props、state 等)。必须以数组形式编写如\[dep1, dep2]。不传则每次重渲染都执行 Effect。

**返回值**

useEffect 返回 `undefined`

```tsx
let a = useEffect(() => {});
console.log('a', a); //undefined
```

### 3.基本使用

副作用函数能做的事情`useEffect`都能做，例如操作`DOM`、网络请求、计时器等等。

**操作 DOM**

```jsx
import { useEffect } from 'react';

function App() {
  const dom = document.getElementById('data');
  console.log(dom); // 这里的dom是null，因为useEffect是在组件渲染后执行的，此时dom还没有被渲染出来
  useEffect(() => {
    const data = document.getElementById('data');
    console.log(data); //<div id='data'>张三</div> 这里的data是有值的，因为useEffect是在组件渲染后执行的，此时dom已经被   渲染出来了
  }, []);
  return <div id="data">张三</div>;
}
```

**网络请求**

```tsx
useEffect(() => {
  fetch('http://localhost:5174/?name=AA');
}, []);
```

### 4.执行时机

##### **组件挂载时执行**

根据我们下面的例子可以观察到，组件在挂载的时候就执行了`useEffect`的副作用函数。

类似于`componentDidMount`

```tsx
useEffect(() => {
  console.log('组件挂载时执行');
});
```

##### 组件更新时执行

- 无依赖项更新

根据我们下面的例子可以观察到，当有响应式值发生改变时，`useEffect`的副作用函数就会执行。

类似于`componentDidUpdate` + `componentDidMount`

```tsx
import { useEffect, useState } from 'react';

const App = () => {
  const [count, setCount] = useState(0);
  const [name, setName] = useState('');
  useEffect(() => {
    console.log('执行了', count, name);
  }); // useEffect没有第二个参数，无依赖项
  return (
    <div id="data">
      <div>
        <h3>count:{count}</h3>
        <button onClick={() => setCount(count + 1)}>+</button>
      </div>
      <div>
        <h3>name:{name}</h3>
        <input value={name} onChange={(e) => setName(e.target.value)} />
      </div>
    </div>
  );
};
export default App;
```

- 有依赖项更新

根据我们下面的例子可以观察到，当依赖项数组中的`count`值发生改变时，`useEffect`的副作用函数就会执行。而当`name`值改变时,由于它不在依赖项数组中,所以不会触发副作用函数的执行。

```tsx
import { useEffect, useState } from 'react';

const App = () => {
  const [count, setCount] = useState(0);
  const [name, setName] = useState('');
  useEffect(() => {
    console.log('执行了', count, name);
  }, [count]); //当count发生改变时执行
  return (
    <div id="data">
      <div>
        <h3>count:{count}</h3>
        <button onClick={() => setCount(count + 1)}>+</button>
      </div>
      <div>
        <h3>name:{name}</h3>
        <input value={name} onChange={(e) => setName(e.target.value)} />
      </div>
    </div>
  );
};
export default App;
```

- 依赖项空值

根据我们下面的例子可以观察到，当依赖项为空数组时，`useEffect`的副作用函数只会执行一次，也就是组件挂载时执行。

适合做一些`初始化`的操作例如获取详情什么的。

```tsx
import { useEffect, useState } from 'react';

const App = () => {
  const [count, setCount] = useState(0);
  const [name, setName] = useState('');
  useEffect(() => {
    console.log('执行了', count, name);
  }, []); //只会执行一次
  return (
    <div id="data">
      <div>
        <h3>count:{count}</h3>
        <button onClick={() => setCount(count + 1)}>+</button>
      </div>
      <div>
        <h3>name:{name}</h3>
        <input value={name} onChange={(e) => setName(e.target.value)} />
      </div>
    </div>
  );
};
export default App;
```

##### 组件卸载时执行

`useEffect`的副作用函数可以返回一个清理函数，当组件卸载时，`useEffect`的副作用函数就会执行清理函数。

确切说清理函数就是副作用函数运行之前，会清楚上一次的副作用函数。

根据我们下面的例子可以观察到，当组件卸载时，`useEffect`的副作用函数就会执行。

类似于`componentWillUnmount`

```tsx
import { useEffect, useState } from 'react';
// 子组件
const Child = (props: { name: string }) => {
  useEffect(() => {
    console.log('render', props.name);
    // 返回一个清理函数
    return () => {
      console.log('unmount', props.name); // 组件卸载时执行
    };
  }, [props.name]);
  return <div>Child:{props.name}</div>;
};
const App = () => {
  const [show, setShow] = useState(true);
  const [name, setName] = useState('');
  return (
    <div id="data">
      <div>
        <h3>父组件</h3>
        <input value={name} onChange={(e) => setName(e.target.value)} />
        <button onClick={() => setShow(!show)}>显示/隐藏</button>
      </div>
      <hr />
      <h3>子组件</h3>
      {show && <Child name={name} />}
    </div>
  );
};

export default App;
```

##### 清理函数应用场景

例如我们下面这个例子，当`name`值发生改变时，`useEffect`的副作用函数就会执行，并且会开启一个定时器，当`name`值再次发生改变时，`useEffect`的副作用函数就会执行清理函数，清除上一次的定时器。这样就避免了接口请求的重复执行。

```tsx
import { useEffect, useState } from 'react';
// 子组件
const Child = (props: { name: string }) => {
  useEffect(() => {
    let timer = setTimeout(() => {
      fetch(`http://localhost:5174/?name=${props.name}`);
    }, 1000);
    return () => {
      clearTimeout(timer); // 当name值发生改变时，useEffect的副作用函数就会执行，并且会开启一个定时器,避免了接口请求的重复执行
    };
  }, [props.name]);
  return <div>Child</div>;
};
const App = () => {
  const [show, setShow] = useState(true);
  const [name, setName] = useState('');
  return (
    <div id="data">
      <div>
        <h3>父组件</h3>
        <input value={name} onChange={(e) => setName(e.target.value)} />
        <button onClick={() => setShow(!show)}>显示/隐藏</button>
      </div>
      <hr />
      <h3>子组件</h3>
      {show && <Child name={name} />}
    </div>
  );
};

export default App;
```

### 5.真实案例

下面是一个真实的用户信息获取案例，通过`id`获取用户信息，并且当`id`发生改变时，会获取新的用户信息。

```tsx
import React, { useState, useEffect } from 'react';
interface UserData {
  name: string;
  email: string;
  username: string;
  phone: string;
  website: string;
}
function App() {
  const [userId, setUserId] = useState(1); // 假设初始用户ID为1
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  /**
   * 当 userId 发生变化时，触发副作用函数，从 API 获取用户数据
   */
  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true);
      try {
        const response = await fetch(`https://jsonplaceholder.typicode.com/users/${userId}`); //免费api接口 可以直接使用
        if (!response.ok) {
          throw new Error('网络响应不正常');
        }
        const data = await response.json();
        setUserData(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchUserData();
  }, [userId]);

  /**
   * 处理用户输入框值变化的函数，将输入的用户 ID 更新到 userId 状态中
   * @param event - 输入框变化事件对象
   */
  const handleUserChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUserId(parseInt(event.target.value));
  };

  return (
    <div>
      <h1>用户信息应用</h1>
      <label>
        输入用户ID:
        <input type="number" value={userId} onChange={handleUserChange} min="1" max="10" />
      </label>
      {loading && <p>加载中...</p>}
      {error && <p>错误: {error}</p>}
      {userData && (
        <div>
          <h2>用户信息</h2>
          <p>姓名: {userData.name}</p>
          <p>邮箱: {userData.email}</p>
          <p>用户名: {userData.username}</p>
          <p>电话: {userData.phone}</p>
          <p>网站: {userData.website}</p>
        </div>
      )}
    </div>
  );
}

export default App;
```

## 二、useLayoutEffect

`useLayoutEffect` 是 React 中的一个 Hook，用于在浏览器重新绘制屏幕之前触发。与 useEffect 类似。

### 1.用法

```jsx
useLayoutEffect(() => {
  // 副作用代码
  return () => {
    // 清理代码
  };
}, [dependencies]);
```

**参数**

- setup：Effect 处理函数,可以返回一个清理函数。组件挂载时执行 setup,依赖项更新时先执行 cleanup 再执行 setup,组件卸载时执行 cleanup。
- dependencies(可选)：setup 中使用到的响应式值列表(props、state 等)。必须以数组形式编写如\[dep1, dep2]。不传则每次重渲染都执行 Effect。

**返回值**

useLayoutEffect 返回 `undefined`

### 2.区别(useLayoutEffect/useEffect)

| 区别     | useLayoutEffect                      | useEffect                            |
| :------- | :----------------------------------- | :----------------------------------- |
| 执行时机 | 浏览器完成布局和绘制`之前`执行副作用 | 浏览器完成布局和绘制`之后`执行副作用 |
| 执行方式 | 同步执行                             | 异步执行                             |
| DOM 渲染 | 阻塞 DOM 渲染                        | 不阻塞 DOM 渲染                      |

### 3.测试 DOM 阻塞

下面这个例子展示了 useLayoutEffect 和 useEffect 在 DOM 渲染时的区别。useLayoutEffect 会阻塞 DOM 渲染,而 useEffect 不会。

```jsx
import React, { useLayoutEffect, useEffect, useState } from 'react';

function App() {
  const [count, setCount] = useState(0);
  //不阻塞DOM
  // useEffect(() => {
  //    for (let i = 0; i < 50000; i++) {
  //       //console.log(i);
  //       setCount(count => count + 1)
  //    }
  // }, []);
  //阻塞DOM
  // useLayoutEffect(() => {
  //    for (let i = 0; i < 50000; i++) {
  //       //console.log(i);
  //       setCount(count => count + 1)
  //    }
  // }, []);
  return (
    <div>
      <div>app </div>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index}>{index}</div>
      ))}
    </div>
  );
}

export default App;
```

### 4.测试同步异步渲染

在下面的动画示例代码中:

1.  useEffect 实现的动画效果:
    - 初始渲染时 opacity: 0
    - 浏览器完成绘制
    - useEffect 异步执行,设置 opacity: 1
    - 用户可以看到完整的淡入动画过渡效果
2.  useLayoutEffect 实现的动画效果:
    - 初始渲染时 opacity: 0
    - DOM 更新后立即同步执行 useLayoutEffect
    - 设置 opacity: 1
    - 浏览器绘制时已经是最终状态
    - 用户看不到过渡动画效果

```css
#app1 {
  width: 200px;
  height: 200px;
  background: red;
}

#app2 {
  width: 200px;
  height: 200px;
  background: blue;
  margin-top: 20px;
  position: absolute;
  top: 230px;
}
```

```tsx
import React, { useLayoutEffect, useEffect, useRef } from 'react';
function App() {
  // 使用 useEffect 实现动画效果
  useEffect(() => {
    const app1 = document.getElementById('app1') as HTMLDivElement;
    app1.style.transition = 'opacity 3s';
    app1.style.opacity = '1';
  }, []);

  // 使用 useLayoutEffect 实现动画效果
  useLayoutEffect(() => {
    const app2 = document.getElementById('app2') as HTMLDivElement;
    app2.style.transition = 'opacity 3s';
    app2.style.opacity = '1';
  }, []);

  return (
    <div>
      <div id="app1" style={{ opacity: 0 }}>
        app1
      </div>
      <div id="app2" style={{ opacity: 0 }}>
        app2
      </div>
    </div>
  );
}

export default App;
```

### 5.应用场景

- 需要同步读取或更改 DOM：例如，你需要读取元素的大小或位置并在渲染前进行调整。
- 防止闪烁：在某些情况下，异步的 useEffect 可能会导致可见的布局跳动或闪烁。例如，动画的启动或某些可见的快速 DOM 更改。
- 模拟生命周期方法：如果你正在将旧的类组件迁移到功能组件，并需要模拟 componentDidMount、componentDidUpdate 和 componentWillUnmount 的同步行为。

### 6.案例

可以记录滚动条位置，等用户返回这个页面时，滚动到之前记录的位置。增强用户体验。

```tsx
import React, { useLayoutEffect } from 'react';

function App() {
  const handelScrool = (e: React.UIEvent<HTMLDivElement>) => {
    const scroolTop = e.currentTarget.scrollTop;
    window.history.replaceState({}, '', `?top=${scroolTop}`); // 每次滚动时，将滚动位置保存到url中
  };
  useLayoutEffect(() => {
    // 获取url中的top值，然后滚动到指定位置
    const container = document.getElementById('container') as HTMLDivElement;
    const top = window.location.search.split('=')[1];
    container.scrollTop = parseInt(top); // 这里的top是字符串，需要转换成数字，否则会报错，因为scrollTop的类型是number，而不是unknow
  }, []);
  return (
    <div onScroll={handelScrool} id="container" style={{ height: '500px', overflow: 'auto' }}>
      {Array.from({ length: 500 }, (_, i) => (
        <div key={i} style={{ height: '100px', borderBottom: '1px solid #ccc' }}>
          Item {i + 1}
        </div>
      ))}
    </div>
  );
}

export default App;
```

## 三、useRef

当你在 React 中需要处理 DOM 元素或需要在组件渲染之间保持持久性数据时，便可以使用 useRef。

```ts
import { useRef } from 'react';
const refValue = useRef(initialValue);
refValue.current; // 访问ref的值 类似于vue的ref,Vue的ref是.value，其次就是vue的ref是响应式的，而react的ref不是响应式的
```

### 1.通过 Ref 操作 DOM 元素

**参数**

- initialValue：ref 对象的 current 属性的初始值。可以是任意类型的值。这个参数在首次渲染后被忽略。

**返回值**

- useRef 返回一个对象，对象的 current 属性指向传入的初始值。 `{current:xxxx}`

**注意**

- 改变 ref.current 属性时，React 不会重新渲染组件。React 不知道它何时会发生改变，因为 ref 是一个普通的 JavaScript 对象。
- 除了 **初始化** 外不要在渲染期间写入或者读取 ref.current，否则会使组件行为变得不可预测。

```tsx
import { useRef } from 'react';
function App() {
  //首先，声明一个 初始值 为 null 的 ref 对象
  let div = useRef(null);
  const heandleClick = () => {
    //当 React 创建 DOM 节点并将其渲染到屏幕时，React 将会把 DOM 节点设置为 ref 对象的 current 属性
    console.log(div.current);
  };
  return (
    <>
      {/*然后将 ref 对象作为 ref 属性传递给想要操作的 DOM 节点的 JSX*/}
      <div ref={div}>dom元素</div>
      <button onClick={heandleClick}>获取dom元素</button>
    </>
  );
}
export default App;
```

### 2.数据存储

我们实现一个保存 count 的新值和旧值的例子，但是在过程中我们发现一个问题，就是 num 的值一直为 0，这是为什么呢？

因为等`useState`的 `SetCount`执行之后，组件会重新 rerender,num 的值又被初始化为了 0，所以 num 的值一直为 0。

```ts
import React, { useLayoutEffect, useRef, useState } from 'react';

function App() {
  let num = 0;
  let [count, setCount] = useState(0);
  const handleClick = () => {
    setCount(count + 1);
    num = count;
  };
  return (
    <div>
      <button onClick={handleClick}>增加</button>
      <div>
        {count}:{num}
      </div>
    </div>
  );
}

export default App;
```

![useref1.jpg](https://p0-xtjj-private.juejin.cn/tos-cn-i-73owjymdk6/4eeadaf19b5b4ea580b9738cbba26496~tplv-73owjymdk6-jj-mark-v1:0:0:0:0:5o6Y6YeR5oqA5pyv56S-5Yy6IEAgVHJlZUZpc2g=:q75.awebp?policy=eyJ2bSI6MywidWlkIjoiMzQ3NDExMjQ3NjYzNjgyNCJ9&rk3s=f64ab15b&x-orig-authkey=f32326d3454f2ac7e96d3d06cdbb035152127018&x-orig-expires=1753946814&x-orig-sign=PLPIcqMFgf7yRF9F%2Fi94KaNSPu8%3D)

**如何修改？**

我们可以使用 useRef 来解决这个问题，因为 useRef 只会在初始化的时候执行一次，当组件 reRender 的时候，useRef 的值不会被重新初始化。

```tsx
import React, { useLayoutEffect, useRef, useState } from 'react';

function App() {
  let num = useRef(0); // 将num转换成useRef类型，useRef的值不会被重新初始化
  let [count, setCount] = useState(0);
  const handleClick = () => {
    setCount(count + 1);
    num.current = count;
  };
  return (
    <div>
      <button onClick={handleClick}>增加</button>
      <div>
        {count}:{num.current}
      </div>
    </div>
  );
}

export default App;
```

### 3.实际应用

我们实现一个计时器的例子，在点击开始计数的时候，计时器会每 300ms 执行一次，在点击结束计数的时候，计时器会被清除。

**问题**

我们发现，点击 end 的时候，计时器并没有被清除，这是为什么呢？

**原因**

这是因为组件一直在重新 ReRender,所以 timer 的值一直在被重新赋值为 null，导致无法清除计时器。

```tsx
import React, { useLayoutEffect, useRef, useState } from 'react';

function App() {
  console.log('render');
  let timer: NodeJS.Timeout | null = null;
  let [count, setCount] = useState(0);
  const handleClick = () => {
    timer = setInterval(() => {
      setCount((count) => count + 1);
    }, 300);
  };
  const handleEnd = () => {
    console.log(timer); //点击end的时候，计时器并没有被清除
    if (timer) {
      clearInterval(timer);
      timer = null;
    }
  };
  return (
    <div>
      <button onClick={handleClick}>开始计数</button>
      <button onClick={handleEnd}>结束计数</button>
      <div>{count}</div>
    </div>
  );
}

export default App;
```

**如何修改？**

我们可以使用 useRef 来解决这个问题，因为 useRef 的值不会因为组件的重新渲染而改变。

```tsx
import React, { useLayoutEffect, useRef, useState } from 'react';

function App() {
  console.log('render');
  let timer = useRef<null | NodeJS.Timeout>(null); // react里，定时器需要用uesRef定义
  let [count, setCount] = useState(0);
  const handleClick = () => {
    timer.current = setInterval(() => {
      setCount((count) => count + 1);
    }, 300);
  };
  const handleEnd = () => {
    if (timer.current) {
      clearInterval(timer.current);
      timer.current = null;
    }
  };
  return (
    <div>
      <button onClick={handleClick}>开始计数</button>
      <button onClick={handleEnd}>结束计数</button>
      <div>{count}</div>
    </div>
  );
}

export default App;
```

### 4.注意事项

1.  组件在重新渲染的时候，useRef 的值不会被重新初始化。
2.  改变 ref.current 属性时，React 不会重新渲染组件。React 不知道它何时会发生改变，因为 ref 是一个普通的 JavaScript 对象。
3.  useRef 的值不能作为 useEffect 等其他 hooks 的依赖项，因为它并不是一个响应式状态。
4.  useRef 不能直接获取子组件的实例，需要使用 forwardRef。

## 五、useImperativeHandle

可以在子组件内部暴露给父组件`句柄`，那么说人话就是，父组件可以调用子组件的方法，或者访问子组件的属性。 如果你学过 Vue，就类似于 Vue 的`defineExpose`。

### 1.用法

```ts
useImperativeHandle(
  ref,
  () => {
    return {
      // 暴露给父组件的方法或属性
    };
  },
  [deps]
);
```

### 2.参数

- ref: 父组件传递的 ref 对象
- createHandle: 返回值，返回一个对象，对象的属性就是子组件暴露给父组件的方法或属性
- deps?:\[可选] 依赖项，当依赖项发生变化时，会重新调用 createHandle 函数，类似于`useEffect`的依赖项

### 3.入门案例

> \[!NOTE]
>
> useRef 在`18`版本 和 `19`版本使用方式不一样

#### 18 版本

18 版本需要配合`forwardRef`一起使用

forwardRef 包装之后，会有两个参数，第一个参数是 props，第二个参数是 ref

我们使用的时候只需要将 ref 传递给`useImperativeHandle`即可，然后`useImperativeHandle` 就可以暴露子组件的方法或属性给父组件， 然后父组件就可以通过 ref 调用子组件的方法或访问子组件的属性

```tsx
import { useRef, forwardRef, useState, useImperativeHandle } from 'react';
interface ChildRef {
  name: string;
  count: number;
  addCount: () => void;
  subCount: () => void;
}

// React 18.2 版本使用，使用 forwardRef 可以将 ref 从父组件传递到子组件
const Child = forwardRef<ChildRef>((_, ref) => {
  const [count, setCount] = useState(0);
  /**
   * 使用 useImperativeHandle 钩子将自定义的属性和方法暴露给父组件的 ref
   * 第一个参数是传入的 ref，第二个参数是一个函数，返回一个对象，包含要暴露的属性和方法
   */
  useImperativeHandle(ref, () => {
    return {
      name: 'child',
      count,
      addCount: () => setCount(count + 1),
      subCount: () => setCount(count - 1),
    };
  });
  return (
    <div>
      <h3>我是子组件</h3>
      <div>count:{count}</div>
      <button onClick={() => setCount(count + 1)}>增加</button>
      <button onClick={() => setCount(count - 1)}>减少</button>
    </div>
  );
});

function App() {
  // 创建一个 ref，类型为 ChildRef，用于引用子组件
  const childRef = useRef<ChildRef>(null);
  const showRefInfo = () => {
    console.log(childRef.current);
  };
  return (
    <div>
      <h2>我是父组件</h2>
      <button onClick={showRefInfo}>获取子组件信息</button>
      {/* 点击按钮调用子组件的 addCount 方法，增加计数器的值 */}
      <button onClick={() => childRef.current?.addCount()}>操作子组件+1</button>
      {/* 点击按钮调用子组件的 subCount 方法，减少计数器的值 */}
      <button onClick={() => childRef.current?.subCount()}>操作子组件-1</button>
      <hr />
      {/* 将 ref 传递给子组件 */}
      <Child ref={childRef}></Child>
    </div>
  );
}

export default App;
```

#### 19 版本

1.  19 版本不需要配合`forwardRef`一起使用，直接使用即可，他会把 Ref 跟 props 放到一起，你会发现变得更加简单了
2.  19 版本 useRef 的参数改为必须传入一个参数例如`useRef<ChildRef>(null)`

```tsx
import { useRef, useState, useImperativeHandle } from 'react';
interface ChildRef {
  name: string;
  count: number;
  addCount: () => void;
  subCount: () => void;
}

//19版本不需要配合`forwardRef`一起使用，直接使用即可，他会把Ref跟props放到一起
// const Child = forwardRef<ChildRef>((_, ref) => {
const Child = ({ ref }: { ref: React.Ref<ChildRef> }) => {
  const [count, setCount] = useState(0);
  useImperativeHandle(ref, () => {
    return {
      name: 'child',
      count,
      addCount: () => setCount(count + 1),
      subCount: () => setCount(count - 1),
    };
  });
  return (
    <div>
      <h3>我是子组件</h3>
      <div>count:{count}</div>
      <button onClick={() => setCount(count + 1)}>增加</button>
      <button onClick={() => setCount(count - 1)}>减少</button>
    </div>
  );
};

function App() {
  const childRef = useRef<ChildRef>(null);
  const showRefInfo = () => {
    console.log(childRef.current);
  };
  return (
    <div>
      <h2>我是父组件</h2>
      <button onClick={showRefInfo}>获取子组件信息</button>
      <button onClick={() => childRef.current?.addCount()}>操作子组件+1</button>
      <button onClick={() => childRef.current?.subCount()}>操作子组件-1</button>
      <hr />
      <Child ref={childRef}></Child>
    </div>
  );
}

export default App;
```

### 4.执行时机

1.  如果不传入第三个参数，那么`useImperativeHandle`会在组件挂载时执行一次，然后状态更新时，都会执行一次

```tsx
useImperativeHandle(ref, () => {});
```

1.  如果传入第三个参数，并且是一个空数组，那么`useImperativeHandle`会在组件挂载时执行一次，然后状态更新时，不会执行

```tsx
useImperativeHandle(ref, () => {}, []);
```

1.  如果传入第三个参数，并且有值，那么`useImperativeHandle`会在组件挂载时执行一次，然后会根据依赖项的变化，决定是否重新执行

```tsx
const [count, setCount] = useState(0);
useImperativeHandle(ref, () => {}, [count]);
```

### 5.实际案例

例如，我们封装了一个表单组件，提供了两个方法：校验和重置。使用`useImperativeHandle`可以将这些方法暴露给父组件，父组件便可以通过`ref`调用子组件的方法。

```tsx
interface ChildRef {
  name: string;
  validate: () => string | true;
  reset: () => void;
}

const Child = ({ ref }: { ref: React.Ref<ChildRef> }) => {
  const [form, setForm] = useState({
    username: '',
    password: '',
    email: '',
  });
  const validate = () => {
    if (!form.username) {
      return '用户名不能为空';
    }
    if (!form.password) {
      return '密码不能为空';
    }
    if (!form.email) {
      return '邮箱不能为空';
    }
    return true;
  };
  const reset = () => {
    setForm({
      username: '',
      password: '',
      email: '',
    });
  };
  useImperativeHandle(ref, () => {
    return {
      name: 'child',
      validate: validate,
      reset: reset,
    };
  });
  return (
    <div style={{ marginTop: '20px' }}>
      <h3>我是表单组件</h3>
      <input
        value={form.username}
        onChange={(e) => setForm({ ...form, username: e.target.value })}
        placeholder="请输入用户名"
        type="text"
      />
      <input
        value={form.password}
        onChange={(e) => setForm({ ...form, password: e.target.value })}
        placeholder="请输入密码"
        type="text"
      />
      <input
        value={form.email}
        onChange={(e) => setForm({ ...form, email: e.target.value })}
        placeholder="请输入邮箱"
        type="text"
      />
    </div>
  );
};

function App() {
  const childRef = useRef<ChildRef>(null);
  const showRefInfo = () => {
    console.log(childRef.current);
  };
  const submit = () => {
    const res = childRef.current?.validate();
    console.log(res);
  };
  return (
    <div>
      <h2>我是父组件</h2>
      <button onClick={showRefInfo}>获取子组件信息</button>
      <button onClick={() => submit()}>校验子组件</button>
      <button onClick={() => childRef.current?.reset()}>重置</button>
      <hr />
      <Child ref={childRef}></Child>
    </div>
  );
}

export default App;
```

## 六、useContext

useContext 提供了一个无需为每层组件手动添加 props，就能在组件树间进行数据传递的方法。设计的目的就是解决组件树间数据传递的问题

### 1.用法

```tsx
const MyThemeContext = React.createContext({ theme: 'light' }); // 创建一个上下文
function App() {
  return (
    <MyThemeContext.Provider value={{ theme: 'light' }}>
      <MyComponent />
    </MyThemeContext.Provider>
  );
}
function MyComponent() {
  const themeContext = useContext(MyThemeContext); // 使用上下文
  return <div>{themeContext.theme}</div>;
}
```

### 2.参数

入参

- context：是 createContext 创建出来的对象，他不保持信息，他是信息的载体。声明了可以从组件获取或者给组件提供信息。

返回值

- 返回传递的 Context 的值，并且是只读的。如果 context 发生变化，React 会自动重新渲染读取 context 的组件

### 3.基本用法

- 18 版本演示

首先我们先通过 createContext 创建一个上下文，然后通过 createContext 创建的组件包裹组件，传递值。

被包裹的组件，在任何一个层级都是可以获取上下文的值，那么如何使用呢？

使用的方式就是通过 useContext 这个 hook，然后传入上下文，就可以获取到上下文的值。

```tsx
import React, { useContext, useState } from 'react';
// 创建上下文
const ThemeContext = React.createContext<ThemeContextType>({} as ThemeContextType);
// 定义上下文类型
interface ThemeContextType {
  theme: string;
  setTheme: (theme: string) => void;
}

const Child = () => {
  const themeContext = useContext(ThemeContext); //获取上下文对象
  const styles = {
    backgroundColor: themeContext.theme === 'light' ? 'white' : 'black',
    border: '1px solid red',
    width: 100 + 'px',
    height: 100 + 'px',
    color: themeContext.theme === 'light' ? 'black' : 'white',
  };
  return (
    <div style={styles}>
      <h2>我是子组件</h2>
      <button onClick={() => themeContext.setTheme(themeContext.theme === 'light' ? 'dark' : 'light')}>
        子组件修改主题色：
      </button>
      {/* 子组件调用父组件的方法 */}
    </div>
  );
};

const Parent = () => {
  // 获取上下文
  const themeContext = useContext(ThemeContext);
  const styles = {
    backgroundColor: themeContext.theme === 'light' ? 'white' : 'black',
    border: '1px solid red',
    width: 100 + 'px',
    height: 100 + 'px',
    color: themeContext.theme === 'light' ? 'black' : 'white',
  };
  return (
    <div>
      <div style={styles}>Parent</div>
      <Child />
    </div>
  );
};

function App() {
  const [theme, setTheme] = useState('light');
  return (
    <div>
      <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>切换主题</button>
      <ThemeContext.Provider value={{ theme, setTheme }}>
        <Parent />
      </ThemeContext.Provider>
    </div>
  );
}

export default App;
```

- 19 版本演示

> 其实 19 版本和 18 版本是差不多的，只是 19 版本更加简单了，不需要再使用 Provider 包裹，直接使用即可。

```tsx
import React, { useContext, useState } from 'react';
const ThemeContext = React.createContext<ThemeContextType>({} as ThemeContextType);
interface ThemeContextType {
   theme: string;
   setTheme: (theme: string) => void;
}

const Child = () => {
  const themeContext = useContext(ThemeContext); //获取上下文对象
  const styles = {
    backgroundColor: themeContext.theme === "light" ? "white" : "black",
    border: "1px solid red",
    width: 100 + "px",
    height: 100 + "px",
    color: themeContext.theme === "light" ? "black" : "white",
  };
  return (
    <div style={styles}>
      <h2>我是子组件</h2>
      <button
        onClick={() =>
          themeContext.setTheme(
            themeContext.theme === "light" ? "dark" : "light"
          )
        }
      >
        子组件修改主题色：
      </button>
       {/* 子组件调用父组件的方法 */}
    </div>
  );
};

const Parent = () => {
   const themeContext = useContext(ThemeContext);  //获取上下文对象
   const styles = {
      backgroundColor: themeContext.theme === 'light' ? 'white' : 'black',
      border: '1px solid red',
      width: 100 + 'px',
      height: 100 + 'px',
      color: themeContext.theme === 'light' ? 'black' : 'white'
   }
   return <div>
      <div style={styles}>
         Parent
      </div>
      <Child />
   </div>
}
function App() {
   const [theme, setTheme] = useState('light');
   return (
      <div>
         <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>切换主题</button>
         <ThemeContext value={{ theme, setTheme }}>
            <Parent />
         <ThemeContext>
      </div >
   );
}

export default App;
```

### 4.注意事项

- 使用 ThemeContext 时，传递的 key 必须为`value`

```tsx
// 🚩 不起作用：prop 应该是“value”
<ThemeContext theme={theme}>
   <Button />
</ThemeContext>
// ✅ 传递 value 作为 prop
<ThemeContext value={theme}>
   <Button />
</ThemeContext>
```

- 可以使用多个 Context

> 如果使用多个 Context，那么需要注意，如果使用的值是相同的，那么会覆盖。

```tsx
const ThemeContext = React.createContext({ theme: 'light' });

function App() {
  return (
    <ThemeContext value={{ theme: 'light' }}>
      <ThemeContext value={{ theme: 'dark' }}>
        {' '}
        {/* 覆盖了上面的值 */}
        <Parent />
      </ThemeContext>
    </ThemeContext>
  );
}
```

> \[!CAUTION]
>
> 本文内容参考[小满大佬](https://juejin.cn/post/7410313831271776256)
