<script setup lang="ts">
import DepartmentTree from "./components/DepartmentTree.vue";
import type { Department } from "./types/sis";
import { findMatchingPeople, filterDepartmentByIds } from "./utils/search";
import {
  Button,
  Toolbar,
  InputText,
  InputIcon,
  IconField,
  Divider,
  Checkbox,
  Popover,
} from "primevue";
import { useI18n } from "vue-i18n";
import DarkModeToggle from "./components/DarkModeToggle.vue";
import { onMounted, computed, ref, watch } from "vue";
import { collectAllPeople, personToVCard, downloadVCard } from "./utils/vcard";
import { api } from "./utils/api";
import { useAuthStore } from "./stores/auth-store/auth-store";
import { useAdminStore } from "./stores/admin-store";
import LocaleToggle from "./components/LocaleToggle.vue";
import MaterialIcon from "./components/MaterialIcon.vue";
import EmployeeFormDialog from "./components/EmployeeFormDialog.vue";
import { useBreakpoints, breakpointsTailwind } from "@vueuse/core";

const { t } = useI18n();
const auth = useAuthStore();
const admin = useAdminStore();
const departments = ref<Department[]>([]);
const loading = ref<boolean>(true);
const searchQuery = ref<string>("");
const debouncedQuery = ref<string>("");

let timer = 0;
watch(searchQuery, () => {
  clearTimeout(timer);
  timer = setTimeout(() => {
    debouncedQuery.value = searchQuery.value;
  }, 300);
});

const onlyWithPhone = ref<boolean>(false);
const showInside = ref<boolean>(true);
const showOutside = ref<boolean>(true);
const dialogVisible = computed({
  get: () => showEmployeeDialog.value || admin.editing !== null,
  set: (value: boolean) => {
    if (!value) {
      showEmployeeDialog.value = false;
      admin.stopEditing();
    }
  },
});
const filterPanel = ref();
const showEmployeeDialog = ref<boolean>(false);

const isSearching = computed(() => {
  return debouncedQuery.value.trim().length > 0;
});

const filteredDepartments = computed(() => {
  const query = debouncedQuery.value.trim();
  if (query === "") {
    return departments.value;
  }

  const allPeople = collectAllPeople(departments.value);
  const foundPeople = findMatchingPeople(allPeople, query);
  const ids = new Set(foundPeople.map((i) => i.id));

  return departments.value
    .map((dept) => filterDepartmentByIds(dept, ids))
    .filter((dept) => dept !== null);
});

const breakpoints = useBreakpoints(breakpointsTailwind);

const currentButtonSize = computed(() => {
  if (breakpoints.lg.value) return "large";
  if (breakpoints.md.value) return undefined;
  return "small";
});

async function loadDepartments() {
  departments.value = await api.get("departments/tree").json<Department[]>();
}

onMounted(async () => {
  await loadDepartments();
  loading.value = false;
});

watch(
  () => admin.reloadCounter,
  () => loadDepartments(),
);

function exportAll() {
  const people = collectAllPeople(departments.value);
  const peopleWithPhone = people.filter(
    (entry) => entry.person.phone !== null && entry.person.phone !== "",
  );
  const vcards = peopleWithPhone.map((entry) =>
    personToVCard(entry.person, entry.deptName),
  );
  const content = vcards.join("\r\n");
  downloadVCard("telefonkonyv.vcf", content);
}
</script>

<template>
  <div class="w-full h-screen flex flex-col flex-nowrap overflow-y-auto">
    <Toolbar class="w-full shrink-0 sticky! top-0 z-1000 mt-1">
      <template #start>
        <MaterialIcon icon="contacts" />
        <span
          class="text-(--p-highlight-lust) text-lg md:text-xl uppercase ml-4 font-bold"
        >
          {{ t("telefon") }}
        </span>
        <span class="uppercase text-lg md:text-xl font-bold">
          {{ t("könyv") }}</span
        >
      </template>

      <template #center>
        <IconField>
          <InputIcon>
            <i class="pi pi-search" />
          </InputIcon>
          <InputText v-model="searchQuery" :placeholder="t('kereso')" />
          <InputIcon v-if="searchQuery" @click="searchQuery = ''">
            <i class="pi pi-times cursor-pointer" />
          </InputIcon>
        </IconField>
      </template>

      <template #end>
        <div
          class="w-fit h-full flex flex-row flex-wrap md:flex-nowrap items-center justify-center gap-2"
        >
          <Button
            v-if="auth.user?.role === 'admin'"
            :label="t('admin_uj_munkatars')"
            icon="pi pi-user-plus"
            :pt="{ label: { class: 'hidden sm:inline' } }"
            :size="currentButtonSize ?? 'normal'"
            @click="showEmployeeDialog = true"
          />
          <LocaleToggle />
          <Divider layout="vertical" class="hidden sm:block" />
          <DarkModeToggle />
          <Divider layout="vertical" class="hidden sm:block" />
          <Button
            :label="t('kilepes')"
            icon="pi pi-sign-out"
            :pt="{ label: { class: 'hidden sm:inline' } }"
            :size="currentButtonSize ?? 'normal'"
            text
            @click="auth.logout()"
          />
        </div>
      </template>
    </Toolbar>
    <div class="flex-1 min-h-0 mt-2">
      <DepartmentTree
        :departments="filteredDepartments"
        v-if="filteredDepartments?.[0] !== undefined"
        :expandAll="isSearching"
        :onlyWithPhone="onlyWithPhone"
        :showInside="showInside"
        :showOutside="showOutside"
      >
        <template #actions>
          <span
            class="flex flex-nowrap gap-1 ml-2 pointer-events-auto"
            @click.stop
          >
            <Button
              :label="t('szuro')"
              :pt="{ label: { class: 'hidden sm:inline' } }"
              icon="pi pi-filter"
              :size="currentButtonSize ?? 'normal'"
              raised
              @click="(e) => filterPanel.toggle(e)"
            />

            <Popover ref="filterPanel">
              <div class="flex flex-col gap-4">
                <div class="flex items-center gap-2">
                  <Checkbox
                    v-model="onlyWithPhone"
                    binary
                    inputId="onlyWithPhone"
                  />
                  <label for="onlyWithPhone">{{ t("telefonszam") }}</label>
                </div>
                <div class="flex items-center gap-2">
                  <Checkbox v-model="showInside" binary inputId="showInside" />
                  <label for="showInside">{{ t("bent_van") }}</label>
                </div>
                <div class="flex items-center gap-2">
                  <Checkbox
                    v-model="showOutside"
                    binary
                    inputId="showOutside"
                  />
                  <label for="showOutside">{{ t("nincs_bent") }}</label>
                </div>
              </div>
            </Popover>
            <Button
              :label="t('export')"
              icon="pi pi-download"
              :pt="{ label: { class: 'hidden sm:inline' } }"
              :size="currentButtonSize ?? 'normal'"
              raised
              @click="exportAll()"
            />
          </span>
        </template>
      </DepartmentTree>
    </div>
    <EmployeeFormDialog
      v-model:visible="dialogVisible"
      :departments="departments"
      :employee="admin.editing"
      @saved="loadDepartments()"
    />
  </div>
</template>
