<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    icon: string;
    rotation?: number;
    variant?: "outlined" | "rounded";
  }>(),
  {
    variant: "rounded",
  },
);
</script>
<template>
  <a
    :class="`material-symbols-${variant}`"
    :style="rotation ? `rotate: ${{ rotation }}deg` : ''"
    >{{ props.icon }}</a
  >
</template>
