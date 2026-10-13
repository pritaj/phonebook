<script setup lang="ts">
import { ToggleSwitch } from "primevue";
import { onMounted, ref, watch } from "vue";
import MaterialIcon from "./MaterialIcon.vue";

const lightMode = ref<boolean>();
onMounted(() => {
  lightMode.value =
    localStorage.getItem("theme") == "theme-light" ? true : false;
  if (!lightMode.value) {
    document.documentElement.classList.add("theme-dark");
    document.documentElement.classList.remove("theme-light");
  } else {
    document.documentElement.classList.add("theme-light");
    document.documentElement.classList.remove("theme-dark");
  }

  watch(lightMode, () => {
    if (!lightMode.value) {
      document.documentElement.classList.add("theme-dark");
      document.documentElement.classList.remove("theme-light");
    } else {
      document.documentElement.classList.add("theme-light");
      document.documentElement.classList.remove("theme-dark");
    }
    localStorage.setItem(
      "theme",
      lightMode.value ? "theme-light" : "theme-dark",
    );
  });
});
</script>

<template>
  <div class="flex flex-row gap-1 px-1 items-center">
    <MaterialIcon
      class="text-xl! text-muted! font-normal!"
      :icon="lightMode ? 'light_mode' : 'dark_mode'"
    />
    <ToggleSwitch v-model="lightMode" />
  </div>
</template>
