<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
const router = useRouter();

import { HeartN, HeartFillN, Search2 } from "@nutui/icons-vue";

import { getBlogsService, likeBlogService } from "@/api/blog";

// 获取用户帖子
const tabValue = ref(null);
const blogs = ref([]);
const getBlogs = async () => {
  const result = await getBlogsService();
  if (result.code === 0) {
    blogs.value = result.data;
    tabValue.value = "1";
  }
};
getBlogs();

// 查看帖子详细内容
const showBlogContent = (id) => {
  router.push({ path: "/blog", query: { id: id } });
};

// 点赞帖子
const likeBlog = async (blogId, isLiked, index) => {
  const result = await likeBlogService(blogId);
  if (result.code === 0) {
    if (isLiked === 0) {
      blogs.value[index].isLiked = 1;
      blogs.value[index].likes = blogs.value[index].likes+1;
    } else {
      blogs.value[index].isLiked = 0;
      blogs.value[index].likes = blogs.value[index].likes-1;
    }
  }
};
</script>

<template>
  <nut-searchbar
    v-model="inputValue"
    input-background="#dbdbdb"
    @clear="getCommodity"
  >
    <template #leftin>
      <Search2 />
    </template>
    <template #rightout>
      <div class="search-button" @click="getCommodity">搜索</div>
    </template>
  </nut-searchbar>

  <nut-tabs v-model="tabValue" color="var(--theme-color)" sticky>
    <nut-tab-pane title="推荐" pane-key="1">
      <div class="blogs-container">
        <div
          class="blog"
          v-for="(item, index) in blogs"
          :key="item.id"
          @click="showBlogContent(item.id)"
        >
          <img class="blog-image" :src="item.images.split(',')[0]" alt="" />
          <div class="blog-content">
            <div class="title">{{ item.title }}</div>
            <div class="profile">
              <div class="avatar-name">
                <img
                  class="avatar"
                  src="../../../public/images/icon/default-avatar.png"
                  alt=""
                  v-if="
                    item.profilePicture === null || item.profilePicture === ''
                  "
                />
                <img
                  class="avatar"
                  :src="item.profilePicture"
                  alt=""
                  v-if="
                    item.profilePicture !== null && item.profilePicture !== ''
                  "
                />
                <div class="name">{{ item.username }}</div>
              </div>
              <div
                class="likes"
                @click.stop="likeBlog(item.id, item.isLiked, index)"
              >
                <HeartN v-if="item.isLiked === 0" />
                <HeartFillN
                  color="var(--theme-color-red)"
                  v-if="item.isLiked === 1"
                />
                <div class="likes-num">{{ item.likes }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nut-tab-pane>
    <nut-tab-pane title="关注" pane-key="2"> 关注 </nut-tab-pane>
  </nut-tabs>
</template>

<style scoped>
.nut-searchbar {
  padding-top: 2rem;
  position: fixed;
  top: 0;
  z-index: 99;
}
.search-button {
  background-color: var(--theme-color);
  color: #fff;
  padding: 0.5rem 0.8rem;
  border-radius: 0.5rem;
}
.nut-tab-pane {
  padding: 0;
}
</style>
