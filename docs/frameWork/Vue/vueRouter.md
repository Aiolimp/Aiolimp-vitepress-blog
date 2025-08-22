---
title: Vue Router
theme: solarized-dark
---

# Vue Router

## 安装使用

### 1.初始化本地项目

```bash
npm create vite@latest
```

用`Vite`创建的`Vue3`项目内容是空的，没有`router`、`pinia`等其他插件，需要自己集成。

```bash
npm install vue-router@4
```

Vue3 安装的路由版本为`router4`

Vue2 安装的路由版本为`router3`

在`src`目录下新建`router`文件，然后在文件夹下新建`index.ts`路由文件。

```ts
import { createRouter, createWebHistory } from 'vue-router'
import Home  from ('../Home.vue')
import Login from ('../Login.vue')

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home
    },
    {
      path: '/login',
      name: 'login',
      component: Login
    }
  ]
})

export default router
```

在`main.ts`中挂载到`Vue`实例

```ts
import { createApp } from 'vue';
import './style.css';
import App from './App.vue';
import router from './router/index';

createApp(App).use(router).mount('#app');
```

### 2.路由跳转

使用 `router-link` 组件进行导航，通过`to`来指定跳转的链接，可以在不刷新页面的情况下更改`URL`，从而跳转到其他页面。

而`router-view`将显示与 `URL` 对应的组件

```html
<script setup lang="ts">
  import { RouterLink, RouterView } from 'vue-router';
</script>
<div id="app">
  <router-link to="/">Go to Home</router-link>
  <router-link to="/login">Go to Login</router-link>

  <!-- 路由出口 -->
  <!-- 路由匹配到的组件将渲染在这里 -->
  <router-view></router-view>
</div>
```

## 路由模式

有两种路由模式`Hash`和`History`模式，分别通过`createWebHashHistory`和`createWebHistory`来设置，这也是常见的 Vue 面试题

### 1.Hash 模式

URL 示例：`http://example.com/#/home`

在`URL`中使用`#`符号来表示路由地址，即哈希片段。`#`符号后面的内容被称为哈希路径（hash path），由`Vue Router`用来匹配路由。浏览器不会将哈希片段发送到服务器，因此哈希模式不会影响服务器请求。

原理是通过`onhashchange()`事件监听`hash`值变化，在页面`hash`值发生变化后，`window`就可以监听到事件改变，并按照规则加载相应的代码。`hash`值变化对应的 URL 都会被记录下来，这样就能实现浏览器历史页面前进后退。

`Hash`易于部署，无需额外配置服务器；对于不支持`HTML5 History API`的浏览器，有较好的兼容性。但 URL 中包含`#`符号，有时可能被认为不够美观。

### 2.History 模式

URL 示例：`http://example.com/home`

在 URL 中不使用`#`符号，而是直接使用普通的 URL 路径。这需要服务器配置以支持该模式，并确保在用户访问页面时，服务器返回正确的资源而不是 404 错误。

`history`原理是使用`HTML5 history`提供的`pushState`、`replaceState`两个 API，用于浏览器记录历史浏览栈，并且在修改 URL 时不会触发页面刷新和后台数据请求。

URL 更加美观，没有#符号；适合用于实际生产环境中，通常需要与服务器配合，支持`HTML5 History API`。但是在生产环境中需要特殊配置服务器，以避免刷新页面时出现 404 错误。

#### Nginx 解决 404 问题

修改`nginx.conf`配置文件，在`location`下新增

```nginx
location / {
  try_files $uri $uri/ /index.html;
}
```

## 命名路由

除了 `path` 之外，还可以为任何路由提供 `name`。这有以下优点：

- 没有硬编码的 `URL`
- `params` 的自动编码/解码。
- 防止你在 `URL` 中出现打字错误。
- 绕过路径排序（如显示一个） 在使用`router-link`组件`to`属性传递一个对象

```html
<router-link :to="{ name: 'user', params: { username: 'erina' }}"></router-link>
```

## 路由懒加载

将路由组件按需加载，而**不是一次性将所有路由组件都加载到初始页面中，把不同路由对应的组件分割成不同的代码块，然后当路由被访问的时候才加载对应组件**。这样可以减少初始加载时的资源体积，提高应用程序的加载速度，并减轻初始负载，是 Vue 性能优化的一种

