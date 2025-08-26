---
title: 005 Vite 自动权限注入插件
theme: solarized-dark
---

# Vite 自动权限注入插件

## 一、背景

做中台系统的权限控制功能，由于路由权限和角色权限都简单，但是要做按钮权限有点麻烦，因为太多按钮了。简单暴力做法就是每个按钮用自定义指令去判断是否有权限显示。但是重复代码也太多太多，并且维护性极差，代码固定难以调整。下面演示如何通过 `vite` 插件去自动生成对比按钮权限的代码。

## 二、实现思路

项目构建的时候 `vite` 自动全局插入按钮权限的代码，并且跟接口获取存放在 pinia 仓库的权限列表对比是否有权限展示。

### 1. 如何识别生成独一无二的按钮编码

插入的编码选择按规则自动化语义化生成的，规则如下所示。
权限编码 = `文件路径_操作类型`，这样每个按钮都能独一无二
例如路径是 `scr/view/index.vue` 的新增按钮，那么编码就是 `scr/view/index_create`
简单示例：

```ts
// 1. 获取权限码前缀（文件路径）
const filePath = relative(process.cwd(), id).replace(extname(id), '').replace(/\\/g, '/'); // 统一使用正斜杠
const result = code.split('\n');

// 映射表
const buttonTextMap = {
  新增: 'create',
  创建: 'create',
  编辑: 'edit',
  修改: 'edit',
  删除: 'delete',
  移除: 'delete',
  查看: 'view',
  详情: 'view',
  导出: 'export',
  下载: 'download',
  上传: 'upload',
  审核: 'audit',
  发布: 'publish',
};

//拼接得到编码
const permissionCode = `${filePath}_${permissionSuffix}`;
```

### 2. 考虑对比多种 UI 库的按钮

- `Element Plus` (el-button)
- `Ant Design Vue` (a-button)
- `Naive UI` (n-button)
- `Vant` (van-button)
- `原生 HTML` (button)

### 3. 智能权限推断

插件能够通过三种策略自动推断按钮的权限类型：

- 策略 1：按钮文字推断

  ```vue
  <el-button>新增</el-button>
  <!-- 自动转换为 -->
  <el-button v-if="hasPermission('src/views/user/index_create')">新增</el-button>
  ```

- 策略 2：事件处理函数推断

  ```vue
  <el-button @click="handleEdit">编辑</el-button>
  <!-- 自动转换为 -->
  <el-button @click="handleEdit" v-if="hasPermission('src/views/user/index_edit')">编辑</el-button>
  ```

- 策略 3：按钮类型推断

  ```vue
  <el-button type="danger">操作</el-button>
  <!-- 自动转换为 -->
  <el-button type="danger" v-if="hasPermission('src/views/user/index_delete')">操作</el-button>
  ```

### 4. 自动 Store 导入

如果文件中没有权限 `store` 导入，插件会自动注入：

```ts
import { usePermissionStore } from '@/store/permission';
const { hasPermission } = usePermissionStore();
```

### 5. 配置选项

```ts
interface PermissionPluginOptions {
  srcDir?: string; // 源码目录，默认 'src'
  permissionFunctionName?: string; // 权限函数名，默认 'hasPermission'
  storeImportPath?: string; // store导入路径，默认 '@/store/permission'
  buttonTextMap?: Record<string, string>; // 按钮文案映射
  buttonComponents?: string[]; // 支持的按钮组件
  debug?: boolean; // 调试模式开关
}
```

### 6. 调试功能

开启 debug 模式后，控制台会显示详细处理信息：

```bash
🔧 [permission-plugin] 处理文件: src/views/user/index.vue
🔧 [permission-plugin] 从文字推断权限: "新增" -> create
🔧 [permission-plugin] 注入权限指令: src/views/user/index_create
🔧 [permission-plugin] 注入权限store导入到现有script setup
```

#### 6.1. 开启调试模式

```typescript
autoPermissionPlugin({
  debug: true, // 显示详细处理信息
});
```

#### 6.2. 检查生成的权限码

在浏览器控制台可以看到：

```
[auto-permission] 注入权限: user:create
[auto-permission] 注入权限: order:delete
```

#### 6.3. 验证权限注入结果

查看编译后的 Vue 文件是否正确注入了`v-if`指令。

## 三、完整代码

### **1. 插件代码**

