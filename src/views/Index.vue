<script setup>
import { Home, Message, Cart, My, Plus } from "@nutui/icons-vue";

import { h, ref } from "vue";

import { useRouter } from "vue-router";

const router = useRouter();

const activePath=router.currentRoute.value.path

const tabList = [
  {
    title: "首页",
    icon: h(Home),
    name: "/home",
  },
  {
    title: "商城",
    icon: Cart,
    name: "/mall",
  },
  {
    icon: h(Plus),
    name: "/upload",
  },
  {
    title: "消息",
    icon: h(Message),
    name: "/message",
  },
  {
    title: "我的",
    icon: h(My),
    name: "/profile",
  },
];
const tabSwitch = (item, index) => {
  router.push(index);
};
</script>

<template>
  <router-view></router-view>
  <nut-tabbar
    v-model="activePath"
    @tab-switch="tabSwitch"
    active-color="var(--theme-color)"
    bottom
    safe-area-inset-bottom
    placeholder
  >
    <nut-tabbar-item
      v-for="item in tabList"
      :key="item.name"
      :name="item.name"
      :tab-title="item.title"
      :icon="item.icon"
    >
    </nut-tabbar-item>
  </nut-tabbar>
</template>

<style scoped></style>
