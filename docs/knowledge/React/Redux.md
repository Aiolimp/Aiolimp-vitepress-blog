---
title: Redux
theme: solarized-dark
---

# Redux 基础知识整理

## 一、**Redux 是什么？**

- Redux 是一个**状态管理库**。

- 主要用于**管理复杂应用中多个组件共享的状态**。

- 核心思想是：

  👉 所有的状态被放在一个**统一的 Store**中，任何组件都可以访问它，而不是让状态分散在各组件内部。

  中文文档：https://www.redux.org.cn/

## 二、**核心概念**

| **概念**     | **解释**                                                       |
| ------------ | -------------------------------------------------------------- |
| **Store**    | 统一保存应用状态的地方。整个 App 有且只有一个 Store。          |
| **State**    | Store 里存的数据。是一个**只读的对象树**。                     |
| **Action**   | 一个描述**“要做什么”**的普通对象，必须有 type 字段。           |
| **Reducer**  | 一个纯函数，接收当前的 state 和 action，返回新的 state。       |
| **Dispatch** | 触发 action，告诉 Store：“我要改变状态了”。                    |
| **Selector** | 用来从 Store 中**读取/选择特定数据**的方法。（如 useSelector） |

## 三、**Redux 工作流程（Redux Flow）**

⚡ **从 dispatch 到 reducer 到 state 再到 UI 更新**，整体流程：

```tex
UI界面 -> 派发 dispatch(action) -> reducer处理 -> 生成新的state -> 通知UI更新
```

详细拆解：

1. **用户操作**（如点击按钮）
2. **组件调用 dispatch(action)**，派发一个 action（action 是一个简单的 JS 对象）
3. **Redux Store** 收到 action 后，调用对应的 **reducer**
4. **Reducer** 根据 action 的 type 和 payload，返回一个**新的 state**
5. **Store 更新自己的 state**，并通知所有**订阅了的组件**
6. **组件使用 useSelector**，重新拿到最新的 state，完成 UI 更新

## 四、**Redux Toolkit**

**Redux Toolkit** 是官方推荐的编写 Redux 逻辑的方法。`@reduxjs/toolkit` 包封装了核心的 `redux` 包，包含我们认为构建 Redux 应用所必须的 API 方法和常用依赖。 Redux Toolkit 集成了我们建议的最佳实践，简化了大部分 Redux 任务，阻止了常见错误，并让编写 Redux 应用程序变得更容易。

Redux Toolkit 文档：https://redux-toolkit.js.org/

### 1.configureStore

创建 Redux Store 的简化方法，自动集成了 Redux DevTools 和一些默认中间件。

- 自动合并多个 slice reducer
- 默认集成 redux-thunk 中间件

```ts
import { configureStore } from '@reduxjs/toolkit';
import counterReducer from './features/counterSlice';
import userReducer from './features/userSlice';

export const store = configureStore({
  reducer: {
    counter: counterReducer,
    user: userReducer,
  },
});

// 推导 RootState 和 AppDispatch 类型
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
```

### 2.createSlice

简洁地定义 state、reducers 和自动生成的 actions。

- 自动生成 action creators 和 action types
- 支持 immer，直接修改 state 看起来是“可变的”，但其实是不可变更新

```ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface CounterState {
  value: number;
}

const initialState: CounterState = { value: 0 };

const counterSlice = createSlice({
  name: 'counter',
  initialState,
  reducers: {
    increment: (state) => {
      state.value += 1;
    },
    decrement: (state) => {
      state.value -= 1;
    },
    addByAmount: (state, action: PayloadAction<number>) => {
      state.value += action.payload;
    },
  },
});

export const { increment, decrement, addByAmount } = counterSlice.actions;
export default counterSlice.reducer;
```

## 五、**React-redux**

react-redux 是 React 官方推荐的 Redux 绑定库，它的作用是 **把 Redux 状态管理系统连接到 React 组件中**，让你可以在 React 组件里轻松读取 store 和触发 action。

### 1.**Provider**：连接 Redux Store 与 React

Provider 是 react-redux 提供的一个组件，作用是：**将 Redux 的 store 传入 React 应用的上下文中**，这样你就可以在任何子组件中使用 **useSelector** 和 **useDispatch** 访问 **state** 和 **dispatch actions**。

通常在项目的入口文件（比如 main.jsx 或 index.tsx）中使用它：

```ts
import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import App from './App';
import store from './store'; // 你用 configureStore 创建的 store

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>
);
```

### 2.**useSelector**：从 Redux Store 中读取状态

useSelector 是一个 hook，用于**读取 Redux store 中的某一部分 state**。

```ts
import { useSelector } from 'react-redux';
import { RootState } from './store';

const Counter = () => {
  const count = useSelector((state: RootState) => state.counter.value);
  return <div>Count: {count}</div>;
};
```

**特点：**

- 自动订阅 state 变化。
- 返回值发生变化才会触发组件重渲染。
- 类型安全（配合 TypeScript 使用 RootState 类型）。
- 只能在 Provider 包裹的组件树中使用。

### 3.useDispatch：触发 Redux Action

**useDispatch** 是一个 hook，用来获取 Redux 中的 **dispatch 函数**，然后通过它**分发一个 action** 或 **异步的 thunk**。

**使用方式（同步和异步都行）**

```ts
import { useDispatch } from 'react-redux';
import { increment } from './counterSlice';

const Counter = () => {
  const dispatch = useDispatch();

  return <button onClick={() => dispatch(increment())}>+1</button>;
};
```

**结合异步 createAsyncThunk**

```ts
import { fetchUserById } from './userSlice';

const UserLoader = () => {
  const dispatch = useDispatch();
  const loadUser = () => {
    dispatch(fetchUserById(1)); // dispatch 异步 action
  };
  return <button onClick={loadUser}>加载用户</button>;
};
```

## 六、**简单代码示例（最新 Redux Toolkit 写法）**

🔵 **Counter 示例**

**counterSlice.js**

```js
import { createSlice } from '@reduxjs/toolkit';
// createSlice 生成 actions 和 reducer
const counterSlice = createSlice({
  name: 'counter',
  initialState: { value: 0 },
  reducers: {
    increment(state) {
      state.value += 1;
    },
    decrement(state) {
      state.value -= 1;
    },
  },
});
export const { increment, decrement } = counterSlice.actions;
export default counterSlice.reducer;
```

**store.js**

```jsx
import { configureStore } from '@reduxjs/toolkit';
import counterReducer from './counterSlice';
// configureStore 注册 reducer
export const store = configureStore({
  reducer: {
    counter: counterReducer,
  },
});
```

**App.jsx**

```jsx
import { useSelector, useDispatch } from 'react-redux';
import { increment, decrement } from './counterSlice';

function App() {
  // 读取数据
  const count = useSelector((state) => state.counter.value);
  // 发送动作
  const dispatch = useDispatch();

  return (
    <div>
      <h1>{count}</h1>
      <button onClick={() => dispatch(increment())}>加1</button>
      <button onClick={() => dispatch(decrement())}>减1</button>
    </div>
  );
}

export default App;
```

### 注意点

- Reducer 必须是**纯函数**：不能直接修改 state（但用 Redux Toolkit 的 immer 可以看起来“直接修改”，其实是拷贝了）。
- Action 是描述事件，不是执行逻辑。
- Redux 只管理**状态**，**副作用（异步）**需要结合 redux-thunk 或 redux-saga（不过 Redux Toolkit 已经内置 thunk 支持了）。
