<script setup>
import { ref } from "vue";
import { useRouter, useRoute } from "vue-router";
import { RectRight, Check } from "@nutui/icons-vue";

import { getCommodityInfoService } from "@/api/commodity";

import { useUserInfoStore } from "@/stores/userInfo.js";

const route = useRoute();
const router = useRouter();
const useUserInfo = useUserInfoStore();

// 获取商品信息
const score = ref(0);
const commodityInfo = ref({
  commodity: {
    images: "",
  },
  user: {
    profilePictiue: "",
  },
  commodityCommentsList: [{ profilePictiue: "" }],
});
const getCommodityInfo = async () => {
  const result = await getCommodityInfoService(route.query.id);
  console.log(result.data);
  if (result.code === 0) {
    commodityInfo.value = result.data;
    if (commodityInfo.value.commodityCommentsList.length !== 0) {
      commodityInfo.value.commodityCommentsList.forEach((value) => {
        score.value += value.score;
      });
      score.value /= commodityInfo.value.commodityCommentsList.length;
      score.value = score.value.toFixed(1);
    }
  }
};
getCommodityInfo();

// 查看该商品的所有评论
const showComments = () => {
  router.push({ path: "/commodityComments", query: { id: route.query.id } });
};

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
  <nut-swiper :loop="false" height="auto">
    <nut-swiper-item
      v-for="(item, index) in commodityInfo.commodity.images.split(',')"
      :key="index"
    >
      <img
        :src="item"
        alt=""
        style="width: 100%; height: 100%"
        draggable="false"
      />
    </nut-swiper-item>
  </nut-swiper>
  <div class="info-container">
    <div class="commodity-info">
      <div class="price-sold">
        <div class="price">￥{{ commodityInfo.commodity.price }}</div>
        <div class="sold">{{ commodityInfo.commodity.sold }}+人已买</div>
      </div>
      <div class="name">{{ commodityInfo.commodity.name }}</div>
    </div>
    <div class="user-info" @click="showUserInfo(commodityInfo.user.id)">
      <div class="main-info">
        <img
          class="avatar"
          src="../../../public/images/icon/default-avatar.png"
          alt=""
          v-if="
            commodityInfo.user.profilePicture === null ||
            commodityInfo.user.profilePicture === ''
          "
        />
        <img
          class="avatar"
          :src="commodityInfo.user.profilePicture"
          alt=""
          v-if="
            commodityInfo.user.profilePicture !== null &&
            commodityInfo.user.profilePicture !== ''
          "
        />
        <div class="username">{{ commodityInfo.user.username }}</div>
        <div class="fans">粉丝{{ commodityInfo.user.fans }}</div>
      </div>
      <div class="navigate">进店<RectRight /></div>
    </div>
    <div class="delivery-info">
      <div class="delivery-container">
        <div class="left">保障</div>
        <div class="right guarantee">
          <div>
            <img src="../../../public/images/icon/right.png" alt="" />退货包运费
          </div>
          <div>
            <img src="../../../public/images/icon/right.png" alt="" />极速退款
          </div>
          <div>
            <img src="../../../public/images/icon/right.png" alt="" />晚发必赔
          </div>
        </div>
      </div>
      <div class="delivery-container">
        <div class="left">发货</div>
        <div class="right">
          <div class="delivery-time">
            {{ commodityInfo.commodity.deliveryTime }}小时内发货
          </div>
          <div class="address">
            {{ commodityInfo.commodity.address }} | 包邮
          </div>
        </div>
      </div>
    </div>
    <div class="comment-info" @click="showComments">
      <div class="header">
        <div>商品评价 {{ commodityInfo.commodityCommentsList.length }}</div>
        <div
          class="score"
          v-if="commodityInfo.commodityCommentsList.length !== 0"
        >
          评分 {{ score }}
        </div>
        <div
          class="score"
          v-if="commodityInfo.commodityCommentsList.length === 0"
        >
          暂无评分
        </div>
      </div>
      <div
        class="comment-container"
        v-for="item in commodityInfo.commodityCommentsList.slice(0, 2)"
        :key="item.id"
      >
        <div class="customer">
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
          <div class="username">{{ item.username }}</div>
        </div>
        <nut-rate v-model="item.score" readonly size="1.3rem" spacing="5" />
        <div class="content">{{ item.content }}</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.info-container {
  background-color: var(--grey-bg) !important;
}
.info-container .commodity-info {
  width: 100%;
  padding: 1.5rem;
  box-sizing: border-box;
  background-color: #fff;
  border-bottom-left-radius: 0.5rem;
  border-bottom-right-radius: 0.5rem;
}
.info-container .commodity-info .price-sold {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.info-container .commodity-info .price {
  font-size: 2.5rem;
  color: var(--theme-color-red);
}
.info-container .commodity-info .sold {
  font-size: 1.5rem;
}
.info-container .commodity-info .name {
  font-size: 1.8rem;
  margin-top: 1rem;
}
.info-container .user-info {
  padding: 1.5rem;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: #fff;
  margin-top: 1rem;
  border-radius: 0.5rem;
}
.info-container .user-info .main-info {
  display: flex;
  align-items: center;
}
.avatar {
  width: 4.5rem;
  border-radius: 50%;
  margin-right: 1rem;
}
.info-container .user-info .username {
  font-size: 1.6rem;
  margin-right: 1rem;
}
.info-container .user-info .fans {
  font-size: 1.6rem;
  margin-right: 1rem;
  color: #707070;
}
.info-container .user-info .navigate {
  display: flex;
  align-items: center;
  font-size: 1.6rem;
}
.info-container .delivery-info {
  padding: 1.5rem;
  box-sizing: border-box;
  background-color: #fff;
  margin-top: 1rem;
  border-radius: 0.5rem;
  font-size: 1.6rem;
}
.info-container .delivery-info .delivery-container {
  display: flex;
  margin: 1rem 0;
}
.info-container .delivery-info .delivery-container:first-child {
  margin-top: 0;
}
.info-container .delivery-info .delivery-container:last-child {
  margin-bottom: 0;
}
.info-container .delivery-info .right {
  margin-left: 2rem;
}
.info-container .delivery-info .guarantee {
  display: flex;
  align-items: center;
}
.info-container .delivery-info .guarantee > div {
  display: flex;
  align-items: center;
  margin-right: 1rem;
}
.info-container .delivery-info .guarantee img {
  width: 1.6rem;
  margin-right: 0.3rem;
}
.info-container .delivery-info .address {
  font-size: 1.3rem;
  color: #707070;
}

.info-container .comment-info {
  padding: 1.5rem;
  box-sizing: border-box;
  background-color: #fff;
  margin-top: 1rem;
  border-radius: 0.5rem;
  font-size: 1.6rem;
}
.info-container .comment-info .header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.info-container .comment-info .comment-container {
  margin: 1.5rem 0;
}
.info-container .comment-info .customer {
  display: flex;
  align-items: center;
  margin-bottom: 0.5rem;
  color: #707070;
}
</style>
