<script setup>
import { nextTick, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useUserInfoStore } from "@/stores/userInfo";
import { RectLeft, Edit } from "@nutui/icons-vue";

const route = useRoute();
const router = useRouter();
const userInfoStore = useUserInfoStore();

import { getChatContentService } from "@/api/chat";

const chat = ref({
  chatInfo: {},
  chatContent: {},
  isSingleChat: 1,
});
const getChatContent = async () => {
  const result = await getChatContentService(
    route.query.id,
    route.query.isSingleChat
  );
  if (result.code === 0) {
    chat.value = result.data;
    let lastCreateTime = null;
    chat.value.chatContent = chat.value.chatContent.filter((val) => {
      const chatDateTime = new Date(val.createTime);
      const chatDate = new Date(val.createTime.split(" ")[0]);
      const now = new Date();
      const todayDate = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate()
      );

      // 如果与上一条消息间隔不超过2分钟
      if (lastCreateTime !== null) {
        const lastTimeDifference = Math.abs(chatDateTime - lastCreateTime);
        lastCreateTime = chatDateTime;
        if (lastTimeDifference < 2 * 60 * 1000) {
          return (val.createTime = "hidden");
        }
      }

      lastCreateTime = chatDateTime;

      // 如果是今天
      if (chatDate.getTime() === todayDate.getTime()) {
        // 如果是1分钟内
        const timeDifference = Math.abs(now - chatDateTime);
        if (timeDifference < 60 * 1000) {
          return (val.createTime = "刚刚");
        }
        return (val.createTime = val.createTime.slice(11, 16));
      }

      return (val.createTime = val.createTime.slice(0, 16));
    });
    console.log(chat.value);
    console.log(userInfoStore.userInfo);
    

    nextTick(() => {
      calDOM();
    });
  }
};
getChatContent();

// 查看笔记内容
const showBlogContent = (id) => {
  router.push({ path: "/blog", query: { id: id } });
};

// 查看用户主页
const showUserPage = (id) => {
  if (id == userInfoStore.userInfo.id) {
    router.push("/profile");
  } else {
    router.push({ path: "/userPage", query: { id: id } });
  }
};

// 发送消息
const sheetVisible = ref(false);
const messageInput = ref("");

const calDOM = () => {
  const bodyHeight = document.documentElement.clientHeight;
  const headerHeight =
    document.getElementsByClassName("header")[0].offsetHeight;
  const bottomHeight =
    document.getElementsByClassName("bottom")[0].offsetHeight;

  const containerHeight = bodyHeight - headerHeight - bottomHeight;
  const container = document.getElementsByClassName("chat-container")[0];

  container.style =
    `height:` + containerHeight + `px;padding-bottom:` + bottomHeight + `px`;
};
</script>

