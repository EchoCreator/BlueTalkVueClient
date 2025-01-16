<script setup>
import { ref } from "vue";
import { useTokenStore } from "@/stores/token";
import { useRouter } from "vue-router";

const router = useRouter();
const tokenStore = useTokenStore();

import { postBlogService } from "@/api/blog";

// 上传图片
const fileList = ref([]);
const successUpload = (result) => {
  const file = JSON.parse(result.responseText).data;
  fileList.value.push(file);
};
const deleteFile = (val) => {
  fileList.value.splice(val.index, 1);
};

// 笔记标题和内容
const titleInput = ref("");
const contentInput = ref("");
const tagsInput = ref("");
const addressInput = ref("");

const addTag = () => {
  tagsInput.value += "#";
};

// 发布笔记
import { showToast } from "@nutui/nutui";
const postBlog = async () => {
  let title, address, tags;
  // 删除标题开头和结尾的空格，同时将多个连续空格合并为一个空格
  title = titleInput.value.replace(/\s+/g, " ").trim();
  // 删除地址信息中的所有空格
  address = addressInput.value.replace(/\s+/g, "").trim();
  if (address === "") {
    address = null;
  }
  // 通过match提取出话题标签中“#字符串”格式的字符串并组成数组["#字符串","#字符串",...]
  // 再通过slice删除掉'#'后合并成一个新的字符串
  tags = tagsInput.value.match(/#([^#]+)/g);
  if (tags !== null) {
    tags = tags.map((match) => match.slice(1).replace(/\s+/g, "")).toString();
  }
  if (tags === "") {
    tags = null;
  }

  const blogContent = {
    title: title,
    images: fileList.value.toString(),
    content: contentInput.value,
    tags: tags,
    address: address,
  };

  const result = await postBlogService(blogContent);
  if (result.code === 0) {
    showToast.text("笔记发布成功", {
      size: "small",
    });
    router.back();
  }
};
</script>

<template>
  <div class="uploader-container">
    <nut-uploader
      url="http://localhost:5173/api/upload"
      multiple
      maximum="5"
      auto-upload
      @success="successUpload"
      @delete="deleteFile"
      :headers="{ Authorization: tokenStore.token }"
    ></nut-uploader>
    <nut-input
      v-model="titleInput"
      placeholder="添加标题"
      clearable
      max-length="20"
      show-word-limit
    />
    <nut-textarea
      v-model="contentInput"
      placeholder="添加正文"
      :rows="3"
      autosize
      max-length="200"
    />
    <nut-textarea
      class="tags-text"
      v-model="tagsInput"
      placeholder="添加话题"
      :rows="1"
      autosize
    />
    <div class="button-group">
      <div class="button" @click="addTag">#话题</div>
      <div class="button">@用户</div>
    </div>
    <nut-input
      v-model="addressInput"
      placeholder="标记地点"
      clearable
      max-length="20"
      show-word-limit
    />
    <div class="bottom">
      <nut-button
        block
        color="var(--theme-color)"
        :disabled="
          fileList.length == 0 || titleInput == '' || contentInput == ''
        "
        @click="postBlog"
        >发布笔记</nut-button
      >
    </div>
  </div>
</template>

<style scoped>
.uploader-container {
  padding: 2rem;
  box-sizing: border-box;
}
.nut-input,
.nut-textarea {
  padding: 0;
  margin: 2rem 0;
}
::v-deep .nut-input .input-text {
  font-size: 1.8rem !important;
}
::v-deep .nut-textarea__textarea {
  font-size: 1.8rem !important;
  background-color: #fff !important;
  padding: 0 !important;
  border-radius: 0 !important;
}
::v-deep .tags-text .nut-textarea__textarea {
  color: var(--tag-color);
}
.button-group {
  display: flex;
  align-items: center;
  font-size: 1.4rem;
}
.button-group .button {
  padding: 0.8rem 1.5rem;
  box-sizing: border-box;
  background-color: var(--grey-bg2);
  border-radius: 1.5rem;
  margin-right: 1rem;
}
.bottom {
  width: 100%;
  position: fixed;
  bottom: 0;
  left: 0;
  z-index: 999;
  padding: 2rem;
  box-sizing: border-box;
}
</style>
