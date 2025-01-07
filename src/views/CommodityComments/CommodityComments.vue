<script setup>
import { ref } from "vue";
import { useRouter, useRoute } from "vue-router";

import { getCommodityCommentsService } from "@/api/commodity";

import { useUserInfoStore } from "@/stores/userInfo";

const route = useRoute();
const router = useRouter();
const useUserInfo = useUserInfoStore();

// 获取所有评论
const comments = ref([]);
const score = ref(0);
const starRate = ref([
  { star: 1, num: 0 },
  { star: 2, num: 0 },
  { star: 3, num: 0 },
  { star: 4, num: 0 },
  { star: 5, num: 0 },
]);
const getCommodityComments = async () => {
  const result = await getCommodityCommentsService(route.query.id);
  if (result.code === 0) {
    comments.value = result.data;
    score.value = 0;
    starRate.value = [
      { star: 1, num: 0 },
      { star: 2, num: 0 },
      { star: 3, num: 0 },
      { star: 4, num: 0 },
      { star: 5, num: 0 },
    ];
    if (comments.value.length !== 0) {
      comments.value.forEach((value) => {
        score.value += value.score;
        starRate.value[value.score - 1].num += 1;
      });
      starRate.value = starRate.value.reverse();
      score.value /= comments.value.length;
      score.value = score.value.toFixed(1);
    }
  }
};
getCommodityComments();

// 进入用户主页
const showUserInfo = (id) => {
  if (useUserInfo.userInfo.id === id) {
    router.push("/profile");
  } else {
    router.push({ path: "/userPage", query: { id: id } });
  }
};
</script>

<template>
  <div class="header">
    <div class="data">
      <div>评论数</div>
      <div v-if="comments.length !== 0" class="data-num">
        {{ comments.length }}
      </div>
      <div v-if="comments.length === 0" class="data-num">0</div>
    </div>
    <div class="data">
      <div>综合评分</div>
      <nut-rate v-model="score" readonly size="1.3rem" spacing="5" allow-half />
      <div v-if="comments.length !== 0" class="data-num score">{{ score }}</div>
      <div v-if="comments.length === 0" class="data-num-0">暂无评分</div>
    </div>
    <div class="statistic">
      <div class="content" v-for="item in starRate" :key="item.star">
        <nut-rate v-model="item.star" readonly size="1.3rem" spacing="5" />
        <nut-progress
          :percentage="(item.num / comments.length).toFixed(2) * 100"
          :show-text="false"
          v-if="comments.length !== 0"
        />
        <nut-progress
          :percentage="0"
          :show-text="false"
          v-if="comments.length === 0"
        />
      </div>
    </div>
  </div>
  <div class="comment-info" @click="showComments">
    <nut-empty
      description="这里还没有评论，你来试着发一条吧"
      v-if="comments.length === 0"
    ></nut-empty>
    <div class="comment-container" v-for="item in comments" :key="item.id">
      <div class="customer" @click="showUserInfo(item.userId)">
        <img
          class="avatar"
          src="../../../public/images/icon/default-avatar.png"
          alt=""
          v-if="item.profilePicture === null || item.profilePicture === ''"
        />
        <img
          class="avatar"
          :src="item.profilePicture"
          alt=""
          v-if="item.profilePicture !== null && item.profilePicture !== ''"
        />
        <div class="username-date">
          <div>{{ item.username }}</div>
          <div>{{ item.createTime }}</div>
        </div>
      </div>
      <nut-rate v-model="item.score" readonly size="1.3rem" spacing="5" />
      <div class="content">{{ item.content }}</div>
    </div>
  </div>
</template>

<style scoped>
.header {
  display: flex;
  justify-content: space-between;
  padding: 2rem;
  font-size: 1.5rem;
}
.header .data .data-num {
  font-size: 2.5rem;
  font-weight: 600;
}
.header .data .data-num-0 {
  font-size: 1.8rem;
}
.header .data .score {
  color: var(--theme-color-red);
  font-style: italic;
}
.header .statistic {
  width: 50%;
}
.header .statistic .content {
  display: flex;
  align-items: center;
  margin-bottom: 0.5rem;
}
.header .statistic .content .nut-rate {
  margin-right: 0.5rem;
}
.comment-info {
  padding: 0 2rem;
  box-sizing: border-box;
}
.comment-info .comment-container {
  padding: 2rem 0;
  font-size: 1.6rem;
  border-bottom: 0.1rem solid #b8b6b6;
}
.comment-info .comment-container:last-child {
  border-bottom: 0;
}
.comment-info .customer {
  display: flex;
  align-items: center;
  margin-bottom: 0.5rem;
  color: #707070;
}
.avatar {
  width: 4.5rem;
  border-radius: 50%;
  margin-right: 1rem;
}
.comment-info .content {
  margin-top: 0.5rem;
}
</style>
