<script setup>
import { ref, nextTick } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useUserInfoStore } from "@/stores/userInfo";

import {
  getFolloweeService,
  getFansService,
  getMutualFollowingService,
} from "@/api/follow";

const route = useRoute();
const rouer = useRouter();
const userInfoStore = useUserInfoStore();

const activeTab = ref(null);
const init = async () => {
  await nextTick();
  activeTab.value = route.query.type;
  getData();
};
init();

const followee = ref([]);
const fans = ref([]);
const mutualFollowings = ref([]);
const getData = async () => {
  if (activeTab.value === "1") {
    const result = await getMutualFollowingService(route.query.id);
    console.log(result.data);

    if (result.code === 0) {
      mutualFollowings.value = result.data;
    }
  } else if (activeTab.value === "2") {
    const result = await getFolloweeService(route.query.id);
    if (result.code === 0) {
      followee.value = result.data;
    }
  } else {
    const result = await getFansService(route.query.id);
    if (result.code === 0) {
      fans.value = result.data;
    }
  }
};

const changeTabs = () => {
  getData();
};

import { isFollowedService, followUserService } from "@/api/follow";
// 关注和取关
import { showToast, showDialog } from "@nutui/nutui";
const followUser = async (followUserId, isFollowedParam) => {
  if (isFollowedParam === 1) {
    showDialog({
      overlayStyle: { background: "rgba(0,0,0,0.5)" },
      content: "你确定要取消关注吗？",
      onOk: async () => {
        const result = await followUserService(followUserId, isFollowedParam);
        if (result.code === 0) {
          getData();
          showToast.text("取消关注成功", {
            size: "small",
          });
        }
      },
    });
  } else {
    const result = await followUserService(followUserId, isFollowedParam);
    if (result.code === 0) {
      getData();
      showToast.text("关注成功！", {
        size: "small",
      });
    }
  }
};
</script>

<template>
  <div class="username" v-if="route.query.id != userInfoStore.userInfo.id">
    {{ route.query.username }}
  </div>
  <nut-tabs
    :class="
      route.query.id != userInfoStore.userInfo.id ? 'username-nut-tabs' : ''
    "
    v-model="activeTab"
    auto-height
    :animated-time="0"
    sticky
    color="var(--theme-color)"
    @change="changeTabs"
  >
    <nut-tab-pane
      title="互相关注"
      pane-key="1"
      v-if="route.query.id == userInfoStore.userInfo.id"
    >
      <nut-empty
        description="你还没有互相关注的好友哦"
        v-if="mutualFollowings.length === 0"
      ></nut-empty>
      <div class="list">
        <div
          class="list-content"
          v-for="(item, index) in mutualFollowings"
          :key="index"
        >
          <div class="user-info">
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
            <div class="name-introduction">
              <div class="name">{{ item.username }}</div>
              <div
                class="introduction"
                v-if="item.introduction !== null && item.introduction !== ''"
              >
                {{ item.introduction }}
              </div>
            </div>
          </div>
          <div
            class="follow-button"
            v-if="
              item.userId != userInfoStore.userInfo.id && item.isFollowed === 0
            "
            @click="followUser(item.userId, 0)"
          >
            关注
          </div>
          <div
            class="follow-button is-followed"
            v-if="
              item.userId != userInfoStore.userInfo.id && item.isFollowed === 1
            "
            @click="followUser(item.userId, 1)"
          >
            已关注
          </div>
        </div>
      </div>
    </nut-tab-pane>
    <nut-tab-pane title="关注" pane-key="2">
      <nut-empty
        description="你还没有关注任何人"
        v-if="
          followee.length === 0 && route.query.id == userInfoStore.userInfo.id
        "
      ></nut-empty>
      <nut-empty
        description="TA还没有关注任何人"
        v-if="
          followee.length === 0 && route.query.id != userInfoStore.userInfo.id
        "
      ></nut-empty>
      <div class="list">
        <div
          class="list-content"
          v-for="(item, index) in followee"
          :key="index"
        >
          <div class="user-info">
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
            <div class="name-introduction">
              <div class="name">{{ item.username }}</div>
              <div
                class="introduction"
                v-if="item.introduction !== null && item.introduction !== ''"
              >
                {{ item.introduction }}
              </div>
            </div>
          </div>
          <div
            class="follow-button"
            v-if="
              item.userId != userInfoStore.userInfo.id && item.isFollowed === 0
            "
            @click="followUser(item.userId, 0)"
          >
            关注
          </div>
          <div
            class="follow-button is-followed"
            v-if="
              item.userId != userInfoStore.userInfo.id && item.isFollowed === 1
            "
            @click="followUser(item.userId, 1)"
          >
            已关注
          </div>
        </div>
      </div>
    </nut-tab-pane>
    <nut-tab-pane title="粉丝" pane-key="3">
      <nut-empty
        description="你还没有关注任何人"
        v-if="fans.length === 0 && route.query.id == userInfoStore.userInfo.id"
      ></nut-empty>
      <nut-empty
        description="TA还没有关注任何人"
        v-if="fans.length === 0 && route.query.id != userInfoStore.userInfo.id"
      ></nut-empty>
      <div class="list">
        <div class="list-content" v-for="(item, index) in fans" :key="index">
          <div class="user-info">
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
            <div class="name-introduction">
              <div class="name">{{ item.username }}</div>
              <div
                class="introduction"
                v-if="item.introduction !== null && item.introduction !== ''"
              >
                {{ item.introduction }}
              </div>
            </div>
          </div>
          <div
            class="follow-button"
            v-if="
              item.userId != userInfoStore.userInfo.id && item.isFollowed === 0
            "
            @click="followUser(item.userId, 0)"
          >
            关注
          </div>
          <div
            class="follow-button is-followed"
            v-if="
              item.userId != userInfoStore.userInfo.id && item.isFollowed === 1
            "
            @click="followUser(item.userId, 1)"
          >
            已关注
          </div>
        </div>
      </div>
    </nut-tab-pane>
  </nut-tabs>
</template>

<style scoped>
.username {
  position: fixed;
  top: 0;
  width: 100%;
  height: 6rem;
  font-size: 1.8rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #fff;
}
::v-deep .nut-sticky__box {
  margin-top: 0rem !important;
  padding-top: 0.5rem;
  box-sizing: border-box;
  background-color: #fff;
}
.username-nut-tabs ::v-deep(.nut-sticky__box) {
  margin-top: 4.5rem !important;
}

.list {
  display: flex;
  flex-direction: column;
  font-size: 1.5rem;
}
.list .list-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 2rem;
  box-sizing: border-box;
}
.list .list-content .user-info {
  display: flex;
  align-items: center;
}
.list .list-content .avatar {
  width: 5rem;
  border-radius: 50%;
  margin-right: 1rem;
}
.list .list-content .name-introduction {
  height: 5rem;
  display: flex;
  flex-direction: column;
  justify-content: space-evenly;
}
.list .list-content .name {
  font-size: 1.8rem;
}
.list .list-content .introduction {
  width: 20rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--theme-color-grey-text);
}
</style>