```ts
import { relative, extname } from 'path';
import MagicString from 'magic-string';
import type { Plugin } from 'vite';

/**
 * Auto permission injection Vite plugin
 * 功能：自动为 Vue 组件中的按钮等交互元素注入权限控制指令
 *
 */

interface PermissionPluginOptions {
  /** 源码目录 */
  srcDir?: string;
  /** 权限检查函数名 */
  permissionFunctionName?: string;
  /** store导入路径 */
  storeImportPath?: string;
  /** 按钮文案映射 */
  buttonTextMap?: Record<string, string>;
  /** 支持的按钮组件 */
  buttonComponents?: string[];
  /** 是否启用调试模式 */
  debug?: boolean;
}

export default function autoPermissionPlugin(options: PermissionPluginOptions = {}): Plugin {
  const {
    srcDir = 'src',
    permissionFunctionName = 'hasPermission',
    storeImportPath = '@/store/permission',
    buttonTextMap = {
      新增: 'create',
      创建: 'create',
      编辑: 'edit',
      修改: 'edit',
      删除: 'delete',
      移除: 'delete',
      查看: 'view',
      详情: 'view',
      导出: 'export',
      下载: 'download',
      上传: 'upload',
      审核: 'audit',
      发布: 'publish',
    },
    buttonComponents = ['button', 'a-button', 'el-button', 'n-button', 'van-button'],
    debug = false,
  } = options;

  // 文件过滤器：只处理项目内的.vue文件
  const filter = (id: string) => {
    return /\.vue$/.test(id) && !id.includes('node_modules') && id.includes(srcDir);
  };

  // 调试日志
  const debugLog = (...args: any[]) => {
    if (debug) {
      console.log('🔧 [permission-plugin]', ...args);
    }
  };

  return {
    name: 'auto-permission-injection',
    enforce: 'pre', // 在Vue插件之前执行

    /**
     * 转换函数：核心逻辑
     */
    transform(code, id) {
      if (!filter(id)) return;

      try {
        debugLog(`处理文件: ${id}`);

        const s = new MagicString(code);
        let hasChanges = false;

        // 1. 获取权限码前缀（文件路径）
        const filePath = relative(process.cwd(), id).replace(extname(id), '').replace(/\\/g, '/'); // 统一使用正斜杠

        // 2. 检查是否已导入权限store
        const hasPermissionImport =
          code.includes(`from '${storeImportPath}'`) || code.includes(`from "${storeImportPath}"`);

        // 3. 查找并处理按钮元素
        const buttonRegex = new RegExp(`<(${buttonComponents.join('|')})([^>]*?)>([\\s\\S]*?)</\\1>`, 'g');

        let match;
        const processedButtons = new Set<string>(); // 避免重复处理

        while ((match = buttonRegex.exec(code)) !== null) {
          const [fullMatch, tagName, attrs, content] = match;
          const matchStart = match.index;
          const matchEnd = match.index + fullMatch.length;

          // 避免重复处理同一个按钮
          const buttonKey = `${matchStart}-${matchEnd}`;
          if (processedButtons.has(buttonKey)) continue;
          processedButtons.add(buttonKey);

          // 检查是否已有权限指令
          if (attrs.includes('v-if') && attrs.includes(permissionFunctionName)) {
            debugLog(`跳过已有权限指令的按钮: ${tagName}`);
            continue;
          }

          // 推断权限后缀
          let permissionSuffix = '';

          // 策略1: 从按钮文字推断
          const textContent = content.replace(/<[^>]*>/g, '').trim();
          if (textContent && buttonTextMap[textContent]) {
            permissionSuffix = buttonTextMap[textContent];
            debugLog(`从文字推断权限: "${textContent}" -> ${permissionSuffix}`);
          }

          // 策略2: 从@click事件推断
          if (!permissionSuffix) {
            const clickMatch = attrs.match(/@click(?:\.prevent|\.stop)*\s*=\s*["']([^"']+)["']/);
            if (clickMatch) {
              const clickHandler = clickMatch[1];

              // 处理函数调用：handleCreate() -> create
              const functionMatch = clickHandler.match(/^(\w+)\s*\(/);
              if (functionMatch) {
                const funcName = functionMatch[1];
                if (funcName.startsWith('handle') && funcName.length > 6) {
                  permissionSuffix = funcName.charAt(6).toLowerCase() + funcName.slice(7);
                  debugLog(`从点击事件推断权限: "${funcName}" -> ${permissionSuffix}`);
                }
              }

              // 处理直接方法名：如 @click="create"
              if (!permissionSuffix && /^[a-zA-Z]\w*$/.test(clickHandler)) {
                if (Object.values(buttonTextMap).includes(clickHandler)) {
                  permissionSuffix = clickHandler;
                  debugLog(`从点击方法推断权限: "${clickHandler}" -> ${permissionSuffix}`);
                }
              }
            }
          }

          // 策略3: 从按钮属性推断
          if (!permissionSuffix) {
            const typeMatch = attrs.match(/type\s*=\s*["']([^"']+)["']/);
            if (typeMatch) {
              const buttonType = typeMatch[1];
              const typeMap: Record<string, string> = {
                primary: 'create',
                danger: 'delete',
                warning: 'edit',
                info: 'view',
              };
              if (typeMap[buttonType]) {
                permissionSuffix = typeMap[buttonType];
                debugLog(`从type属性推断权限: "${buttonType}" -> ${permissionSuffix}`);
              }
            }
          }

          // 如果成功推断出权限，注入v-if指令
          if (permissionSuffix) {
            const permissionCode = `${filePath}_${permissionSuffix}`;
            const vIfDirective = ` v-if="${permissionFunctionName}('${permissionCode}')"`;

            // 在开始标签的>前插入v-if指令
            const startTagEnd = code.indexOf('>', matchStart);
            if (startTagEnd !== -1) {
              s.appendLeft(startTagEnd, vIfDirective);
              hasChanges = true;
              debugLog(`注入权限指令: ${permissionCode}`);
            }
          }
        }

        // 4. 注入权限store导入（如果需要且尚未导入）
        if (hasChanges && !hasPermissionImport) {
          const storeImportCode = `import { usePermissionStore } from '${storeImportPath}'\nconst { ${permissionFunctionName} } = usePermissionStore()\n`;

          // 查找script setup标签位置
          const scriptSetupMatch = code.match(/<script\s+setup[^>]*>/);
          if (scriptSetupMatch) {
            const insertPos = scriptSetupMatch.index! + scriptSetupMatch[0].length;
            s.appendLeft(insertPos, `\n${storeImportCode}`);
            debugLog('注入权限store导入到现有script setup');
          } else {
            // 如果没有script setup，在template后添加
            const templateEndMatch = code.match(/<\/template>/);
            if (templateEndMatch) {
              const insertPos = templateEndMatch.index! + templateEndMatch[0].length;
              const newScriptTag = `\n\n<script setup lang="ts">\n${storeImportCode}</script>`;
              s.appendLeft(insertPos, newScriptTag);
              debugLog('创建新的script setup标签');
            }
          }
        }

        // 5. 返回转换结果
        if (hasChanges) {
          debugLog(`权限注入完成: ${id}`);
          return {
            code: s.toString(),
            map: s.generateMap({ hires: true }),
          };
        }

        return null;
      } catch (error) {
        console.error(`❌ 权限注入失败: ${id}`, error);
        return null; // 转换失败时返回null，保持原始代码
      }
    },

    /**
     * 构建开始时的日志
     */
    buildStart() {
      debugLog('权限注入插件启动');
      debugLog(`支持的按钮组件: ${buttonComponents.join(', ')}`);
      debugLog(`权限函数名: ${permissionFunctionName}`);
      debugLog(`Store导入路径: ${storeImportPath}`);
    },

    /**
     * 构建结束时的统计
     */
    generateBundle() {
      debugLog('权限注入插件处理完成');
    },
  };
}
```

