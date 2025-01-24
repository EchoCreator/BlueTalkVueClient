<script setup>
import { nextTick, onMounted, onUnmounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useUserInfoStore } from "@/stores/userInfo";
import { RectLeft, Edit } from "@nutui/icons-vue";

const route = useRoute();
const router = useRouter();
const userInfoStore = useUserInfoStore();

import { getChatContentService, sendMessageService } from "@/api/chat";

const chat = ref({
  chatInfo: {},
  chatContent: [],
  isSingleChat: 1,
});
const lastCreateTime = ref(null);
const getChatContent = async () => {
  const result = await getChatContentService(
    route.query.id,
    route.query.isSingleChat
  );
  if (result.code === 0) {
    chat.value = result.data;
    chat.value.chatContent = chat.value.chatContent.filter((val) => {
      const time = calTime(val.createTime);
      return (val.createTime = time);
    });

    nextTick(() => {
      calDOM();
      scrollBottom();
    });
  }
};
getChatContent();

const calTime = (time) => {
  time = time.replace(/T/, " ").replace(/-/g, "/");
  const chatDateTime = new Date(time);
  const chatDate = new Date(time.split(" ")[0]);
  const now = new Date();
  const todayDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  // 如果与上一条消息间隔不超过2分钟
  if (lastCreateTime.value !== null) {
    const lastTimeDifference = Math.abs(chatDateTime - lastCreateTime.value);
    lastCreateTime.value = chatDateTime;
    if (lastTimeDifference < 2 * 60 * 1000) {
      return "hidden";
    }
  }

  lastCreateTime.value = chatDateTime;

  // 如果是今天
  if (chatDate.getTime() === todayDate.getTime()) {
    // 如果是1分钟内
    const timeDifference = Math.abs(now - chatDateTime);
    if (timeDifference < 60 * 1000) {
      return "刚刚";
    }
    return time.slice(11, 16);
  }

  return time.slice(0, 16);
};

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
const replyMsgId = ref(0);
const sendMessage = async () => {
  let toUserId = 0;
  let groupId = parseInt(route.query.id);
  if (route.query.isSingleChat == 1) {
    toUserId = parseInt(route.query.id);
    groupId = 0;
  }
  const chatParam = {
    toUserId: toUserId,
    groupId: groupId,
    isSingleChat: parseInt(route.query.isSingleChat),
    type: 0,
    text: messageInput.value,
    image: null,
    blogId: 0,
    replyMsgId: replyMsgId.value,
  };
  const result = await sendMessageService(chatParam);
  if (result.code === 0) {
    sheetVisible.value = false;
    messageInput.value = "";
    nextTick(() => {
      scrollBottom();
    });
  }
};

const showInputSheet = (isReply) => {
  sheetVisible.value = true;
  if (!isReply) {
    if (replyMsgId.value !== 0) {
      messageInput.value = "";
    }
    replyMsgId.value = 0;
  }
};

// 回复消息
const popoverVisible = ref(false);
const popoverRef = ref();
const replyMsgType = ref(0);
const replyMsgUsername = ref("");
const replyMsgText = ref(0);
const replyMsgBlogTitle = ref("");
const showPopover = (id, type, username, text, title, index) => {
  popoverVisible.value = true;
  if (replyMsgId.value !== id) {
    messageInput.value = "";
  }
  replyMsgId.value = id;
  replyMsgType.value = type;
  replyMsgUsername.value = username;
  replyMsgText.value = text;
  replyMsgBlogTitle.value = title;

  if (popoverVisible.value) {
    const msgTop = document
      .getElementsByClassName("msg-content")
      [index].getBoundingClientRect().top;

    console.log(
      document.getElementsByClassName("msg-content")[index].offsetTop
    );

    const msgLeft =
      document.getElementsByClassName("msg-content")[index].offsetLeft;
    const msgWidth =
      document.getElementsByClassName("content")[index].offsetWidth;
    nextTick(() => {
      const popoverHeight = popoverRef.value.offsetHeight;
      const popoverWidth = popoverRef.value.offsetWidth;
      const popoverTop = msgTop - popoverHeight - 8;
      const popoverLeft = msgLeft + msgWidth / 2 - popoverWidth / 2;
      popoverRef.value.style =
        `top:` + popoverTop + `px;left:` + popoverLeft + `px`;
    });
  }
};

// 长按出现popover
let blogTimeOutEvent;
let isPressAndHold = false;
const goTouchStart = (id, type, username, text, title, index) => {
  isPressAndHold = false;
  clearTimeout(blogTimeOutEvent);
  blogTimeOutEvent = setTimeout(() => {
    // 如果点击超过了600ms
    isPressAndHold = true;
    showPopover(id, type, username, text, title, index);
  }, 600);
};

