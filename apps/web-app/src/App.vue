<script setup lang="ts">
import { ref, watch } from "vue";
import LoginForm from "./components/LoginForm.vue";
import PhonebookView from "./PhonebookView.vue";
import { useAuthStore } from "./stores/auth-store/auth-store";

const auth = useAuthStore();
const showLogin = ref(false);

watch(
  () => auth.isAuthenticated,
  () => {
    showLogin.value = false;
  },
);
</script>

<template>
  <LoginForm
    v-if="!auth.isAuthenticated && showLogin"
    @cancel="showLogin = false"
  />
  <PhonebookView
    v-else
    :key="String(auth.isAuthenticated)"
    @login="showLogin = true"
  />
</template>
