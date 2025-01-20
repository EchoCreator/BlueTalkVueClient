<script setup>
import { nextTick, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
const router = useRouter();

import { HeartN, HeartFillN, Search2 } from "@nutui/icons-vue";

import {
  getBlogsService,
  likeBlogService,
  getFolloweeBlogsService,
} from "@/api/blog";

// 计算瀑布流
import { calWaterfall } from "@/utils/calWaterfall.js";
const commendListRef = ref();
const followeeListRef = ref();

// 获取用户帖子
const tabValue = ref(null);
const blogs = ref([]);
const getBlogs = async () => {
  const result = await getBlogsService();
  if (result.code === 0) {
    blogs.value = result.data;
    tabValue.value = "1";
    nextTick(() => {
      setTimeout(() => {
        calWaterfall(commendListRef.value);
      }, 200);
    });
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
    if (tabValue.value === "1") {
      if (isLiked === 0) {
        blogs.value[index].isLiked = 1;
        blogs.value[index].likes = blogs.value[index].likes + 1;
      } else {
        blogs.value[index].isLiked = 0;
        blogs.value[index].likes = blogs.value[index].likes - 1;
      }
    }
    if (tabValue.value === "2") {
      if (isLiked === 0) {
        followeeBlogs.value[index].isLiked = 1;
        followeeBlogs.value[index].likes = followeeBlogs.value[index].likes + 1;
      } else {
        followeeBlogs.value[index].isLiked = 0;
        followeeBlogs.value[index].likes = followeeBlogs.value[index].likes - 1;
      }
    }
  }
};

// 获取关注用户的最新帖子
const cycle = ref(0);
const infinityValue = ref(true);
const hasMore = ref(true);
const loadMore = (done) => {
  setTimeout(() => {
    getFolloweeBlogs();
    infinityValue.value = false;
  }, 1000);
};
const refresh = ref(false);
const refreshFun = () => {
  setTimeout(() => {
    refresh.value = false;
    hasMore.value = true;
    cycle.value = 0;
    minTime.value = Date.now();
    offset.value = 0;
    getFolloweeBlogs();
  }, 1000);
};

const followeeBlogs = ref([]);
const minTime = ref(Date.now());
const offset = ref(0);
const getFolloweeBlogs = async () => {
  const result = await getFolloweeBlogsService(minTime.value, offset.value);
  if (result.code === 0) {
    // 如果result.data为空，说明已经加载完了
    if (result.data === null || result.data.length === 0) {
      hasMore.value = false;
    } else {
      // 如果是触底加载（cycle为0），则将新获取到的列表拼接到原列表上
      // 如果是上拉刷新，则覆盖原列表
      if (cycle.value !== 0) {
        followeeBlogs.value = followeeBlogs.value.concat(result.data.data);
        console.log("111", result.data.data);
        console.log("222", followeeBlogs.value);
      } else {
        followeeBlogs.value = result.data.data;
      }
      cycle.value++;
      minTime.value = result.data.minTime;
      offset.value = result.data.offset;
      nextTick(() => {
        setTimeout(() => {
          calWaterfall(followeeListRef.value);
        }, 200);
      });
    }
  }
};
getFolloweeBlogs();
</script>

<template>
  <nut-searchbar
    v-model="inputValue"
    input-background="var(--grey-bg2)"
    @clear="getCommodity"
  >
    <template #leftin>
      <Search2 />
    </template>
    <template #rightout>
      <div class="search-button" @click="getCommodity">搜索</div>
    </template>
  </nut-searchbar>

  <nut-tabs auto-height v-model="tabValue" color="var(--theme-color)" sticky>
    <nut-tab-pane title="推荐" pane-key="1">
      <div class="blogs-container" ref="commendListRef">
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
    <nut-tab-pane title="关注" pane-key="2">
      <nut-infinite-loading
        v-model="infinityValue"
        :has-more="hasMore"
        @load-more="loadMore"
        load-more-txt="没有更多笔记了哦，快去催更吧"
      >
        <nut-pull-refresh v-model="refresh" @refresh="refreshFun">
          <div class="blogs-container" ref="followeeListRef">
            <div
              class="blog"
              v-for="(item, index) in followeeBlogs"
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
                        item.profilePicture === null ||
                        item.profilePicture === ''
                      "
                    />
                    <img
                      class="avatar"
                      :src="item.profilePicture"
                      alt=""
                      v-if="
                        item.profilePicture !== null &&
                        item.profilePicture !== ''
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
        </nut-pull-refresh>
      </nut-infinite-loading>
    </nut-tab-pane>
    <nut-tab-pane title="附近" pane-key="3"> 附近 </nut-tab-pane>
  </nut-tabs>
</template>

<style scoped>
.test {
  padding: 12px 0 12px 20px;
  border-top: 1px solid #eee;
}
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