const goTouchEnd = (type, blogId) => {
  clearTimeout(blogTimeOutEvent);
  // 如果长按小于600ms
  if (!isPressAndHold) {
    popoverVisible.value = false;
    if (type == 2) {
      showBlogContent(blogId);
    }
  }
};

// 点击其他元素关闭popover
const closePopover = () => {
  popoverVisible.value = false;
};

onMounted(() => {
  document.addEventListener("click", closePopover);
});
onUnmounted(() => {
  document.removeEventListener("click", closePopover);
});

// 接收websocket传来的消息
import { useWebSocket } from "@vueuse/core";

// let key = "user" + route.query.id;
// if (route.query.isSingleChat == 0) {
//   key = "group" + route.query.id;
// }

const { status, data, send, open, close } = useWebSocket(
  "ws://localhost:8080/ws/chat/" + userInfoStore.userInfo.id
);

watch(data, () => {
  //获取到的数据为data.value
  const wsData = JSON.parse(data.value);
  const newChat = JSON.parse(JSON.stringify(chat.value));
  wsData.createTime = calTime(wsData.createTime);
  newChat.chatContent.push(wsData);
  chat.value = newChat;
});

// 进入聊天界面和发消息时，让滚动条保持在底部
const scrollBottom = () => {
  const container = document.getElementsByClassName("chat-container")[0];
  container.scrollTop = container.scrollHeight;
};

// 计算容器大小
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
  <div class="popover" v-show="popoverVisible" ref="popoverRef">
    <div class="popover-item">
      <img src="../../../../public/images/icon/copy.png" alt="" />
      复制
    </div>
    <div class="popover-item" @click="showInputSheet(true)">
      <img src="../../../../public/images/icon/reply.png" alt="" />
      回复
    </div>
    <div class="popover-item">
      <img src="../../../../public/images/icon/repost.png" alt="" />
      转发
    </div>
  </div>
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
            class="msg-content"
            @touchstart.prevent="
              goTouchStart(
                item.id,
                item.type,
                item.username,
                item.text,
                item.title,
                index
              )
            "
            @touchend.prevent="goTouchEnd(item.type, item.blogId)"
          >
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

            <div class="content chat-blog" v-if="item.type === 2">
              <img class="blog-cover" :src="item.blogCover" alt="" />
              <div class="chat-blog-info">
                {{ item.title }}
                <div class="avatar-name">
                  <img
                    class="avatar"
                    src="../../../../public/images/icon/default-avatar.png"
                    alt=""
                    v-if="
                      item.authorAvatar === null || item.authorAvatar === ''
                    "
                  />
                  <img
                    class="avatar"
                    :src="item.authorAvatar"
                    alt=""
                    v-if="
                      item.authorAvatar !== null && item.authorAvatar !== ''
                    "
                  />
                  {{ item.author }}
                </div>
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
    <div class="input-button" @click="showInputSheet(false)">
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
        <div class="reply-msg-container" v-if="replyMsgId !== 0">
          回复@{{ replyMsgUsername }}：
          <span v-if="replyMsgType === 0">{{ replyMsgText }}</span>
          <span v-if="replyMsgType === 1">[图片]</span>
          <span v-if="replyMsgType === 2">[笔记]{{ replyMsgBlogTitle }}</span>
        </div>
        <nut-button
          color="var(--theme-color)"
          :disabled="messageInput === ''"
          @click="sendMessage"
          >发送</nut-button
        >
      </div>
    </nut-action-sheet>
  </div>
</template>

<style scoped>
.popover {
  width: 15rem;
  height: 6rem;
  position: absolute;
  background-color: var(--grey-bg3);
  display: flex;
  align-items: center;
  justify-content: space-evenly;
  border-radius: 1rem;
  font-size: 1.4rem;
  color: #fff;
  z-index: 999;
}
.popover::after {
  content: "";
  width: 0;
  height: 0;
  position: absolute;
  bottom: -1.5rem;
  border: 0.8rem solid transparent;
  border-top-color: var(--grey-bg3);
}
.popover .popover-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.popover img {
  width: 2.5rem;
}

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
.msg-content {
  position: relative;
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

.reply-msg-container {
  width: 100%;
  background-color: var(--grey-bg);
  font-size: 1.4rem;
  padding: 1rem;
  box-sizing: border-box;
  margin-top: 1rem;
  border-radius: 1rem;
  color: var(--theme-color-grey-text);
}
</style>
