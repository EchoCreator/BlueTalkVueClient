<script setup>
import { ref } from "vue";
import { Search2 } from "@nutui/icons-vue";

import { getCommodityTypeService, getCommodityService } from "@/api/commodity";

// tabs切换
const activeTab = ref(null);

// 商品类别
const commodityType = ref([]);
const getCommodityType = async () => {
  const result = await getCommodityTypeService();
  if (result.code === 0) {
    commodityType.value = result.data;
    commodityType.value.unshift({
      id: 0,
      name: "全部",
      sort: 0,
    });
    activeTab.value = result.data[0].id;
    getCommodity();
  }
};
getCommodityType();

// 搜索商品
const inputValue = ref("");
const commodityList = ref([]);
const getCommodity = async () => {
  const result = await getCommodityService(inputValue.value, activeTab.value);
  if (result.code === 0) {
    commodityList.value = result.data;
  }
};

// 跳转商品详情页
import { useRouter } from "vue-router";
const router = useRouter();
const showCommodityInfo = (id) => {
  router.push({ path: "/commodityInfo", query: { id: id } });
};

// 跳转优惠券页面
const showVouchersPage = () => {
  router.push("/vouchers");
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
  <nut-tabs
    auto-height
    v-model="activeTab"
    title-scroll
    title-gutter="10"
    name="tabName"
    color="var(--theme-color)"
    @change="getCommodity"
    sticky
  >
    <nut-tab-pane
      v-for="item in commodityType"
      :key="item.id"
      :title="item.name"
      :pane-key="item.id"
    >
      <div class="voucher" @click="showVouchersPage">
        <img src="../../../public/images/icon/CNY.png" alt="" />
        <div class="text">
          <p>新春佳节</p>
          <p>买新衣美食</p>
          <p>来抢大额</p>
          <p class="main-text">优惠券</p>
        </div>
      </div>
      <nut-empty
        description="这里没有商品，还是看看别的吧"
        v-if="commodityList.length === 0"
      ></nut-empty>
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
  padding-top: 1rem;
}

.voucher {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  position: relative;
}
.voucher .text {
  display: flex;
  flex-direction: column;
}
.voucher .text p {
  font-family: "SmileySans";
}
.voucher .text .main-text {
  font-size: 3rem;
  color: var(--theme-color-red);
}
.voucher img {
  width: 20rem;
}
</style>
