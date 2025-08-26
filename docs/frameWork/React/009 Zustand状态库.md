---
title: 009 Zustand状态库
theme: solarized-dark
---

# Zustand 状态库

## 一、Zustand 状态库简介

Zustand 是一个由 React Three Fiber 团队维护的轻量级、无依赖的 React 状态管理库。

它的设计理念是：**简单、灵活、性能好**。你可以在函数组件外创建全局 store，然后在组件中像使用 hook 一样访问和订阅状态。

Zustand 支持：

- 状态自动响应（基于浅比较）
- 不侵入组件结构（不需要 Provider 包裹）
- 支持中间件扩展（如 devtools、persist、immer）
- 支持异步逻辑（如直接在 store 里写 async 函数）
- 精细订阅（避免组件不必要重渲）

它非常适合用来替代复杂的 Redux、Context + useReducer 组合，尤其在中小型应用或组件库中非常高效。

zustand 官网地址：https://zustand.docs.pmnd.rs/getting-started/comparison

zustand 中文网：https://awesomedevin.github.io/zustand-vue/docs/introduce/start/zustand

## 二、Zustand 的优势

**轻量易用**

Zustand 的核心不到 1KB，没有任何依赖，API 简洁直观，几分钟即可上手，无需配置 reducer、action 等样板代码。

```ts
const useStore = create((set) => ({ count: 0, inc: () => set((s) => ({ count: s.count + 1 })) }));
```

**无需 Provider**

Zustand 的 store 是模块级的，不需要像 Redux 那样使用**Provider**，避免了组件树污染和包裹层层嵌套的问题。

```ts
// 直接在组件中调用
const count = useStore((s) => s.count);
```

**支持精细订阅（Selector）**

Zustand 默认只会在**订阅的那一部分状态变化时**才重新渲染组件，性能优于 Context。

```ts
const count = useStore((s) => s.count); // 只监听 count，其他状态变化不会触发重渲
```

**原生支持异步逻辑**

你可以在 store 中直接使用 async/await，无需额外中间件或 thunk，逻辑更聚合、更自然。

```ts
fetchData: async () => {
  set({ loading: true });
  const res = await fetch(...);
  set({ data: res, loading: false });
}
```

**插件生态丰富**

官方提供 middleware 支持，如：

- devtools: 调试状态变化
- persist: 本地持久化
- immer: 修改状态更方便
- subscribeWithSelector: 精细订阅监听

**良好的 TypeScript 支持**

Zustand 的 create() 方法可以完全类型推导出状态结构和操作方法，配合 TS 使用非常顺滑。

## 三、Zustand 基本使用

### 1. 安装 Zustand

```sh
npm install zustand
yarn add zustand
```

### 2.快速上手

**Counter.ts**:定义 useCounterStore

```ts
import { create } from 'zustand';
interface CounterState {
  count: number;
  increment: () => void;
  decrement: () => void;
  reset: () => void;
}
// 定义了一个 CounterState 接口：我们要在 store 里保存的 count 和一些操作它的方法。
export const useCounterStore = create<CounterState>((set) => ({
  // set 是 Zustand 提供的修改函数，用于更新状态
  // 每个方法都通过 set 修改状态（你不需要写 dispatch、action type）
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
  decrement: () => set((state) => ({ count: state.count - 1 })),
  reset: () => set({ count: 0 }),
}));
```

这个 useCounterStore 就是一个 **Hook**，你在组件中可以像 useState 一样直接使用。

**App.tsx:**

```tsx
import React from 'react';
import { useCounterStore } from './store/useCounterStore';

const App: React.FC = () => {
  // 从计数器store解构需要的状态和方法
  const { count, increment, decrement, reset } = useCounterStore();

  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h1>Zustand Counter</h1>
      <h2>{count}</h2>
      <div>
        <button onClick={increment}>➕ Increment</button>
        <button onClick={decrement}>➖ Decrement</button>
        <button onClick={reset}>🔄 Reset</button>
      </div>
    </div>
  );
};

export default App;
```

- 每个组件调用 useCounterStore() 会自动订阅状态变化
- 每当 count 变化，组件就会自动重新渲染（无手动更新逻辑）

- 直接调用状态中的方法来更新全局状态，不需要自己写 reducer、dispatch

### 3.Zustand 中存储和操作一个数组

**todoStore.ts 定义一个 Todo 类型的数组状态**

```ts
import { create } from 'zustand';

// 定义单个Todo项的接口
interface Todo {
  id: number; // 唯一标识符
  title: string; // 待办事项标题
  completed: boolean; // 完成状态
}

// 定义Todo状态管理的接口
interface TodoState {
  todos: Todo[]; // Todo列表
  addTodo: (title: string) => void; // 添加Todo方法
  toggleTodo: (id: number) => void; // 切换完成状态方法
  removeTodo: (id: number) => void; // 删除Todo方法
}

// 创建并导出Todo状态管理store
export const useTodoStore = create<TodoState>((set, get) => ({
  todos: [], // 初始化为空数组

  // 添加新的Todo项
  addTodo: (title) => {
    set((state) => ({
      todos: [
        ...state.todos,
        {
          id: Date.now(), // 使用时间戳作为ID
          title,
          completed: false, // 默认未完成
        },
      ],
    }));
    console.log(get().todos);
  },

  // 切换指定Todo项的完成状态
  toggleTodo: (id) =>
    set((state) => ({
      todos: state.todos.map((todo) =>
        todo.id === id
          ? { ...todo, completed: !todo.completed } // 反转完成状态
          : todo
      ),
    })),

  // 删除指定Todo项
  removeTodo: (id) =>
    set((state) => ({
      todos: state.todos.filter((todo) => todo.id !== id), // 过滤掉指定ID的项
    })),
}));
```

