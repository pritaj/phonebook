import { defineStore } from "pinia";
import { ref } from "vue";
import type { Employee } from "../types/sis";

export const useAdminStore = defineStore("admin", () => {
  const editing = ref<Employee | null>(null);
  const reloadCounter = ref<number>(0);

  function edit(employee: Employee) {
    editing.value = employee;
  }

  function stopEditing() {
    editing.value = null;
  }

  function requestReload() {
    reloadCounter.value++;
  }

  return { editing, reloadCounter, edit, stopEditing, requestReload };
});
