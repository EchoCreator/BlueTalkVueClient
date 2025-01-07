import "./assets/main.css";

import { createApp } from "vue";
import { createPinia } from "pinia";
import { createPersistedState } from "pinia-plugin-persistedstate";

import App from "./App.vue";
import { router } from "./router";

import NutUI from "@nutui/nutui";
import "@nutui/nutui/dist/style.css";

const app = createApp(App);

const pinia = createPinia();
const persist = createPersistedState();
pinia.use(persist);
app.use(pinia);
app.use(router);
app.use(NutUI);

app.mount("#app");
