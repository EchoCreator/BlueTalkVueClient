import request from "@/utils/request";

export const getCommodityTypeService = () => {
  return request.get("/user/commodity/commodityType");
};

export const getCommodityService = (name, typeId) => {  
  return request.get(
    "/user/commodity/getCommodity?name=" + name + "&typeId=" + typeId
  );
};

export const getCommodityInfoService = (id) => {
  return request.get("/user/commodity/getCommodityInfo?commodityId=" + id);
};

export const getCommodityCommentsService = (id) => {
  return request.get("/user/commodity/getCommodityComments?commodityId=" + id);
};

export const getUsersCommodityService = (id) => {
  return request.get("/user/commodity/getUsersCommodity?userId=" + id);
};