### 2. 在`vite.config.ts`中使用

```ts
import autoPermissionPlugin from './plugin/permissions-optimized';

export default defineConfig({
  plugins: [
    vue(),
    autoPermissionPlugin({
      debug: true, // 开发环境开启调试
    }),
  ],
});
```

### **3. Vue 组件使用示例**

原始代码：

```vue
<template>
  <div>
    <el-button>新增</el-button>
    <el-button @click="handleEdit">编辑</el-button>
    <el-button type="danger">删除</el-button>
    <a-button @click="handleView()">查看</a-button>
  </div>
</template>

<script setup lang="ts">
const handleEdit = () => {
  console.log('编辑');
};
const handleView = () => {
  console.log('查看');
};
</script>
```

转换后的代码：

```vue
<template>
  <div>
    <el-button v-if="hasPermission('src/views/user/index_create')">新增</el-button>
    <el-button @click="handleEdit" v-if="hasPermission('src/views/user/index_edit')">编辑</el-button>
    <el-button type="danger" v-if="hasPermission('src/views/user/index_delete')">删除</el-button>
    <a-button @click="handleView()" v-if="hasPermission('src/views/user/index_view')">查看</a-button>
  </div>
</template>

<script setup lang="ts">
import { usePermissionStore } from '@/store/permission';
const { hasPermission } = usePermissionStore();

const handleEdit = () => {
  console.log('编辑');
};
const handleView = () => {
  console.log('查看');
};
</script>
```

