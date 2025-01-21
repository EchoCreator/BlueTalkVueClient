<script setup>
import { nextTick, ref } from "vue";
import { Search2 } from "@nutui/icons-vue";

import { getCommodityTypeService, getCommodityService } from "@/api/commodity";

// tabs切换
const activeTab = ref(0);
const tabIndex = ref(0);

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
    // activeTab.value = result.data[0].id;
    getCommodity();
  }
};
getCommodityType();

// 搜索商品
import { calWaterfall } from "@/utils/calWaterfall";
const commodityListRef = ref();
const inputValue = ref("");
const commodityList = ref([]);
const getCommodity = async () => {
  const typeId = parseInt(commodityType.value[activeTab.value].id);
  const result = await getCommodityService(inputValue.value, typeId);
  if (result.code === 0) {
    commodityList.value = result.data;
    nextTick(() => {
      setTimeout(() => {
        calDOMHeight();
        calWaterfall(commodityListRef.value[activeTab.value]);
      }, 200);
    });
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

const calDOMHeight = () => {
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
};
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
      v-for="(item, index) in commodityType"
      :key="item.id"
      :title="item.name"
      :pane-key="index"
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
      <div class="commodity" ref="commodityListRef">
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
