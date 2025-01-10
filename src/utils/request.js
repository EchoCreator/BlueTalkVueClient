import axios from "axios";
import { useTokenStore } from "@/stores/token";
import { router } from "@/router";

const baseURL = "/api";
const instance = axios.create({
  baseURL: baseURL,
});

const tokenStore = useTokenStore();

instance.interceptors.request.use(
  (config) => {
    const token = tokenStore.token;
    if (token) {
      console.log(token);
      
      config.headers.Authorization = token;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

instance.interceptors.response.use(
  (result) => {
    return result.data;
  },
  (error) => {    
    if (error.response.status === 401) {
      router.push("/login");
    }
    return Promise.reject(error);
  }
);

export default instance;
