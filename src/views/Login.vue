<script setup>
import { ref } from "vue";

import { getCodeService, loginService } from "@/api/user.js";

// 表单校验
const formRef = ref(null);
const formData = ref({
  phoneNumber: "",
  code: "",
});
const phoneNumberValidate = () => {
  const phoneNumber = formData.value.phoneNumber;
  const reg =
    /^(13[0-9]|14[01456879]|15[0-35-9]|16[2567]|17[0-8]|18[0-9]|19[0-35-9])\d{8}$/;
  if (reg.test(phoneNumber)) {
    validPhoneNumber.value = true;
  } else {
    validPhoneNumber.value = false;
    validCode.value = false;
    showCodeInput.value = false;
    clearInterval(interval);
  }
};

const codeValidate = () => {
  const code = formData.value.code;
  const reg = /\d{4}/;
  if (reg.test(code)) {
    validCode.value = true;
  } else {
    validCode.value = false;
  }
};

const validPhoneNumber = ref(false);
const validCode = ref(false);
const showCodeInput = ref(false);

// 获取短信验证码
const seconds = ref(5);
const codeSending = ref(false);
let interval;
const getCode = async () => {
  const result = await getCodeService(formData.value.phoneNumber);
  if (result.code === 0) {
    seconds.value = 5;
    showCodeInput.value = true;
    codeSending.value = true;
    interval = setInterval(() => {
      if (seconds.value - 1 > 0) {
        seconds.value -= 1;
      } else {
        clearInterval(interval);
        codeSending.value = false;
      }
    }, 1000);
  }
};

// 登录
import { useRouter } from "vue-router";
import { showToast } from "@nutui/nutui";
import { useTokenStore } from "@/stores/token";
const tokenStore = useTokenStore();
const router = useRouter();
const login = async () => {
  const result = await loginService(formData.value);
  if (result.code === 0) {    
    tokenStore.setToken(result.data.token);
    router.push("/profile");
  } else {
    showToast.text(result.message, {
      size: "small",
    });
  }
};
</script>

<template>
  <div class="login-form">
    <div class="title">手机号登录</div>
    <div class="prompt">未注册的手机号登录成功后将自动注册</div>
    <nut-form ref="formRef" :model-value="formData">
      <nut-form-item>
        <nut-input
          v-model="formData.phoneNumber"
          placeholder="请输入手机号码"
          type="digit"
          max-length="11"
          clearable
          @update:model-value="phoneNumberValidate"
        />
      </nut-form-item>
      <nut-form-item v-if="showCodeInput">
        <nut-input
          v-model="formData.code"
          placeholder="请输入验证码"
          type="digit"
          max-length="4"
          clearable
          @update:model-value="codeValidate"
          ><template #right>
            <div class="code-prompt resending-code" v-if="codeSending">
              重新发送{{ seconds }}s
            </div>
            <div class="code-prompt" v-if="!codeSending" @click="getCode">
              获取验证码
            </div>
          </template></nut-input
        >
      </nut-form-item>
      <nut-button
        block
        @click="getCode"
        color="var(--theme-color)"
        :disabled="!validPhoneNumber"
        v-if="!showCodeInput"
        >验证并登录</nut-button
      >
      <nut-button
        block
        @click="login"
        color="var(--theme-color)"
        :disabled="!validCode"
        v-if="showCodeInput"
        >确认登录</nut-button
      >
    </nut-form>
  </div>
</template>

<style scoped>
.login-form {
  width: 70%;
  position: absolute;
  top: 10%;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
}
.login-form > div {
  margin: 1rem 0;
}
.login-form .title {
  font-size: 3rem;
}
.login-form .prompt {
  font-size: 1.5rem;
  color: var(--theme-color-grey-text);
}
.login-form .nut-form {
  width: 100%;
}
.login-form .nut-button {
  margin-top: 1rem;
}
.code-prompt {
  color: var(--theme-color-red);
}
.resending-code {
  opacity: 60%;
}
</style>
