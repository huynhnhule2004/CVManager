import { createApp } from 'vue';
// import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.js";
import { createPinia } from 'pinia';
import App from './App.vue';
import router from './router';
import Vue3Toastify from 'vue3-toastify';
import 'vue3-toastify/dist/index.css'
;

const app = createApp(App);
const pinia = createPinia();

app.use(Vue3Toastify);
app.use(router);
app.use(pinia);
app.mount('#app');