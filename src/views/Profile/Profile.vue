<script setup>
import { ref } from "vue";

import { getUserInfoService } from "@/api/user";
import { getUsersCommodityService } from "@/api/commodity";

import { useUserInfoStore } from "@/stores/userInfo";
const userInfoStore = useUserInfoStore();

// 获得用户信息
const userInfo = ref({});

const getUserInfo = async () => {
  const result = await getUserInfoService();
  if (result.code === 0) {
    userInfo.value = result.data;
    userInfoStore.setUserInfo(result.data);
    getUsersCommodity();
  }
};
getUserInfo();

const activeTab = ref("1");

// 获得用户店铺商品
const commodityList = ref([]);
const getUsersCommodity = async () => {
  const result = await getUsersCommodityService(userInfo.value.id);
  if (result.code === 0) {
    if (result.data !== null) {
      commodityList.value = result.data;
    }
  }
};

// const changeTabs = () => {
//   if (activeTab.value === "1") {
//     getUsersCommodity();
//   }
// };

// 跳转商品详情页
import { useRouter } from "vue-router";
const router = useRouter();
const showCommodityInfo = (id) => {
  router.push({ path: "/commodityInfo", query: { id: id } });
};
</script>

<template>
  <div class="header">
    <div class="info">
      <img
        class="avatar"
        src="../../../public/images/icon/default-avatar.png"
        alt=""
        v-if="
          userInfo.profilePicture === null || userInfo.profilePicture === ''
        "
      />
      <img
        class="avatar"
        :src="userInfo.profilePicture"
        alt=""
        v-if="
          userInfo.profilePicture !== null && userInfo.profilePicture !== ''
        "
      />
      <div class="name">{{ userInfo.username }}</div>
    </div>
    <div class="introduction">{{ userInfo.introduction }}</div>
    <div class="tags">
      <div
        class="gender-age tag"
        v-if="userInfo.gender !== null || userInfo.age !== null"
      >
        <img
          src="../../../public/images/icon/male.png"
          alt=""
          v-if="userInfo.gender === 0"
          class="gender"
        />
        <img
          src="../../../public/images/icon/female.png"
          alt=""
          v-if="userInfo.gender === 1"
          class="gender"
        />
        <div class="age" v-if="userInfo.age !== null">{{ userInfo.age }}岁</div>
      </div>
      <div
        class="city tag"
        v-if="userInfo.city !== null && userInfo.city !== ''"
      >
        {{ userInfo.city }}
      </div>
      <div
        class="school tag"
        v-if="userInfo.school !== null && userInfo.school !== ''"
      >
        {{ userInfo.school }}
      </div>
    </div>
    <div class="data">
      <div class="followee data-content">
        <div class="number">{{ userInfo.followee }}</div>
        关注
      </div>
      <div class="fans data-content">
        <div class="number">{{ userInfo.fans }}</div>
        粉丝
      </div>
    </div>
  </div>
  <div class="profile-content">
    <nut-tabs
      auto-height
      v-model="activeTab"
      color="var(--theme-color)"
      @change="changeTabs"
    >
      <nut-tab-pane title="笔记" pane-key="1"> Content 2 </nut-tab-pane>
      <nut-tab-pane title="点赞" pane-key="2"> Content 3 </nut-tab-pane>
      <nut-tab-pane title="收藏" pane-key="3"> Content 3 </nut-tab-pane>
      <nut-tab-pane title="店铺" pane-key="4" v-if="commodityList.length !== 0">
        <div class="commodity">
          <div
            class="commodity-card"
            v-for="item in commodityList"
            :key="item.id"
            @click="showCommodityInfo(item.id)"
          >
            <img :src="item.images.split(',')[0]" alt="" />
            <div class="commodity-info">
              <div class="commodity-name">{{ item.name }}</div>
              <div class="price-sold">
                <div class="price">￥{{ item.price }}</div>
                <div class="sold">{{ item.sold }}+人已买</div>
              </div>
            </div>
          </div>
        </div>
      </nut-tab-pane>
    </nut-tabs>
  </div>
</template>

<style scoped>
.header {
  width: 100%;
  min-height: 20rem;
  background-color: var(--theme-color);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  color: #fff;
  padding: 2rem;
  padding-bottom: 5rem;
  box-sizing: border-box;
}
.header > div {
  margin: 1rem 0;
}
.header > div:first-child {
  margin-top: 0;
}
.header > div:last-child {
  margin-bottom: 0;
}
.header .info {
  display: flex;
  align-items: center;
}
.header .info .avatar {
  width: 6rem;
  border-radius: 50%;
  margin-right: 1rem;
}
.header .info .name {
  font-size: 2.5rem;
}
.header .introduction {
  font-size: 1.5rem;
  white-space: pre-line;
}
.header .tags {
  display: flex;
}
.header .tags .tag {
  margin-right: 1rem;
  background-color: #dddddd;
  padding: 0.4rem 0.8rem;
  border-radius: 0.8rem;
  font-size: 1.2rem;
  display: flex;
  align-items: center;
  color: #000;
}
.header .tags .gender-age {
  display: flex;
}
.header .tags .gender-age .gender {
  width: 1rem;
  height: 1rem;
  margin-right: 0.5rem;
}
.header .data {
  display: flex;
  font-size: 1.5rem;
}
.header .data .data-content {
  margin-right: 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.header .data .data-content .number {
  font-size: 1.7rem;
}
.profile-content {
  width: 100%;
  background-color: #fff;
  padding-top: 1rem;
  overflow: hidden;
  box-sizing: border-box;
  border-top-right-radius: 2rem;
  border-top-left-radius: 2rem;
  position: relative;
  top: -3rem;
}

.commodity {
  width: 100%;
  -moz-column-count: 2; /* Firefox */
  -webkit-column-count: 2; /* Safari 和 Chrome */
  column-count: 2;
  column-width: 45%;
}
.commodity .commodity-card {
  width: 100%;
  margin-bottom: 1.5rem;
  -moz-break-inside: avoid;
  -webkit-column-break-inside: avoid;
  break-inside: avoid;
  float: left;
}
.commodity .commodity-card img {
  width: 100%;
  border-radius: 0.5rem;
}
.commodity .commodity-card .commodity-name {
  font-size: 1.6rem;
  height: 4rem;
  overflow: hidden;
  margin-top: 0.5rem;
}
.commodity .commodity-card .price-sold {
  display: flex;
  align-items: center;
  margin-top: 0.5rem;
}
.commodity .commodity-card .price {
  font-size: 1.6rem;
  margin-right: 1rem;
}
.commodity .commodity-card .sold {
  font-size: 1.3rem;
  color: #8a8a8a;
}
</style>