## 四、通过组件的形式实现按钮权限控制

当`需要更精细的权限控制`和`需要复杂的权限逻辑和用户交`互时，也可以采用调用特殊组件的形式控制按钮权限

**组件代码：**

```vue
<!-- components/PerButton.vue -->
<template>
  <el-button v-if="hasPermission" v-bind="buttonProps" @click="handleClick">
    <slot />
  </el-button>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { usePermissionStore } from '../store/permission';
import { useRoute } from 'vue-router';

interface Props {
  perType: 'create' | 'edit' | 'delete' | 'view' | 'export' | 'import' | 'save' | 'cancel';
  modulePath?: string;
  // 继承 el-button 的所有属性
  type?: 'primary' | 'success' | 'warning' | 'danger' | 'info';
  size?: 'large' | 'default' | 'small';
  disabled?: boolean;
  loading?: boolean;
  icon?: string;
}

const props = withDefaults(defineProps<Props>(), {
  modulePath: '',
  type: 'default',
  size: 'default',
});

const permissionStore = usePermissionStore();

// 权限码生成
const permissionCode = computed(() => {
  const path = props.modulePath || getCurrentModulePath();
  return `${path}_${props.perType}`;
});

// 权限检查
const hasPermission = computed(() => {
  return permissionStore.hasPermission(permissionCode.value); // 改为 hasPermission
});

// 按钮属性
const buttonProps = computed(() => {
  const { perType, modulePath, ...rest } = props;
  return rest;
});

// 自动设置按钮类型（基于操作类型）
const autoButtonType = computed(() => {
  const typeMap = {
    create: 'primary',
    edit: 'warning',
    delete: 'danger',
    view: 'info',
    export: 'success',
    import: 'success',
    save: 'primary',
    cancel: 'default',
  };
  return typeMap[props.perType] || 'default';
});

// 获取当前模块路径
const getCurrentModulePath = () => {
  const route = useRoute();
  return route.path.replace(/^\//, '').replace(/\//g, '_');
};

const emit = defineEmits<{
  click: [event: Event];
}>();

const handleClick = (event: Event) => {
  if (!hasPermission.value) {
    ElMessage.warning('您没有操作权限');
    return;
  }
  emit('click', event);
};
</script>
```

**使用：**

```vue
<PerButton per-type="create">新增</PerButton>
<PerButton per-type="edit" @click="handleEdit">编辑</PerButton>
```

**对比：**

| 特性       | Vite 插件方案                       | 权限组件方案                      |
| :--------- | :---------------------------------- | :-------------------------------- |
| 开发体验   | ⭐⭐⭐⭐⭐ 零感知，写原生按钮即可   | ⭐⭐⭐⭐ 需要记住组件 API         |
| 代码侵入性 | ⭐⭐⭐⭐⭐ 无侵入，编译时处理       | ⭐⭐⭐ 需要替换所有按钮组件       |
| 类型安全   | ⭐⭐⭐ 权限码是字符串               | ⭐⭐⭐⭐⭐ 完整的 TypeScript 支持 |
| 可维护性   | ⭐⭐⭐ 依赖构建工具                 | ⭐⭐⭐⭐⭐ 纯组件，易维护         |
| 灵活性     | ⭐⭐⭐ 基于约定的推断               | ⭐⭐⭐⭐⭐ 完全可控制             |
| 性能       | ⭐⭐⭐⭐⭐ 编译时处理，运行时零成本 | ⭐⭐⭐⭐ 运行时组件渲染           |
| 调试友好   | ⭐⭐⭐ 需要查看编译后代码           | ⭐⭐⭐⭐⭐ 直观的组件逻辑         |
