<script setup lang="ts">
import { HTTPError } from "ky";
import { Button, InputText, Message, Password } from "primevue";
import { ref } from "vue";
import { useI18n } from "vue-i18n";
import { useAuthStore } from "../stores/auth-store/auth-store";

const { t } = useI18n();
const auth = useAuthStore();

const username = ref("");
const password = ref("");
const errorMessage = ref("");
const submitting = ref(false);

async function onSubmit() {
  errorMessage.value = "";
  submitting.value = true;
  try {
    await auth.login(username.value, password.value);
  } catch (error) {
    if (error instanceof HTTPError && error.response.status === 401) {
      errorMessage.value = t("hibas_belepes");
    } else {
      errorMessage.value = t("szerver_hiba");
    }
  } finally {
    submitting.value = false;
  }
}
</script>

<template>
  <div class="w-full h-screen flex items-center justify-center">
    <form
      class="flex flex-col gap-4 w-full max-w-sm p-6"
      @submit.prevent="onSubmit"
    >
      <h1 class="text-2xl font-bold uppercase">{{ t("bejelentkezes") }}</h1>

      <label for="username">{{ t("felhasznalonev") }}</label>
      <InputText id="username" v-model="username" autocomplete="username" />

      <label for="password">{{ t("jelszo") }}</label>
      <Password
        inputId="password"
        v-model="password"
        :feedback="false"
        toggleMask
        fluid
        autocomplete="current-password"
      />

      <Message v-if="errorMessage" severity="error">{{ errorMessage }}</Message>

      <Button
        type="submit"
        :label="t('belepes')"
        :loading="submitting"
        :disabled="username === '' || password === ''"
      />
    </form>
  </div>
</template>
