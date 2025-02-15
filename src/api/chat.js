import request from "@/utils/request";

export const getChatListService = () => {
  return request.get("/user/chat/getChatList");
};

export const getChatContentService = (id, isSingleChat) => {
  return request.get(
    "/user/chat/getChatContent?id=" + id + "&isSingleChat=" + isSingleChat
  );
};

export const sendMessageService = (chat) => {
  return request.put("/user/chat/sendMessage", chat);
};