**在组件中使用这个数组状态**

```tsx
// App.tsx
import React, { useState } from 'react';
import { useTodoStore } from './store/todoStore';

const App = () => {
  // 从待办事项store解构需要的状态和方法
  const { todos, addTodo, toggleTodo, removeTodo } = useTodoStore();
  const [title, setTitle] = useState('');

  return (
    <div>
      <h2>📋 Todo List</h2>
      <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Add a task" />
      <button
        onClick={() => {
          addTodo(title);
          setTitle('');
        }}
      >
        Add
      </button>

      <ul>
        {todos.map((todo) => (
          <li key={todo.id}>
            <span
              onClick={() => toggleTodo(todo.id)}
              style={{ textDecoration: todo.completed ? 'line-through' : 'none', cursor: 'pointer' }}
            >
              {todo.title}
            </span>
            <button onClick={() => removeTodo(todo.id)}>❌</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default App;
```

### 4.访问、修改存储状态 get、set、getState、setState

```ts
import { create } from 'zustand';

interface BearState {
  bears: number;
  increase: (by: number) => void;
  reset: () => void;
}

// 这是 Zustand 创建 store 的标准方式
export const useBearStore = create<BearState>((set, get) => ({
  bears: 0,

  // 使用 set 修改状态
  increase: (by) => set({ bears: get().bears + by }),

  // 使用 set 重置状态
  reset: () => set({ bears: 0 }),
}));
```

- set：用于更新状态（相当于 React 的 setState）
- get：获取当前最新状态（注意：不是 React 组件渲染中的响应式值）

**使用 getState 和 setState**

```ts
// 通过getState()获取状态
const getCountState = () => {
  console.log(useCounterStore.getState().count);
};

// 通过setState()修改状态
const setCountState = () => {
  useCounterStore.setState({ count: 9 });
};
```

| **方法**   | **用途**                 | **示例**                        |
| ---------- | ------------------------ | ------------------------------- |
| get()      | 在 create 函数中读取状态 | get().count                     |
| set()      | 在 create 函数中修改状态 | set({ count: get().count + 1 }) |
| getState() | 在组件外获取状态         | store.getState().xxx            |
| setState() | 在组件外设置状态         | store.setState({ xxx: 123 })    |

### 5.subscribe 监听状态变更

在 Zustand 中，subscribe 方法允许你**手动监听状态的变化**，非常适合在组件外部（或不适合使用 React Hook 的地方）监听 store 的更新。类似于 Vue 的 computed。

```ts
import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
interface CounterState {
  count: number;
  increment: () => void;
  decrement: () => void;
  reset: () => void;
}

// 使用 subscribeWithSelector 中间件创建 Zustand store
export const useCounterStore = create<CounterState>()(
  subscribeWithSelector((set) => ({
    count: 0,
    increment: () => set((state) => ({ count: state.count + 1 })),
    decrement: () => set((state) => ({ count: state.count - 1 })),
    reset: () => set({ count: 0 }),
  }))
);
```

```ts
// 订阅整个 state 的变化，每次任意 state 更新，subscribe 都会调用回调函数。
useCounterStore.subscribe((state) => {
  console.log('Count changed:', state.count);
});

// 订阅特定的 state 属性的变化，只有当 count 属性更新时，subscribe 才会调用回调函数。
useCounterStore.subscribe(
  (state) => state.count,
  (newCount: number, oldCount: number) => {
    console.log('新值:', newCount);
    console.log('旧值:', oldCount);
  },
  {
    // equalityFn（默认使用 Object.is），用于判断值是否真的“变了”。如果返回 true，认为没变，不会触发监听回调。
    equalityFn: (a, b) => {
      // 当旧值是偶数、但新值是非偶数时，返回 false，允许触发，其他情况都返回 true，不触发
      return !(b % 2 === 0 && a % 2 !== 0);
    },
    // 订阅创建时立即执行一次 listenerFn，不管 state 有没有发生变化。
    // 这在组件初始化时获取某个状态值的“副作用处理”特别有用（例如首次渲染后上报一次当前值）。
    fireImmediately: true,
  }
);
```

### 6.异步操作

如果你需要在 Zustand 的状态中处理异步操作，你可以在你的状态对象中添加一个异步函数。这个函数可以使用 `set` 函数来更新状态。

User.ts

```ts
import { create } from 'zustand';

interface UserState {
  data: string | null;
  loading: boolean;
  error: string | null;
  fetchData: () => Promise<void>;
}

export const useUserStore = create<UserState>((set) => ({
  data: null,
  loading: false,
  error: null,

  fetchData: async () => {
    set({ loading: true, error: null });

    try {
      // 模拟异步请求（如：fetch('https://api.example.com/user')）
      const response = await new Promise<string>((resolve) =>
        setTimeout(() => resolve('我是来自服务器的数据！'), 1500)
      );

      set({ data: response, loading: false });
    } catch (e) {
      set({ error: '请求失败', loading: false });
    }
  },
}));
```

```tsx
import React from 'react';
import { useUserStore } from './store/user';

const App: React.FC = () => {
  const { data, loading, error, fetchData } = useUserStore();

  return (
    <div style={{ textAlign: 'center', marginTop: 50 }}>
      <h1>Zustand 异步请求示例</h1>
      <button onClick={fetchData} disabled={loading}>
        {loading ? '加载中...' : '获取数据'}
      </button>

      {data && <p>✅ 数据：{data}</p>}
      {error && <p style={{ color: 'red' }}>❌ 错误：{error}</p>}
    </div>
  );
};

export default App;
```
