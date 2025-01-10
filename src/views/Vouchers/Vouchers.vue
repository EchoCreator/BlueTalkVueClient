<script setup>
import { ref } from "vue";

import { getVouchersService, pickupVoucherService } from "@/api/voucher.js";

const vouchers = ref([]);
const getVouchers = async () => {
  const result = await getVouchersService();
  if (result.code === 0) {
    vouchers.value = result.data;
  }
};
getVouchers();

import { showToast } from "@nutui/nutui";
const pickupVoucher = async (voucherId, isPickedUp) => {
  if (isPickedUp) {
    showToast.text("您已有该优惠券，不可重复领取！", {
      size: "small",
    });
    return;
  }
  const result = await pickupVoucherService(voucherId);
  if (result.code === 0) {
    showToast.text("领取优惠券成功！", {
      size: "small",
    });
    getVouchers();
  } else {
    showToast.text(result.message, {
      size: "small",
    });
  }
};
</script>

<template>
  <div class="vouchers">
    <div class="publicity">
      <img src="../../../public/images/icon/CNY.png" alt="" />
      <div class="text">
        <p>1月15日中午12:00秒杀</p>
        <p class="main-text">跨店每满300减80</p>
      </div>
    </div>
    <div
      v-for="item in vouchers"
      :key="item.id"
      class="voucher-container"
      :class="item.type === 1 ? 'seckill-voucher-container' : ''"
    >
      <div class="seckill-time" v-if="item.type === 1">
        <div class="time">秒杀时间：{{ item.seckillBeginTime }}</div>
        <div class="number">限量{{ item.stock }}份</div>
      </div>
      <div class="header">
        <div class="titles">
          <div class="title">{{ item.title }}</div>
          <div class="sub-title">{{ item.subTitle }}</div>
        </div>
        <div class="type" v-if="item.type === 0">普通券</div>
        <div class="type" v-if="item.type === 1">秒杀券</div>
      </div>
      <div class="rules">
        <div>{{ item.rules }}</div>
        <div
          class="button"
          :class="item.isPickedUp === 1 ? 'disabled-button' : ''"
          v-if="item.type === 0"
          @click="pickupVoucher(item.id, item.isPickedUp)"
        >
          获取
        </div>
        <div
          class="button"
          :class="item.isPickedUp === 1 ? 'disabled-button' : ''"
          v-if="item.type === 1"
          @click="pickupVoucher(item.id, item.isPickedUp)"
        >
          抢
        </div>
      </div>
      <div class="expire-time">
        有效期：{{ item.expireBeginTime }}-{{ item.expireEndTime }}
      </div>
    </div>
  </div>
</template>

<style scoped>
.vouchers {
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: var(--grey-bg);
}
.publicity {
  width: 100%;
  font-size: 2rem;
  position: relative;
  background-color: #fff;
  border-bottom-left-radius: 1rem;
  border-bottom-right-radius: 1rem;
}
.publicity .text {
  display: flex;
  flex-direction: column;
  position: absolute;
  bottom: 1rem;
  right: 2rem;
  background-color: #fff;
  border-radius: 1rem;
  padding: 0.5rem;
}
.publicity .text p {
  font-family: "SmileySans";
}
.publicity .text .main-text {
  font-size: 3rem;
  color: var(--theme-color-red);
}
.publicity img {
  width: 30rem;
}
.vouchers .voucher-container {
  width: 95%;
  background-color: #fff;
  margin: 1rem 0;
  font-size: 1.5rem;
  border-radius: 1rem;
  overflow: hidden;
}
.vouchers .voucher-container .seckill-time {
  width: 100%;
  padding: 1rem 1.5rem;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: var(--theme-color-red);
  color: #fff;
}
.vouchers .voucher-container .header {
  width: 100%;
  padding: 1rem 1.5rem;
  box-sizing: border-box;
  display: flex;
  justify-content: space-between;
}
.vouchers .voucher-container .title {
  font-size: 2rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}
.vouchers .voucher-container .type {
  color: var(--theme-color);
  font-family: "SmileySans";
  font-size: 1.7rem;
}
.vouchers .seckill-voucher-container .type {
  color: var(--theme-color-red);
}
.vouchers .voucher-container .rules {
  padding: 1rem 1.5rem;
  box-sizing: border-box;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
}
.vouchers .voucher-container .rules .button {
  background-color: var(--theme-color);
  color: #fff;
  padding: 0.5rem 1rem;
  box-sizing: border-box;
  border-radius: 0.5rem;
  flex: none;
  margin-left: 2rem;
}
.vouchers .voucher-container .rules .disabled-button {
  background-color: var(--dark-grey-bg) !important;
}
.vouchers .seckill-voucher-container .rules .button {
  background-color: var(--theme-color-red);
}
.vouchers .voucher-container .expire-time {
  padding: 1rem 1.5rem;
  box-sizing: border-box;
  color: var(--theme-color-orange);
}
</style>
