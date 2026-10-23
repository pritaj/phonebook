import type { UserInfo } from "../auth-store/types/user-info";
import ky from "ky";
import { defineStore } from "pinia";
import { computed, onMounted, ref } from "vue";

function parseToken(token: string): UserInfo | null {
  try {
    const base64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    const payload = JSON.parse(atob(base64));
    return { id: payload.sub, username: payload.username, role: payload.role };
  } catch {
    return null;
  }
}

export const useAuthStore = defineStore("auth", () => {
  const disableAuth = false;

  const token = ref<string | null>(localStorage.getItem("token"));
  const user = computed(() => (token.value ? parseToken(token.value) : null));
  const isAuthenticated = computed(() => user.value !== null);
  const theme = ref<"theme-light" | "theme-dark">();

  onMounted(() => {
    const storedTheme = localStorage.getItem("theme");

    if (["theme-light", "theme-dark"].includes(storedTheme as string)) {
      theme.value = storedTheme as typeof theme.value;
    }
  });

  const login = async (username: string, password: string) => {
    const response = await ky
      .post(`${import.meta.env.VITE_API_URL}/auth/login`, {
        json: { username, password },
      })
      .json<{ access_token: string }>();

    token.value = response.access_token;
    localStorage.setItem("token", response.access_token);
  };

  const logout = () => {
    token.value = null;
    localStorage.removeItem("token");
  };

  const adjustTheme = async (value: typeof theme.value) => {
    theme.value = value;
    localStorage.setItem("theme", theme.value as string);
  };

  return {
    login,
    logout,
    isAuthenticated,
    user,
    token,
    disableAuth,
    theme,
    adjustTheme,
  };
});
