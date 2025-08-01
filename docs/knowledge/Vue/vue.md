---
title: Vue备忘清单
theme: solarized-dark
---

# Vue3 备忘清单

## 入门

Vue 是一套用于构建用户界面的渐进式框架

- [Vue 3.x 官方文档](https://cn.vuejs.org/)
- [Vue Router 4.x 官方文档](https://router.vuejs.org/zh/)

## 模板语法

- **文本插值**

```html
<span>Message: {{ msg }}</span>
```

使用的是 `Mustache` 语法 (即双大括号)，每次 `msg` 属性更改时它也会同步更新

- **原始 HTML**

```html
<p>Using v-html directive: <span v-html="rawHtml"></span></p>
```

双大括号`{{}}`会将数据解释为纯文本，使用 `v-html` 指令，将插入 HTML

- **Attribute 绑定**

```html
<div v-bind:id="dynamicId"></div>
```

简写

```html
<div :id="dynamicId"></div>
```

布尔型 Attribute

```html
<button :disabled="isButtonDisabled">Button</button>
```

- **动态绑定多个值**

通过不带参数的 `v-bind`，你可以将它们绑定到单个元素上

```html
<script setup>
  import comp from './Comp.vue';
  import { ref } from 'vue';
  const a = ref('hello');
  const b = ref('world');
</script>

<template>
  <comp v-bind="{a, b}"></comp>
</template>
```

如果你是使用的 `setup` 语法糖。需要使用 `defineprops` 声名（可以直接使用`a`/`b`）

```js
const props = defineProps({
  a: String,
  b: String,
});
```

- **使用 JavaScript 表达式**

```html
{{ number + 1 }} {{ ok ? 'YES' : 'NO' }} {{ message.split('').reverse().join('') }}

<div :id="`list-${id}`"></div>
```

**仅支持表达式(例子都是无效)**

```html
<!-- 这是一个语句，而非表达式 -->
{{ var a = 1 }}
<!-- 条件控制也不支持，请使用三元表达式 -->
{{ if (ok) { return message } }}
```

**调用函数**

```html
<span :title="toTitleDate(date)"> {{ formatDate(date) }} </span>
```

- **指令 Directives**

```html
<p v-if="seen">Now you see me</p>
```

- **绑定事件**

```html
<a v-on:click="doSomething"> ... </a>
<!-- 简写 -->
<a @click="doSomething"> ... </a>
```

- **动态参数**

```html
<a v-bind:[attributeName]="url"> ... </a>
<!-- 简写 -->
<a :[attributeName]="url"> ... </a>
```

这里的 `attributeName` 会作为一个 JS 表达式被动态执行

- **动态的事件名称**

```html
<a v-on:[eventName]="doSomething"> ... </a>
<!-- 简写 -->
<a @[eventName]="doSomething"></a>
```

- **修饰符 Modifiers**

```html
<form @submit.prevent="onSubmit">...</form>
```

`.prevent` 修饰符会告知 `v-on` 指令对触发的事件调用 `event.preventDefault()`

- **指令语法**

```bash
v-on:submit.prevent="onSubmit"
──┬─ ─┬──── ─┬─────  ─┬──────
  ┆   ┆      ┆        ╰─ Value 解释为JS表达式
  ┆   ┆      ╰─ Modifiers 由前导点表示
  ┆   ╰─ Argument 跟随冒号或速记符号
  ╰─ Name 以 v- 开头使用速记时可以省略
```

## 响应式基础

### 声明响应式状态
