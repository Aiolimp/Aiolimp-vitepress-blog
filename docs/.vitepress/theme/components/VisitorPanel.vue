<template>
  <div class="panel">
    <div class="container">
      <section class="grid">
        <span class="text">
          本站总访问量
          <span id="busuanzi_value_site_pv" class="font-bold">--</span> 次
        </span>
        <!-- <img src="/heart.gif" alt="heart" class="heart-img" width="50" height="50" @click="onLinkUmiHandle" /> -->
        <span class="text">
          本站访客数
          <span id="busuanzi_value_site_uv" class="font-bold">--</span> 人次
        </span>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { inBrowser } from 'vitepress';
const onLinkUmiHandle = () => {
  if (inBrowser) {
    window.open('https://us.umami.is/share/Y2BYxCAm7R0DG2Xi/aiolimp.space', '_blank');
  }
};
</script>

<style scoped>
.panel {
  margin-top: 12px;
  margin-bottom: 8px;
}

.container {
  background-color: var(--vp-c-bg-soft);
  border-radius: 8px;
  width: 100%;
  min-height: 32px;
  max-width: 1152px;
  margin-left: auto;
  margin-right: auto;
}

.heart-img {
  border-radius: 4px;
  cursor: pointer;
}

.grid {
  font-weight: 500;
  padding-top: 12px;
  padding-bottom: 12px;
  padding-left: 12px;
  padding-right: 12px;
  justify-items: center;
  align-items: center;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  display: grid;
}

.text {
  font-size: 0.875rem;
  line-height: 1.25rem;
}
</style>
