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
</script>

<template>
  <nut-searchbar v-model="inputValue" input-background="#dbdbdb">
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