<template>
  <div class="header">
    <RectLeft @click="router.back()" />
    <img
      class="avatar"
      :src="chat.chatInfo.avatar"
      alt=""
      v-if="chat.chatInfo.avatar !== null && chat.chatInfo.avatar !== ''"
    />
    <img
      class="avatar"
      src="../../../../public/images/icon/default-avatar.png"
      alt=""
      v-else-if="
        chat.chatInfo.profilePicture === null ||
        chat.chatInfo.profilePicture === ''
      "
      @click="showUserPage(chat.chatInfo.userId)"
    />
    <img
      class="avatar"
      :src="chat.chatInfo.profilePicture"
      alt=""
      v-else-if="
        chat.chatInfo.profilePicture !== null &&
        chat.chatInfo.profilePicture !== ''
      "
      @click="showUserPage(chat.chatInfo.userId)"
    />
    <div
      class="name"
      v-if="chat.isSingleChat === 1"
      @click="showUserPage(chat.chatInfo.userId)"
    >
      {{ chat.chatInfo.username }}
    </div>
    <div class="name" v-if="chat.isSingleChat === 0">
      {{ chat.chatInfo.groupName }}({{ chat.chatInfo.memberNumber }})
    </div>
  </div>
  <div class="chat-container">
    <div
      class="chat-list"
      :class="
        item.fromUserId == userInfoStore.userInfo.id ? 'my-chat-list' : ''
      "
      v-for="(item, index) in chat.chatContent"
      :key="index"
    >
      <div class="chat-time" v-if="item.createTime !== 'hidden'">
        {{ item.createTime }}
      </div>
      <div class="chat-info">
        <img
          class="avatar"
          src="../../../../public/images/icon/default-avatar.png"
          alt=""
          v-if="item.profilePicture === null || item.profilePicture === ''"
          @click="showUserPage(item.fromUserId)"
        />
        <img
          class="avatar"
          :src="item.profilePicture"
          alt=""
          v-if="item.profilePicture !== null && item.profilePicture !== ''"
          @click="showUserPage(item.fromUserId)"
        />
        <div class="name-content">
          <div class="name" v-if="chat.isSingleChat === 0">
            {{ item.username }}
          </div>
          <div
            class="content text"
            :class="
              item.fromUserId == userInfoStore.userInfo.id ? 'my-text' : ''
            "
            v-if="item.type === 0"
          >
            {{ item.text }}
          </div>

          <img
            class="content image"
            :src="item.image"
            alt=""
            v-if="item.type === 1"
          />

          <div
            class="content chat-blog"
            v-if="item.type === 2"
            @click="showBlogContent(item.blogId)"
          >
            <img class="blog-cover" :src="item.blogCover" alt="" />
            <div class="chat-blog-info">
              {{ item.title }}
              <div class="avatar-name">
                <img
                  class="avatar"
                  src="../../../../public/images/icon/default-avatar.png"
                  alt=""
                  v-if="item.authorAvatar === null || item.authorAvatar === ''"
                />
                <img
                  class="avatar"
                  :src="item.authorAvatar"
                  alt=""
                  v-if="item.authorAvatar !== null && item.authorAvatar !== ''"
                />
                {{ item.author }}
              </div>
            </div>
          </div>

          <div class="reply" v-if="item.replyMsgId !== 0">
            回复@{{ item.replyUsername }}：
            <span v-if="item.replyMsgType === 0">
              {{ item.replyMsgText }}
            </span>
            <img
              v-if="item.replyMsgType === 1"
              class="reply-msg-image"
              :src="item.replyMsgImage"
              alt=""
            />
            <span v-if="item.replyMsgType === 2">
              [笔记]{{ item.replyMsgBlogTitle }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div class="bottom">
    <div class="input-button" @click="sheetVisible = true">
      <Edit />
      <div class="placeholder">发消息...</div>
    </div>
  </div>
  <div class="input-action-sheet">
    <nut-action-sheet v-model:visible="sheetVisible">
      <div class="sheet-content">
        <nut-textarea
          v-model="messageInput"
          :rows="3"
          autosize
          placeholder="发消息..."
          autofocus
        />
        <nut-button
          color="var(--theme-color)"
          :disabled="messageInput === ''"
          @click="postBlogComment"
          >发送</nut-button
        >
      </div>
    </nut-action-sheet>
  </div>
</template>

<style scoped>
.header {
  width: 100%;
  height: 8rem;
  font-size: 1.8rem;
  display: flex;
  align-items: center;
  padding: 0 2rem;
  box-sizing: border-box;
  position: fixed;
  top: 0;
}
.avatar {
  width: 5rem;
  height: 5rem;
  border-radius: 50%;
  margin-right: 1rem;
}
.header .avatar {
  width: 4rem;
  height: 4rem;
  margin-left: 1rem;
}
.chat-container {
  margin-top: 8rem;
  overflow: scroll;
}
.chat-time {
  width: 100%;
  display: flex;
  justify-content: center;
  font-size: 1.4rem;
  color: var(--theme-color-grey-text);
}
.chat-info {
  width: 100%;
  padding: 2rem;
  box-sizing: border-box;
  display: flex;
}
.my-chat-list .chat-info {
  flex-direction: row-reverse;
}
.my-chat-list .avatar {
  margin-left: 1rem;
  margin-right: 0;
}
.name-content {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}
.my-chat-list .name-content {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}
.name-content .name {
  font-size: 1.4rem;
  color: var(--theme-color-grey-text);
  margin-bottom: 1rem;
}
.name-content .content {
  font-size: 1.8rem;
}
.name-content .text {
  width: auto;
  padding: 1rem 1.5rem;
  box-sizing: border-box;
  background-color: var(--grey-bg);
  border-radius: 1rem;
}
.name-content .my-text {
  background-color: var(--theme-color);
  color: #fff;
}
.name-content .image {
  max-width: 80%;
  border-radius: 1rem;
}
.name-content .chat-blog {
  max-width: 80%;
  border-radius: 1rem;
  overflow: hidden;
  background-color: var(--grey-bg);
}
.name-content .chat-blog .blog-cover {
  width: 100%;
}
.name-content .chat-blog .chat-blog-info {
  padding: 1rem 2rem;
  box-sizing: border-box;
}
.chat-blog-info .avatar-name {
  margin-top: 1.5rem;
  display: flex;
  align-items: center;
  font-size: 1.5rem;
  color: var(--theme-color-dark-grey-text);
}
.chat-blog-info .avatar-name .avatar {
  width: 2.5rem;
  height: 2.5rem;
}
.reply {
  max-width: 60%;
  margin-top: 0.5rem;
  padding: 1rem 1.5rem;
  box-sizing: border-box;
  background-color: var(--theme-color-light-grey);
  font-size: 1.4rem;
  border-radius: 1rem;
  word-wrap: break-word;
}
.reply .reply-msg-image {
  max-width: 100%;
  border-radius: 1rem;
  margin-top: 0.5rem;
}
.bottom {
  position: fixed;
  bottom: 0;
  padding: 1rem 1.5rem;
}

.bottom {
  width: 100%;
  padding: 2rem;
  box-sizing: border-box;
  position: fixed;
  left: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 2rem;
  background-color: #fff;
  z-index: 999;
}
.bottom .input-button {
  width: 100%;
  font-size: 1.5rem;
  background-color: var(--grey-bg2);
  padding: 1rem 1.5rem;
  border-radius: 1rem;
  color: var(--theme-color-grey-text);
  display: flex;
  align-items: center;
}
.bottom .input-button .placeholder {
  margin-left: 0.5rem;
}
.sheet-content {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  padding: 1.5rem;
}
.sheet-content .nut-button {
  width: 7rem;
  margin-top: 1rem;
}

.input-action-sheet ::v-deep(.nut-popup) {
  border-radius: 0 !important;
}
</style>
