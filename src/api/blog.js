import request from "@/utils/request";

export const getBlogsService = () => {
  return request.get("/user/blog/getBlogs");
};

export const getBlogContentService = (blogId) => {
  return request.get("/user/blog/getBlogContent?blogId=" + blogId);
};

export const getUsersBlogsService = (userId) => {
  return request.get("/user/blog/getUsersBlogs?userId=" + userId);
};

export const getUsersLikedFavoriteBlogsService = (userId) => {
  return request.get("/user/blog/getUsersLikedFavoriteBlogs?userId=" + userId);
};

export const likeBlogService = (blogId) => {
  return request.post("/user/blog/likeBlog?blogId=" + blogId);
};

export const favoriteBlogService = (blogId) => {
  return request.post("/user/blog/favoriteBlog?blogId=" + blogId);
};

export const postBlogCommentService = (blogComment) => {
  return request.post("/user/blog/postBlogComment", blogComment);
};
