<script setup>
import { ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useUserInfoStore } from "@/stores/userInfo";

import {
  Edit,
  HeartFill2,
  HeartFill1,
  Star,
  StarFillN,
  Message,
  Location2,
} from "@nutui/icons-vue";

import {
  getBlogContentService,
  likeBlogService,
  favoriteBlogService,
  postBlogCommentService,
} from "@/api/blog";

const route = useRoute();
const router = useRouter();

const blogContent = ref({
  blog: {
    images: "",
    tags: "",
    profilePicture: "",
  },
});
const getBlogContent = async () => {
  const result = await getBlogContentService(route.query.id);
  if (result.code === 0) {
    blogContent.value = result.data;
  }
};
getBlogContent();

const swiperIndex = ref(1);
const changeSwiper = (index) => {
  swiperIndex.value = index + 1;
};

// 进入用户主页
const userInfoStore = useUserInfoStore();
const showUserInfo = (id) => {
  if (userInfoStore.userInfo.id === id) {
    router.push("/profile");
  } else {
    router.push({ path: "/userPage", query: { id: id } });
  }
};

// 点赞
const likeBlog = async () => {
  const result = await likeBlogService(route.query.id);
  if (result.code === 0) {
    getBlogContent();
  }
};

// 收藏
const favoriteBlog = async () => {
  const result = await favoriteBlogService(route.query.id);
  if (result.code === 0) {
    getBlogContent();
  }
};

// 发表评论
const sheetVisible = ref(false);
const parentIdRef = ref(0);
const replyIdRef = ref(0);
const replyUserIdRef = ref(0);
const commentInput = ref("");
const placeholder = ref("友善是美好的开始");
const showSheet = (parentId, replyId, replyUserId, replyUsername) => {
  if (replyUsername !== null) {
    placeholder.value = "回复给@" + replyUsername;
  } else {
    placeholder.value = "友善是美好的开始";
  }
  if (parentIdRef.value !== parentId || replyIdRef.value !== replyId) {
    commentInput.value = "";
  }
  parentIdRef.value = parentId;
  replyIdRef.value = replyId;
  replyUserIdRef.value = replyUserId;
  sheetVisible.value = true;
};

import { showToast } from "@nutui/nutui";
const postBlogComment = async () => {
  const blogComment = {
    blogId: route.query.id,
    parentId: parentIdRef.value,
    replyId: replyIdRef.value,
    replyUserId: replyUserIdRef.value,
    content: commentInput.value,
  };
  const result = await postBlogCommentService(blogComment);
  if (result.code === 0) {
    sheetVisible.value = false;
    commentInput.value = "";
    showToast.text("回复发送成功", {
      size: "small",
    });
    getBlogContent();
  }
};
</script>

