import { createApp } from "vue";
import App from "./App.vue";
import store from "./store";
import "./assets/scss/main.scss";
import { i18n } from "./i18n";

const app = createApp(App);
app.use(store);
app.use(i18n);
app.mount("#app");
