<script setup lang="ts">
import { useI18n } from "vue-i18n";
import { SelectButton } from "primevue";
import { onMounted, ref, watch } from "vue";
import { api } from "../utils/api";
import { useAuthStore } from "../stores/auth-store/auth-store";

const { locale, availableLocales } = useI18n();
const auth = useAuthStore();
const value = ref<string>(locale.value);
const flags: Record<string, string> = { hu: "fi-hu", en: "fi-gb" };

watch(
  value,
  () => {
    setLocale(value.value);
  },
  {
    immediate: true,
  },
);

function setLocale(value: string) {
  locale.value = value;
  localStorage.setItem("locale", value);
}

onMounted(async () => {
  if (!auth.isAuthenticated) {
    return;
  }
  try {
    const preference = await api
      .get("user-preferences")
      .json<{ language: string }>();
    if (availableLocales.includes(preference.language)) {
      value.value = preference.language;
    }
  } catch {
    // hiba esetén marad a böngészőben tárolt nyelv
  }
});

async function saveLanguage(language: string | null) {
  if (!auth.isAuthenticated || !language) {
    return;
  }
  try {
    await api.put("user-preferences", { json: { language } });
  } catch {
    // a mentés hibája nem akadályozza a nyelvváltást
  }
}
</script>
<template>
  <SelectButton
    :options="availableLocales"
    optionLabel="flag"
    v-model="value"
    :allowEmpty="false"
    @change="saveLanguage($event.value)"
  >
    <template #option="slotprops">
      <span :class="`fi ${flags[slotprops.option.split('-')[0]]}`"></span>
    </template>
  </SelectButton>
</template>
