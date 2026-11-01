import { defineStore } from 'pinia';
import { ref } from 'vue';
import { api } from '../utils/api';

export const useFavoritesStore = defineStore('favorites', () => {
  const ids = ref<Set<number>>(new Set());
  const onlyFavorites = ref<boolean>(false);

  async function load() {
    const list = await api.get('favorites').json<number[]>();
    ids.value = new Set(list);
  }

  function isFavorite(employeeId: number) {
    return ids.value.has(employeeId);
  }

  async function toggle(employeeId: number) {
    if (ids.value.has(employeeId)) {
      await api.delete(`favorites/${employeeId}`);
      ids.value.delete(employeeId);
    } else {
      await api.post(`favorites/${employeeId}`);
      ids.value.add(employeeId);
    }
    ids.value = new Set(ids.value);
  }

  return { ids, onlyFavorites, load, isFavorite, toggle };
});
