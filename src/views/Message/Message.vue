<script setup>
import { ref } from "vue";
import { getChatListService } from "@/api/chat.js";

const chatList = ref([]);
const getChatList = async () => {
  const result = await getChatListService();
  if (result.code === 0) {
    chatList.value = result.data;
    chatList.value = chatList.value.filter((value) => {
      const dateStr = value.createTime.split(" ")[0];
      const dateTimeStr = value.createTime.slice(11, 16);

      const now = new Date();
      // 由于只有年月日，所以chatDate的时分秒为0
      const chatDate = new Date(dateStr);
      const chatDateTime = new Date(value.createTime);
      // 将当前时间的时分秒设置为0，方便与chatDate比较
      const todayDate = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate()
      );

      // 如果是今天
      if (chatDate.getTime() === todayDate.getTime()) {
        // 计算消息时间和当前时间的毫秒差
        const timeDifference = Math.abs(now - chatDateTime);
        // 如果是最近1分钟，返回“刚刚”；否则返回“时:分”
        if (timeDifference < 60 * 1000) {
          return (value.createTime = "刚刚");
        } else {
          return (value.createTime = dateTimeStr);
        }
      }

      // 如果是昨天
      const yesterdayDate = new Date(todayDate);
      yesterdayDate.setDate(todayDate.getDate() - 1);
      if (chatDate.getTime() === yesterdayDate.getTime()) {
        return (value.createTime = "昨天");
      }

      // 如果是前天
      const beforeYesterdayDate = new Date(todayDate);
      beforeYesterdayDate.setDate(todayDate.getDate() - 2);
      if (chatDate.getTime() === beforeYesterdayDate.getTime()) {
        return (value.createTime = "前天");
      }

      return (value.createTime = value.createTime.split(" ")[0]);
    });
  }
};
getChatList();

import { useRouter } from "vue-router";
const router = useRouter();
const showChatContent = (id, isSingleChat) => {
  router.push({ path: "/chat", query: { id: id, isSingleChat: isSingleChat } });
};
</script>

<template>
  <div class="main-container">
    <div
      class="chat-list"
      v-for="(item, index) in chatList"
      :key="index"
      @click="
        item.groupId === 0
          ? showChatContent(item.userId, 1)
          : showChatContent(item.groupId, 0)
      "
    >
      <div class="chat-info">
        <img
          class="avatar"
          :src="item.avatar"
          alt=""
          v-if="item.avatar !== null && item.avatar !== ''"
        />
        <img
          class="avatar"
          src="../../../public/images/icon/default-avatar.png"
          alt=""
          v-else-if="item.profilePicture === null || item.profilePicture === ''"
        />
        <img
          class="avatar"
          :src="item.profilePicture"
          alt=""
          v-else-if="item.profilePicture !== null && item.profilePicture !== ''"
        />
        <div class="name-content">
          <div class="name" v-if="item.groupId === 0">
            {{ item.username }}
          </div>
          <div class="name" v-if="item.groupId !== 0">
            {{ item.groupName }}
          </div>
          <div class="content" v-if="item.type === 0">
            <span v-if="item.groupId !== 0">{{ item.username }}：</span
            >{{ item.text }}
          </div>
          <div class="content" v-if="item.type === 1">
            <span v-if="item.groupId !== 0">{{ item.username }}：</span>[图片]
          </div>
          <div class="content" v-if="item.type === 2">
            <span v-if="item.groupId !== 0">{{ item.username }}：</span>[笔记]{{
              item.blogTitle
            }}
          </div>
        </div>
      </div>
      <div class="time">{{ item.createTime }}</div>
    </div>
  </div>
</template>

<style scoped>
.chat-list {
  width: 100%;
  padding: 1rem 2rem;
  box-sizing: border-box;
  display: flex;
  justify-content: space-between;
}
.chat-list:first-child {
  padding-top: 2rem;
}
.chat-list .chat-info {
  width: 80%;
  display: flex;
  align-items: center;
}
.chat-list .avatar {
  width: 5.5rem;
  height: 5.5rem;
  border-radius: 50%;
  margin-right: 1rem;
}
.chat-list .name-content {
  max-width: 75%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}
.chat-list .name {
  font-size: 1.8rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.chat-list .content {
  font-size: 1.5rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--theme-color-grey-text);
}
.chat-list .time {
  font-size: 1.5rem;
  color: var(--theme-color-grey-text);
}
</style>
