import request from "@/utils/request";

export const getCodeService = (phoneNumber) => {
  return request.post("/user/user/getCode?phoneNumber=" + phoneNumber);
};

export const loginService = (formData) => {
  return request.post("/user/user/login", formData);
};

export const getUserInfoService = () => {
  return request.get("/user/user/userInfo");
};

export const getOtherUserInfoService = (id) => {
  return request.get("/user/user/otherUserInfo?userId=" + id);
};
