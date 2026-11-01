<script setup lang="ts">
import { useI18n } from "vue-i18n";
import { SelectButton } from "primevue";
import { ref, watch } from "vue";

const { locale, availableLocales } = useI18n();
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
</script>
<template>
  <SelectButton :options="availableLocales" optionLabel="flag" v-model="value">
    <template #option="slotprops">
      <span :class="`fi ${flags[slotprops.option.split('-')[0]]}`"></span>
    </template>
  </SelectButton>
</template>