<template>
  <div class="writer-info">
    <div class="avatar-name" @click="showUserInfo(blogContent.blog.userId)">
      <img
        class="avatar"
        src="../../../public/images/icon/default-avatar.png"
        alt=""
        v-if="
          blogContent.blog.profilePicture === null ||
          blogContent.blog.profilePicture === ''
        "
      />
      <img
        class="avatar"
        :src="blogContent.blog.profilePicture"
        alt=""
        v-if="
          blogContent.blog.profilePicture !== null &&
          blogContent.blog.profilePicture !== ''
        "
      />
      <div class="name">
        {{ blogContent.blog.username }}
      </div>
    </div>
    <div class="follow-button">关注</div>
  </div>
  <div class="blog">
    <nut-swiper :loop="false" height="auto" @change="changeSwiper">
      <nut-swiper-item
        v-for="(item, index) in blogContent.blog.images.split(',')"
        :key="index"
      >
        <img
          :src="item"
          alt=""
          style="width: 100%; height: 100%"
          draggable="false"
        />
      </nut-swiper-item>
      <template #page>
        <div class="swiper-pagination">
          {{ swiperIndex }}/{{ blogContent.blog.images.split(",").length }}
        </div>
      </template>
    </nut-swiper>
    <div class="blog-content">
      <div class="title">{{ blogContent.blog.title }}</div>
      <div class="content">{{ blogContent.blog.content }}</div>
      <div class="tags" v-if="blogContent.blog.tags!==null">
        <div
          class="tag"
          v-for="(item, index) in blogContent.blog.tags.split(',')"
          :key="index"
        >
          #{{ item }}
        </div>
      </div>
      <div class="address" v-if="blogContent.blog.address !== null">
        <Location2 />
        <div>{{ blogContent.blog.address }}</div>
      </div>
      <div class="time">{{ blogContent.blog.createTime }}</div>
      <div class="underline"></div>
    </div>
  </div>
  <div class="comments">
    <div class="num">共 {{ blogContent.blog.comments }} 条评论</div>
    <div
      class="comment-card"
      v-for="item in blogContent.comments"
      :key="item.id"
    >
      <div class="comment-content">
        <img
          class="avatar"
          src="../../../public/images/icon/default-avatar.png"
          alt=""
          v-if="item.profilePicture === null || item.profilePicture === ''"
          @click="showUserInfo(item.userId)"
        />
        <img
          class="avatar"
          :src="item.profilePicture"
          alt=""
          v-if="item.profilePicture !== null && item.profilePicture !== ''"
          @click="showUserInfo(item.userId)"
        />
        <div class="name-content">
          <div class="name" @click="showUserInfo(item.userId)">
            {{ item.username }}
            <span
              class="writer-label"
              v-if="blogContent.blog.userId === item.userId"
              >作者</span
            >
            <span
              class="me-label"
              v-if="userInfoStore.userInfo.id === item.userId"
              >我</span
            >
          </div>
          <div
            class="content"
            @click="showSheet(item.id, 0, item.userId, item.username)"
          >
            {{ item.content }}
          </div>
          <div class="time">{{ item.createTime.slice(0, 16) }}</div>
          <div
            class="reply-comments"
            v-for="citem in item.childrenComments"
            :key="citem.id"
          >
            <div class="comment-content reply-comment-content">
              <img
                class="avatar"
                src="../../../public/images/icon/default-avatar.png"
                alt=""
                v-if="
                  citem.profilePicture === null || citem.profilePicture === ''
                "
                @click="showUserInfo(citem.userId)"
              />
              <img
                class="avatar"
                :src="citem.profilePicture"
                alt=""
                v-if="
                  citem.profilePicture !== null && citem.profilePicture !== ''
                "
                @click="showUserInfo(citem.userId)"
              />
              <div class="name-content">
                <div class="name" @click="showUserInfo(citem.userId)">
                  {{ citem.username }}
                  <span
                    class="writer-label"
                    v-if="blogContent.blog.userId === citem.userId"
                    >作者</span
                  >
                  <span
                    class="me-label"
                    v-if="userInfoStore.userInfo.id === citem.userId"
                    >我</span
                  >
                </div>
                <div
                  class="content"
                  @click="
                    showSheet(item.id, citem.id, citem.userId, citem.username)
                  "
                >
                  <span v-if="citem.replyUsername !== null"
                    >回复<span
                      class="reply-username"
                      @click.stop="showUserInfo(citem.replyUserId)"
                      >{{ citem.replyUsername }}</span
                    >:</span
                  >{{ citem.content }}
                </div>
                <div class="time">{{ citem.createTime.slice(0, 16) }}</div>
              </div>
              <div class="likes">
                <HeartFill2 />
                <div>{{ citem.likes }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="likes">
        <HeartFill2 />
        <div>{{ item.likes }}</div>
      </div>
    </div>
  </div>
  <div class="bottom">
    <div
      class="input-button interaction-button"
      @click="showSheet(0, 0, 0, null)"
    >
      <Edit />
      <div class="placeholder">友善是美好的开始</div>
    </div>
    <div class="interaction-button" @click="likeBlog">
      <HeartFill2 v-if="blogContent.blog.isLiked === 0" />
      <HeartFill1
        color="var(--theme-color-red)"
        v-if="blogContent.blog.isLiked === 1"
      />
      <div>{{ blogContent.blog.likes }}</div>
    </div>
    <div class="interaction-button" @click="favoriteBlog">
      <Star v-if="blogContent.blog.isFavorite === 0" />
      <StarFillN
        color="var(--theme-color-yellow)"
        v-if="blogContent.blog.isFavorite === 1"
      />
      <div>{{ blogContent.blog.favorites }}</div>
    </div>
    <div class="interaction-button">
      <Message />
      <div>{{ blogContent.blog.comments }}</div>
    </div>
  </div>
  <nut-action-sheet v-model:visible="sheetVisible">
    <div class="sheet-content">
      <nut-textarea
        v-model="commentInput"
        :rows="3"
        autosize
        :placeholder="placeholder"
        autofocus
      />
      <nut-button
        color="var(--theme-color)"
        :disabled="commentInput === ''"
        @click="postBlogComment"
        >发送</nut-button
      >
    </div>
  </nut-action-sheet>
</template>

<style scoped>
.writer-info {
  width: 100%;
  height: 7rem;
  top: 0;
  left: 0;
  position: fixed;
  z-index: 999;
  background-color: #fff;
  padding: 0 2rem;
  box-sizing: border-box;
  font-size: 1.6rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.writer-info .avatar-name {
  display: flex;
  align-items: center;
}
.writer-info .avatar {
  width: 4.5rem;
  border-radius: 50%;
  margin-right: 1rem;
}
.writer-info .follow-button {
  padding: 0.5rem 1.5rem;
  box-sizing: border-box;
  border-radius: 2rem;
  color: var(--theme-color-red);
  border: 0.1rem solid var(--theme-color-red);
}

.swiper-pagination {
  position: absolute;
  top: 2rem;
  right: 2rem;
  padding: 0.5rem 1rem;
  box-sizing: border-box;
  background: rgba(0, 0, 0, 0.33);
  border-radius: 2rem;
  text-align: center;
  color: #fff;
  font-size: 14px;
}
.blog {
  width: 100%;
  margin: 0.3rem 0;
  margin-top: 7rem;
  border-radius: 0.5rem;
  overflow: hidden;
}
.blog .blog-image {
  width: 100%;
}
.blog .blog-content {
  padding: 1.5rem;
  box-sizing: border-box;
}
.blog .title {
  font-size: 2rem;
  font-weight: 600;
}
.blog .content {
  font-size: 1.8rem;
  margin-top: 1rem;
}
.blog .tags {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  margin-top: 1rem;
}
.blog .tags .tag {
  font-size: 1.8rem;
  margin-right: 1rem;
  color: var(--tag-color);
}
.blog .underline {
  width: 100%;
  height: 0.05rem;
  background-color: var(--theme-color-grey-underline);
  margin-top: 2rem;
}
.blog .time {
  font-size: 1.6rem;
  margin-top: 1rem;
  color: var(--theme-color-grey-text);
}
.blog .address {
  width: 100%;
  padding: 0.8rem 1.5rem;
  box-sizing: border-box;
  border-radius: 0.8rem;
  background-color: var(--grey-bg);
  font-size: 1.8rem;
  margin-top: 1rem;
  display: flex;
  align-items: center;
}
.blog .address div{
  margin-left: 0.5rem;
  position: relative;
  bottom: 0.1rem;
}

.comments {
  width: 100%;
  padding: 0 1rem;
  padding-left: 2rem;
  padding-bottom: 8rem;
  box-sizing: border-box;
}
.comments .num {
  font-size: 1.6rem;
  color: var(--theme-color-grey-text);
  margin-bottom: 2rem;
}
.comments .comment-card {
  width: 100%;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  font-size: 1.6rem;
  position: relative;
}
.comments .comment-content {
  width: 100%;
  display: flex;
  align-items: flex-start;
  margin-bottom: 2rem;
}
.comments .reply-comment-content {
  position: relative;
}
.comments .comment-content .avatar {
  width: 4.5rem;
  border-radius: 50%;
  flex: none;
  margin-right: 1rem;
}
.comments .name-content {
  width: 100%;
}
.comments .name-content .name,
.comments .name-content .content {
  width: 70%;
}
.comments .comment-content .name {
  color: var(--theme-color-grey-text);
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
}
.comments .writer-label,
.comments .me-label {
  background-color: var(--theme-color-red);
  color: #fff;
  padding: 0.2rem 0.8rem;
  box-sizing: border-box;
  border-radius: 0.8rem;
  font-size: 1.3rem;
  margin-left: 0.8rem;
}
.comments .me-label {
  background-color: var(--theme-color);
}
.comments .reply-comments {
  margin-top: 2rem;
}
.comments .reply-username {
  color: var(--theme-color-grey-text) !important;
}
.comments .likes {
  width: 10%;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: absolute;
  top: 0;
  right: 0;
}
.comments .likes div {
  margin-top: 0.5rem;
}
.comments .time {
  margin-top: 0.5rem;
  color: var(--theme-color-grey-text);
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
.bottom .interaction-button {
  display: flex;
  align-items: center;
}
.bottom .interaction-button div {
  margin-left: 0.5rem;
}
.bottom .input-button {
  font-size: 1.5rem;
  background-color: var(--grey-bg2);
  padding: 1rem 1.5rem;
  border-radius: 2rem;
  color: var(--theme-color-grey-text);
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
</style>
