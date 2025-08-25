import { defineConfig } from 'vitepress';
import { groupIconMdPlugin, groupIconVitePlugin } from 'vitepress-plugin-group-icons';
import { createDetypePlugin } from 'vitepress-plugin-detype';
import { tabsMarkdownPlugin } from 'vitepress-plugin-tabs';
import vueJsx from '@vitejs/plugin-vue-jsx';
import { viteDemoPreviewPlugin } from '@vitepress-code-preview/plugin';
import { fileURLToPath, URL } from 'node:url';
import { demoPreviewPlugin } from '@vitepress-code-preview/plugin';
import container from 'markdown-it-container';
import { renderSandbox } from 'vitepress-plugin-sandpack';
import { generateSidebar } from 'vitepress-sidebar';
import { sideBarData } from './theme/sidebarOptions';

const { detypeMarkdownPlugin, detypeVitePlugin } = createDetypePlugin();

// https://vitepress.dev/reference/site-config
export default defineConfig({
  base: '/',
  srcDir: './',
  title: "Aiolimp's Blog",
  description: "Aiolimp's Blog Web Site",
  ignoreDeadLinks: true,
  head: [
    ['link', { rel: 'icon', href: '/blog.svg' }],
    [
      'script',
      {
        src: 'https://cloud.umami.is/script.js',
        'data-website-id': 'a389c094-c38f-4892-a805-600abb846e29',
      },
    ],
  ],
  //启用深色模式
  appearance: 'dark',
  themeConfig: {
    logo: '/logo.svg',
    lastUpdated: {
      text: 'Updated at',
      formatOptions: {
        dateStyle: 'full',
        timeStyle: 'medium',
      },
    },

    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: '首页', link: '/' },
      {
        text: '前端基础',
        items: [
          { text: 'JavaScript', link: '/base/JavaScript/JavaScript数据类型' },
          { text: 'TypeScript', link: '/base/TypeScript/TypeScript基础语法' },
        ],
      },
      {
        text: '框架与工程化',
        items: [
          { text: 'Vue', link: '/frameWork/Vue/vue' },
          { text: 'React', link: '/frameWork/React/ReactComponents' },
          { text: 'Vite', link: '/frameWork/Vite/Vite minifont优化字体插件' },
          { text: 'Webpack', link: '/frameWork/Webpack/webpack常见应用场景' },
          { text: '开发体验', link: '/frameWork/Experience/eslint' },
        ],
      },
      {
        text: '前端进阶',
        items: [
          { text: 'NodeJS', link: '/forward/node/index' },
          { text: 'HTTP网络', link: '/forward/http/从输入URL到页面呈现发生了什么' },
          { text: '性能优化', link: '/forward/optimize/001-前端性能指标详解' },
          { text: 'Git使用', link: '/forward/git/001-Git 使用指南' },
        ],
      },
      {
        text: '生态拓展',
        items: [
          { text: '服务端', link: '/expansion/Server/MySql' },
          { text: '场景集合', link: '/expansion/Scenarios/组件库搭建规范' },
          { text: 'AI & 前端', link: '/expansion/AI/LangChainAgent' },
        ],
      },
      {
        text: '前端面试',
        items: [
          { text: 'HTML', link: '/interview/HTML/index' },
          { text: 'CSS', link: '/interview/CSS/prev' },
          { text: 'JavaScript', link: '/interview/JavaScript/prev' },
          { text: 'Typescript', link: '/interview/Typescript/index' },
          { text: '浏览器网络篇', link: '/interview/Network/index' },
          { text: '前端工程化', link: '/interview/FrontendEngineering/index' },
          { text: 'Vue2/3框架', link: '/interview/Vue/index' },
          { text: 'React框架', link: '/interview/React/index' },
          { text: '算法&数据结构', link: '/interview/Algorithm/dataStructure' },
        ],
      },
      {
        text: '博客统计',
        link: 'https://us.umami.is/share/Y2BYxCAm7R0DG2Xi/carlosme.fun',
      },
    ],

    sidebar: generateSidebar(sideBarData),
    // 文章右侧大纲目录
    outline: {
      level: [2, 6],
      label: '目录',
    },
    //自定义上下页名
    docFooter: {
      prev: '上一页',
      next: '下一页',
    },
    // 社交链接
    socialLinks: [{ icon: 'github', link: 'https://github.com/Aiolimp' }],
    // 主题
    darkModeSwitchLabel: '深浅模式',

    returnToTopLabel: '返回顶部',
    // 搜索
    search: {
      provider: 'local',
    },
    // 页脚
    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2023-present Aiolimp',
    },
  },
  markdown: {
    image: {
      lazyLoading: true,
    },
    config(md) {
      const docRoot = fileURLToPath(new URL('../', import.meta.url));

      md.use(groupIconMdPlugin);
      md.use(tabsMarkdownPlugin);
      md.use(detypeMarkdownPlugin);
      md.use(demoPreviewPlugin, { docRoot });

      md.use(container, 'sandbox', {
        render(tokens, idx) {
          return renderSandbox(tokens, idx, 'sandbox');
        },
      });
    },
  },
  vite: {
    plugins: [detypeVitePlugin(), groupIconVitePlugin(), viteDemoPreviewPlugin(), vueJsx()] as any[],
  },
});
