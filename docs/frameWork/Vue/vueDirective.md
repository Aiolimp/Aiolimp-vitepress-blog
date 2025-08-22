---
title: Vue自定义指令
theme: solarized-dark
---

# Vue 自定义指令

`Vue`内置里一系列指令，除此之外还可以自定义指令。

**一个自定义指令由一个包含类似组件生命周期钩子的对象来定义**，钩子函数会接收到指令所绑定元素作为其参数。

在模版中直接使用

```vue
<script setup>
// 在模板中启用 v-focus
const vFocus = {
  mounted: (el) => el.focus(),
};
</script>

<template>
  <input v-focus />
</template>
```

将一个自定义指令全局注册

```ts
// main.ts
const app = createApp({});

// 使 v-focus 在所有组件中都可用
app.directive('focus', {
  /* ... */
});
```

## 指令钩子

```ts
const myDirective = {
  // 在绑定元素的 attribute 前
  // 或事件监听器应用前调用
  created(el, binding, vnode, prevVnode) {
    // 下面会介绍各个参数的细节
  },
  // 在元素被插入到 DOM 前调用
  beforeMount(el, binding, vnode, prevVnode) {},
  // 在绑定元素的父组件
  // 及他自己的所有子节点都挂载完成后调用
  mounted(el, binding, vnode, prevVnode) {},
  // 绑定元素的父组件更新前调用
  beforeUpdate(el, binding, vnode, prevVnode) {},
  // 在绑定元素的父组件
  // 及他自己的所有子节点都更新后调用
  updated(el, binding, vnode, prevVnode) {},
  // 绑定元素的父组件卸载前调用
  beforeUnmount(el, binding, vnode, prevVnode) {},
  // 绑定元素的父组件卸载后调用
  unmounted(el, binding, vnode, prevVnode) {},
};
```

## 钩子的参数

- `el`：指令绑定到的元素。这可以用于直接操作 `DOM`。
- `binding`：一个对象，包含以下属性。
  - `value`：传递给指令的值。例如在`v-my-directive="1 + 1"`中，值是 2。
  - `oldValue`：之前的值，仅在 `beforeUpdate` 和 `updated` 中可用。无论值是否更改，它都可用。
  - `arg`：传递给指令的参数 (如果有的话)。例如在`v-my-directive:foo`中，参数是 "foo"。
  - `modifiers`：一个包含修饰符的对象 (如果有的话)。例如在` v-my-directive.foo.bar` 中，修饰符对象是` { foo: true, bar: true }`。
  - `instance`：使用该指令的组件实例。
  - `dir`：指令的定义对象。
- `vnode`：代表绑定元素的底层 `VNode`。
- `prevNode`：之前的渲染中代表指令所绑定元素的 `VNode`。仅在 `beforeUpdate` 和 `updated` 钩子中可用。

举例来说，像下面这样使用指令：

```html
<div v-example:foo.bar="baz"></div>
```

`binding` 参数会是一个这样的对象：

```js
{
  arg: 'foo',
  modifiers: { bar: true },
  value: /* `baz` 的值 */,
  oldValue: /* 上一次更新时 `baz` 的值 */
}
```

## 函数简写

如果指令只需要在 `mounted` 和 `updated` 上实现，可以通过函数简写的形式。

```html
<script setup>
  // 在模板中启用 v-focus
  const vFocus = (el) => {
    el.focus();
  };
</script>

<template>
  <input v-focus />
</template>
```

## 对象字面量

如果指令需要多个值，在模版上使用时可以传递一个对象，指令在接受的时候可以通过`bingding.value.[attr]`方式访问。

```html
<script setup>
  // 在模板中启用 v-focus
  const vDemo = (el, binding) => {
    console.log(binding.value.color); // => "white"
    console.log(binding.value.text); // => "hello!"
  };
</script>

<template>
  <div v-demo="{ color: 'white', text: 'hello!' }"></div>
</template>
```

## 为 Directive 标注类型

如果为`binding.value`定义类型呢?也就是指令的参数。

有两种方式，一种通过`Directive`传递泛型，还可以通过`DirectiveBinding`指定`bingding.value`类型

```ts
import { ref } from 'vue';
import type { Directive, DirectiveBinding } from 'vue';

let value = ref<string>('');

type Move = {
  color: string;
  text: string;
};

const vMove = (el: HTMLElement, binding: DirectiveBinding<Move>) => {
  console.log('binding', binding.value.color);
};

const vHasShow: Directive<HTMLElement, Move> = (el, binding) => {
  console.log('binding', binding.value.text);
};
```
