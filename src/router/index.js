import { createRouter, createWebHistory } from "vue-router";

export const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "index",
      component: () => import("../views/Index.vue"),
      redirect: "/home",
      children: [
        {
          path: "/home",
          name: "home",
          component: () => import("../views/Home/Home.vue"),
        },
        {
          path: "/mall",
          name: "mall",
          component: () => import("../views/Mall/Mall.vue"),
        },
        {
          path: "/message",
          name: "message",
          component: () => import("../views/Message/Message.vue"),
        },
        {
          path: "/profile",
          name: "profile",
          component: () => import("../views/Profile/Profile.vue"),
        },
      ],
    },
    {
      path: "/upload",
      name: "upload",
      component: () => import("../views/Upload/Upload.vue"),
    },
    {
      path: "/userPage",
      name: "userPage",
      component: () => import("../views/UserPage/UserPage.vue"),
    },
    {
      path: "/commodityInfo",
      name: "commodityInfo",
      component: () => import("../views/CommodityInfo/CommodityInfo.vue"),
    },
    {
      path: "/commodityComments",
      name: "commodityComments",
      component: () =>
        import("../views/CommodityComments/CommodityComments.vue"),
    },
    {
      path: "/vouchers",
      name: "vouchers",
      component: () => import("../views/Vouchers/Vouchers.vue"),
    },
    {
      path: "/blog",
      name: "blog",
      component: () => import("../views/Blog/Blog.vue"),
    },
    {
      path: "/login",
      name: "login",
      component: () => import("../views/Login.vue"),
    },
  ],
});
