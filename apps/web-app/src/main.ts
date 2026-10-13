import "../src/asset/main.css";
import { createApp } from "vue";
import App from "./App.vue";
import PrimeVue from "primevue/config";
import Aura from "@primeuix/themes/aura";
import Ripple from "primevue/ripple";
import { ToastService } from "primevue";
import { createI18n } from "vue-i18n";
import { createPinia } from "pinia";
import en from "../src/i18n/en-US.json";
import hu from "../src/i18n/hu-HU.json";

const currentLocale = localStorage.getItem("locale") || "en-US";

export const i18n = createI18n({
  legacy: false,
  locale: currentLocale,
  fallbackLocale: "en-US",
  messages: {
    "en-US": en,
    "hu-HU": hu,
  },
  fallbackWarn: false,
  missingWarn: false,
});

const app = createApp(App);
app.use(PrimeVue, {
  theme: {
    preset: Aura,
    options: {
      darkModeSelector: ".theme-dark",
      cssLayer: { name: "primevue", order: "theme, base, primevue" },
    },
  },
});
app.use(i18n);
app.use(createPinia());
app.use(ToastService);
app.directive("ripple", Ripple);
app.mount("#app");
