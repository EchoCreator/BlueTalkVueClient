<script setup>
import { nextTick, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
const router = useRouter();

import { HeartN, HeartFillN, Search2 } from "@nutui/icons-vue";

import {
  getBlogsService,
  likeBlogService,
  getFolloweeBlogsService,
  getNearbyBlogsService,
} from "@/api/blog";

// 计算瀑布流
import { calWaterfall } from "@/utils/calWaterfall.js";
const commendListRef = ref();
const followeeListRef = ref();
const nearbyListRef = ref();

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
let positionArr = undefined;
let index = undefined;
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
      } else {
        followeeBlogs.value = result.data.data;
        positionArr = undefined;
        index = undefined;
      }
      cycle.value++;
      minTime.value = result.data.minTime;
      offset.value = result.data.offset;
      nextTick(() => {
        setTimeout(() => {
          positionArr = calWaterfall(followeeListRef.value, positionArr, index);
          index = followeeBlogs.value.length;
        }, 200);
      });
    }
  }
};
getFolloweeBlogs();

// 获取附近的最新帖子
const nearbyCircle = ref(0);
const nearbyInfinityValue = ref(true);
const nearbyHasMore = ref(true);
const nearbyLoadMore = (done) => {
  setTimeout(() => {
    getNearbyBlogs();
    nearbyInfinityValue.value = false;
  }, 1000);
};
const nearbyRefresh = ref(false);
const nearbyRefreshFun = () => {
  setTimeout(() => {
    nearbyRefresh.value = false;
    nearbyHasMore.value = true;
    nearbyCircle.value = 0;
    getNearbyBlogs();
  }, 1000);
};

const nearbyBlogs = ref([]);
const getNearbyBlogs = async () => {
  const result = await getNearbyBlogsService(nearbyCircle.value + 1);
  if (result.code === 0) {
    // 如果result.data为空，说明已经加载完了
    if (result.data === null || result.data.length === 0) {
      nearbyHasMore.value = false;
    } else {
      // 如果是触底加载（cycle为0），则将新获取到的列表拼接到原列表上
      // 如果是上拉刷新，则覆盖原列表
      if (nearbyCircle.value !== 0) {
        nearbyBlogs.value = nearbyBlogs.value.concat(result.data);
      } else {
        nearbyBlogs.value = result.data;
      }

      nearbyCircle.value++;
      nextTick(() => {
        setTimeout(() => {
          calWaterfall(nearbyListRef.value);
        }, 200);
      });
    }
  }
};
getNearbyBlogs();

nextTick(() => {
  let bodyHeight = document.documentElement.clientHeight;
  let searchbarHeight =
    document.getElementsByClassName("nut-searchbar")[0].offsetHeight;
  let tabsTitleHeight =
    document.getElementsByClassName("nut-sticky__box")[0].offsetHeight;
  let tabbarHeight =
    document.getElementsByClassName("nut-tabbar")[0].offsetHeight;
  let tabsPaneHeight =
    bodyHeight - (searchbarHeight + tabsTitleHeight + tabbarHeight);
  let tabsPane = document.getElementsByClassName("nut-tab-pane");

  for (let i = 0; i < tabsPane.length; i++) {
    tabsPane[i].style = `height:` + tabsPaneHeight + `px`;
  }
});
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
    <nut-tab-pane title="附近" pane-key="3">
      <nut-infinite-loading
        v-model="nearbyInfinityValue"
        :has-more="nearbyHasMore"
        @load-more="nearbyLoadMore"
        load-more-txt="没有更多笔记了"
      >
        <nut-pull-refresh v-model="nearbyRefresh" @refresh="nearbyRefreshFun">
          <div class="blogs-container" ref="nearbyListRef">
            <div
              class="blog"
              v-for="(item, index) in nearbyBlogs"
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
  </nut-tabs>
</template>

<style scoped>
html,
body {
  overflow: hidden;
}
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
