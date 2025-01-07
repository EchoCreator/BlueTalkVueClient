<script setup>
// 刷新页面
import { provide, nextTick, ref } from "vue";
const isRouterActive = ref(true);
provide("reload", () => {
  isRouterActive.value = false;
  nextTick(() => {
    isRouterActive.value = true;
  });
});
</script>

<template>
  <router-view v-if="isRouterActive"></router-view>
</template>

<style scoped></style>