`vue-router`支持[动态 import](https://link.juejin.cn?target=https%3A%2F%2Fdeveloper.mozilla.org%2Fzh-CN%2Fdocs%2FWeb%2FJavaScript%2FReference%2FStatements%2Fimport%23%E5%8A%A8%E6%80%81_import) ，所有被导入的模块，在加载时就被编译。

```ts
// import Home  from ('../Home.vue')
// import Login from ('../Login.vue')

const Home = () => import('../Home.vue');
const Login = () => import('../Login.vue');
```

## 编程式导航

除了`<router-link>`标签来定义导航链接，还可以通过`router`实例上的方法来跳转。通过触发某个事件，执行`route.push`。

```html
<template>
  <div @click="gotoHome">User</div>
</template>

<script setup lang="ts">
  import { useRouter } from 'vue-router';
  const route = useRouter();

  function gotoHome() {
    route.push('/user');
  }
</script>
```

该方法的参数可以是一个字符串路径，或者一个描述地址的对象。例如：

```js
// 字符串路径
router.push('/users/eduardo');

// 带有路径的对象
router.push({ path: '/users/eduardo' });

// 命名的路由，并加上参数，让路由建立 url
router.push({ name: 'user', params: { username: 'eduardo' } });

// 带查询参数，结果是 /register?plan=private
router.push({ path: '/register', query: { plan: 'private' } });

// 带 hash，结果是 /about#team
router.push({ path: '/about', hash: '#team' });
```

## 路由传参

和之前的使用一样，可以通过`query`、`parmas`来传递参数

### 1.query

在使用编程式导航时，传入一个`query`对象为参数

```ts
function gotoHome(id) {
  route.push({
    path: '/user',
    query: {
      userId: id,
    },
  });
}
```

使用**userRoute**里的`query`来接收参数

> 少了个 r， 和路由跳转 useRouter 不一样，userRoute 主要用来获取路由信息。

```ts
import { useRoute } from 'vue-router';
const route = useRoute();

console.log('user id', route.query.userId);
```

### 2.params

在使用编程式导航时，传入一个`params`对象为参数，此时只能使用命名路由`name`。

```ts
function gotoHome(id) {
  route.push({
    name: 'user',
    params: {
      userId: id,
    },
  });
}
```

使用`params`接收参数

```ts
import { useRoute } from 'vue-router';
const route = useRoute();

console.log('user id', route.params.userId);
```

### 3.动态路由

可以在路由`URL`后面拼接数据，达到传递参数的目的。在定义路由的时候，就要在`path`后定义路径参数。

路径参数用冒号 `:` 表示。当一个路由被匹配时，**它的 `params` 的值将在每个组件中**。

```ts
ts

 体验AI代码助手
 代码解读
复制代码import { createRouter, createWebHistory } from 'vue-router'


const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import ('../Home.vue')
    },
    {
      path: '/user/:userId',
      name: 'user',
      component: () => import ('../User.vue')
    }
  ]
})

export default router
```

路由跳转和`params`方式一样

```ts
function gotoHome(id) {
  route.push({
    name: 'user',
    params: {
      userId: id,
    },
  });
}
```

接收参数也是

```ts
import { useRoute } from 'vue-router';
const route = useRoute();

console.log('user id', route.params.userId);
```

### 4.query 和 params 传参的区别

- `query`传参数配置的是`path`，而`params`传参配置的是`name`，在`params`中配置`path`无效
- `query`在路由上可以不设置参数，而`parmas`是必须要设置
- `query`传递的参数会在`URL`地址栏上显示
- `params`参数在刷新页面后消失，`query`传递的参数不会。
- `query`方式通过`route.query`方法获取参数，`parmas`通过`route.params`方法获取

## 历史记录

### 1.replace

`replace`方法用于导航到一个新的路由，但是它会替换掉当前的历史记录，而不会生成新的历史记录。

在使用`replace`方法后，用户将无法通过浏览器的"后退"按钮返回到之前的页面，而是直接返回到上一个历史记录的前一步。

```js
<router-link replace to="/login">
  Go to Home
</router-link>;
// 将push替换成replace
route.replace('/login');
```

### 2.前进后退

```ts
const next = () => {
  // 前进，数量不限于1
  router.go(1)
}

const prev = () => {
	// 后退
	router.back()
```

## 嵌套路由

使用嵌套路由可以在一个父路由下定义多个子路由，使用`children`数据来接收子路由

```ts
import { createRouter, createWebHistory } from 'vue-router';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('../Home.vue'),
    },
    {
      path: '/user',
      name: 'user',
      component: () => import('../User.vue'),
      children: [
        {
          path: '', // 空路径表示父路由的默认子路由
          component: () => import('../User.vue'),
        },
        {
          path: 'profile',
          component: () => import('../UserProfile.vue'),
        },
        {
          path: 'posts',
          component: () => import('../UserPosts.vue'),
        },
      ],
    },
  ],
});

export default router;
```

`children` 配置只是另一个路由数组，就像 `routes` 本身一样。因此，可以根据自己的需要，不断地嵌套视图。

在组件中，也是要加上`<router-view></router-view>`

## 命名视图

命名视图可以将多个组件同时渲染到同一个路由的不同位置的方法，命名视图适用于一些布局较复杂的场景，比如同时在页面的顶部和底部显示不同的内容。可以为每个位置创建一个命名视图，然后在路由配置中根据需要将组件渲染到相应的位置。

定义路由的时候，在`components`中定义多个组件

```ts
import { createRouter, createWebHistory } from 'vue-router';

import MainLayout from './components/MainLayout.vue';
import HeaderComponent from './components/HeaderComponent.vue';
import ContentComponent from './components/ContentComponent.vue';
import FooterComponent from './components/FooterComponent.vue';

const routes = [
  {
    path: '/',
    components: {
      default: MainLayout,
      header: HeaderComponent,
      content: ContentComponent,
      footer: FooterComponent,
    },
  },
  // 其他路由配置...
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
```

在组件上使用`<router-view>`时增加`name`属性，对应路由中多个组件名

```html
<template>
  <div>
    <!-- 使用命名视图渲染 Header、Content 和 Footer -->
    <router-view name="header"></router-view>
    <router-view name="content"></router-view>
    <router-view name="footer"></router-view>
  </div>
</template>
```

## 重定向 redirect

重定向用于在用户访问某个路由时将其自动重定向到另一个路由。

```ts
import { createRouter, createWebHistory } from 'vue-router';

import HomeComponent from './components/HomeComponent.vue';
import AboutComponent from './components/AboutComponent.vue';
import ContactComponent from './components/ContactComponent.vue';

const routes = [
  {
    path: '/',
    component: HomeComponent,
  },
  {
    path: '/about',
    component: AboutComponent,
  },
  {
    path: '/contact',
    component: ContactComponent,
    // 设置重定向
    redirect: '/about', // 将访问 '/contact' 重定向到 '/about'
  },
  // 其他路由配置...
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
```

## 路由守卫

路由守卫是`vue-router`提供的一种特性，允许开发者在路由切换的过程中添加一些自定义的逻辑。这些逻辑可以用于控制路由导航的行为，例如在用户访问特定路由前进行身份验证、权限检查、处理未保存的表单数据等。

主要分为三种类型路由守卫：**全局守卫**、**组件独享守卫**、**组件内守卫**

每个守卫方法接收以下参数：

- `to`： 要进入的目标路由对象
- `from`：当前导航正要离开的路由对象
- `next`可选：一个函数，用于决定是否允许路由切换，调用该函数时可以传递一个参数指定要跳转的路由路径。它有三种调用方式。
  - `next()`：通过当前路由进入到下一个路由
  - `next(false)`：中断当前路由
  - `next('/login')`或者`next({path: '/login'})`：重定向到其他路由。

可以返回的值如下:

- `false`: 取消当前的导航。如果浏览器的 `URL` 改变了(可能是用户手动或者浏览器后退按钮)，那么` URL` 地址会重置到 from 路由对应的地址。
- 一个路由地址: 通过一个路由地址跳转到一个不同的地址，就像调用`router.push()`一样，你可以设置诸如 `replace: true `或 `name: 'home' `之类的配置。当前的导航被中断，然后进行一个新的导航，就和 `from` 一样。

```ts
router.beforeEach(async (to, from) => {
  if (
    // 检查用户是否已登录
    !isAuthenticated &&
    // ❗️ 避免无限重定向
    to.name !== 'Login'
  ) {
    // 将用户重定向到登录页面
    return { name: 'Login' };
  }
});
```

### 全局守卫

- 全局前置守卫 beforeEach

使用`router.beforeEach `注册一个全局前置守卫，该钩子**在每次路由切换前调用，可以用于进行全局的身份验证或权限检查**

- beforeResolve

使用`router.beforeResolve `注册一个全局解析守卫，该钩子**在导航被确认之前，同时在所有组件内守卫和异步路由组件被解析之后调用**。

### afterEach

使用`router.afterEach `注册一个全局后置守卫，该钩子**在每次路由切换后调用，可以用于执行一些全局的清理任务或者数据统计等。**

### 组件独享守卫 beforeEnter

组件独享守卫只会在特定路由配置中生效，影响到某个特定路由及其子路由。

使用`router.beforeEnter `注册一个全局后置守卫，该钩子**在进入路由时触发，用于对该路由进行独立的身份验证或其他检查**。

### 组件内守卫

组件内守卫在路由组件内直接定义路由导航守卫

- beforeRouteEnter

该钩子**在渲染该组件的对应路由被验证前调用，不能获取组件实例 this。**

不能访问 `this`，因为守卫在导航确认前被调用，因此即将登场的新组件还没被创建。

解决办法

```ts
beforeRouteEnter (to, from, next) {
  next(vm => {
    // 通过 `vm` 访问组件实例
  })
}
```

- beforeRouteUpdate

该钩子**在当前路由改变，但是该组件被复用时调用**

- beforeRouteLeave

该钩子**在导航离开渲染该组件的对应路由时调用**

- 在 setup 中使用

用`vue3`组合式 API 来编写组见，可以通过`onBeforeRouteUpdate` 和 `onBeforeRouteLeave` 分别添加 `update` 和 `leave` 守卫。

```ts
import { onBeforeRouteLeave, onBeforeRouteUpdate } from 'vue-router';

// 与 beforeRouteLeave 相同，无法访问 `this`
onBeforeRouteLeave((to, from, next) => {
  next((vm) => {
    // 通过 `vm` 访问组件实例
  });
});

onBeforeRouteUpdate(async (to, from) => {});
```

### 完整的路由导航解析流程

1. 导航被触发。
2. 在失活的组件里调用 `beforeRouteLeave` 守卫。
3. 调用全局的 `beforeEach` 守卫。
4. 在重用的组件里调用 `beforeRouteUpdate` 守卫(2.2+)。
5. 在路由配置里调用 `beforeEnter`。
6. 解析异步路由组件。
7. 在被激活的组件里调用 `beforeRouteEnter`。
8. 调用全局的 `beforeResolve` 守卫(2.5+)。
9. 导航被确认。
10. 调用全局的 `afterEach` 钩子。
11. 触发 DOM 更新。
12. 调用 `beforeRouteEnter` 守卫中传给 `next` 的回调函数，创建好的组件实例会作为回调函数的参数传入。

## 路由元信息

路由元信息是在 Vue Router 中用于给路由添加额外信息的一种机制。它允许在路由配置中定义自定义的数据字段，用于存储一些与路由相关的元数据，例如页面标题、权限要求、面包屑等。

每个路由配置对象可以包含一个名为`meta`的字段，该字段是一个对象，用于存储路由的元信息。这些信息可以在导航守卫、路由组件或其他地方进行访问，从而允许你在应用程序中根据路由的元信息来做出不同的处理。

```ts
const routes = [
  {
    path: '/posts',
    component: PostsLayout,
    children: [
      {
        path: 'new',
        component: PostsNew,
        // 只有经过身份验证的用户才能创建帖子
        meta: { requiresAuth: true }
      },
      {
        path: ':id',
        component: PostsDetail
        // 任何人都可以阅读文章
        meta: { requiresAuth: false }
      }
    ]
  }
]
```

要访问路由的元信息，可以在导航守卫中使用`to`对象来获取。例如，在全局前置守卫`beforeEach`中可以这样访问：

```ts
router.beforeEach((to, from, next) => {
  // 获取目标路由的元信息
  const requiresAuth = to.meta.requiresAuth;

  // 在这里进行一些逻辑判断，例如根据requiresAuth决定是否需要登录验证

  // 继续路由导航
  next();
});
```

而在组件中，可以通过`route.meta`来访问

```ts
import { useRoute } from 'vue-router';
const route = useRoute();

console.log('user id', route.query.meta.requiresAuth);
```

## 动态路由

通常在后台项目中，一般都是用动态路由，也就是路由列表由后台返回，前端拿到数据后动态的添加路由。这样做的好处是可以做到权限控制，不同的角色权限访问不同的内容。

主要使用的方法是`router.addRoute`

### 添加路由

使用`router.addRoute`来注册一个路由

```ts
router.addRoute({ path: '/login', component: Login });
```

### 删除路由

- 通过添加一个名称冲突的路由。如果添加与现有途径名称相同的途径，会先删除路由，再添加路由：

  ```ts
  router.addRoute({ path: '/about', name: 'about', component: About });
  // 这将会删除之前已经添加的路由，因为他们具有相同的名字且名字必须是唯一的
  router.addRoute({ path: '/other', name: 'about', component: Other });
  ```

- 通过调用

  ```
  router.addRoute()
  ```

  返回的回调：

  ```ts
  const removeRoute = router.addRoute(routeRecord);
  removeRoute(); // 删除路由如果存在的话
  ```

- 调用

  ```
  router.removeRoute
  ```

  按名称删除路由

  ```ts
  router.remove('login');
  ```

当路由删除时，**所有的子路有都会被删除**

### 查看路由

- `router.hasRoute('login')`：检查路由是否存在。
- `router.getRoutes()`：获取一个包含所有路由记录的数组。
