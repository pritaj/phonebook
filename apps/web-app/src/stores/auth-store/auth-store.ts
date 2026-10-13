import type { UserInfo } from "../auth-store/types/user-info";
import Keycloak, { type KeycloakTokenParsed } from "keycloak-js";
import { defineStore } from "pinia";
import { onMounted, ref } from "vue";

export const useAuthStore = defineStore("auth", () => {
  const disableAuth = false; //import.meta.env.VITE_DISABLE_AUTH == 'true'

  const keycloakInstance = new Keycloak({
    url: import.meta.env.VITE_AUTH_URL,
    clientId: import.meta.env.VITE_AUTH_CLIENT,
    realm: import.meta.env.VITE_AUTH_REALM,
  });
  keycloakInstance.onTokenExpired = async () => {
    const updateResult = await keycloakInstance.updateToken(20);
    if (updateResult) {
      token.value = keycloakInstance.token;
    }
  };
  const isAuthenticated = ref(disableAuth ?? true);
  const user = ref<UserInfo>();
  const theme = ref<"theme-light" | "theme-dark">();
  const token = ref();
  const tokenParsed = ref<KeycloakTokenParsed>();

  onMounted(() => {
    const storedTheme = localStorage.getItem("theme");

    if (["theme-light", "theme-dark"].includes(storedTheme as string)) {
      theme.value = storedTheme as typeof theme.value;
    }
  });

  if (disableAuth) {
    user.value = {
      id: "",
      username: "anon",
      email: "anonymous@example.com",
      firstName: "anonymous",
      lastName: "user",
      job_title: "tester",
      monogram: "UA",
      name: "User Anonymous",
    };
  }

  const init = async () => {
    // ensure that we only initialize once
    if (isAuthenticated.value === true) return;

    try {
      isAuthenticated.value = await keycloakInstance.init({
        onLoad: "login-required",
        responseMode: "query",
        checkLoginIframe: false,
        pkceMethod: "S256",
      });
    } catch (error) {
      console.error("Keycloak initialization failed:", error);
    }

    if (isAuthenticated.value) {
      token.value = keycloakInstance.token;
      tokenParsed.value = keycloakInstance.tokenParsed;
      await getUser();
    }
  };

  const getUser = async () => {
    if (!isAuthenticated.value) {
      console.error("Cannot get the user info. The user is not authenticated");

      keycloakInstance.login();
      return;
    }

    try {
      user.value = (await keycloakInstance.loadUserProfile()) as any;
    } catch (error) {
      console.error(error);
      return;
    }

    if (user.value) {
      user.value.monogram = `${user.value.firstName?.[0]}${user.value.lastName?.[0]}`;
      user.value.name = `${user.value.firstName} ${user.value.lastName}`;
      user.value.roles =
        tokenParsed.value?.resource_access?.[import.meta.env.VITE_AUTH_CLIENT]
          ?.roles;
    }
  };

  const logout = async () => {
    await keycloakInstance.logout({
      redirectUri: `${location.protocol}//${location.host}${location.pathname}`,
    });
  };
  const adjustTheme = async (value: typeof theme.value) => {
    theme.value = value;
    localStorage.setItem("theme", theme.value as string);
  };

  return {
    init,
    isAuthenticated,
    user,
    logout,
    token,
    tokenParsed,
    disableAuth,
    theme,
    adjustTheme,
  };
});
