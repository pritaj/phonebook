<script setup lang="ts">
import LoginForm from "./components/LoginForm.vue";
import PhonebookView from "./PhonebookView.vue";
import { useAuthStore } from "./stores/auth-store/auth-store";

const auth = useAuthStore();
</script>

<template>
  <PhonebookView v-if="auth.isAuthenticated" />
  <LoginForm v-else />
</template>
