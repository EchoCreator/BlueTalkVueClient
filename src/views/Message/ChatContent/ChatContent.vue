<script setup>
import { ref } from "vue";
import { useRoute, useRouter } from "vue-router";

const route = useRoute();

import { getChatContentService } from "@/api/chat";

const chatContent = ref([]);
const getChatContent = async () => {
  const result = await getChatContentService(
    route.query.id,
    route.query.isSingleChat
  );
  if (result.code === 0) {
    chatContent.value = result.data;
  }
};
getChatContent();
</script>

<template>{{chatContent}}</template>

<style scoped></style>
