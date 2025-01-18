import request from "@/utils/request";

export const getFolloweeService = (userId) => {
  return request.get("/user/follow/getFollowee?userId=" + userId);
};

export const getFansService = (userId) => {
  return request.get("/user/follow/getFans?userId=" + userId);
};

export const getMutualFollowingService = (userId) => {
  return request.get("/user/follow/getMutualFollowing?userId=" + userId);
};

export const isFollowedService = (followUserId) => {
  return request.get("/user/follow/isFollowed?followUserId=" + followUserId);
};

export const followUserService = (followUserId, isFollowed) => {
  return request.post(
    "/user/follow/followUser?followUserId=" +
      followUserId +
      "&isFollowed=" +
      isFollowed
  );
};
