<script setup lang="ts">
import type { Department, Employee } from "../types/sis";
import {
  Accordion,
  AccordionPanel,
  AccordionHeader,
  AccordionContent,
  Button,
  Card,
  Tag,
} from "primevue";
import { useI18n } from "vue-i18n";
import { personToVCard, downloadVCard } from "../utils/vcard";
import { collectAllPeople } from "../utils/vcard.ts";
import MaterialIcon from "./MaterialIcon.vue";
import { computed } from "vue";
import { getDepartmentIcon } from "../utils/departmentIcons.ts";
import { useAuthStore } from "../stores/auth-store/auth-store";
import { useAdminStore } from "../stores/admin-store";
import { api } from "../utils/api";

const props = defineProps<{
  dept: Department;
  expandAll?: boolean;
  onlyWithPhone?: boolean;
  showInside?: boolean;
  showOutside?: boolean;
  locked?: boolean;
}>();
const { t, locale } = useI18n();
const auth = useAuthStore();
const admin = useAdminStore();

async function removeEmployee(person: Employee) {
  if (!window.confirm(t("admin_torles_megerosites"))) return;
  try {
    await api.delete(`employees/${person.id}`);
    admin.requestReload();
  } catch {
    window.alert(t("admin_hiba"));
  }
}
const filteredPeople = computed(() => {
  return props.dept.employees.filter((person) => {
    if (person.inside === true && !props.showInside) {
      return false;
    }
    if (person.inside === false && !props.showOutside) {
      return false;
    }
    if (!props.onlyWithPhone) return true;
    if (person.phone !== null && person.phone !== "") {
      return true;
    }
    return false;
  });
});
const visibleChildren = computed(() => {
  return props.dept.children.filter((child) => {
    return collectAllPeople([child]).length > 0;
  });
});

const otherDept = computed(() => {
  return {
    id: -props.dept.id,
    nameHu: "Egyéb",
    nameEn: "Other",
    parentId: props.dept.id,
    children: [],
    employees: props.dept.employees,
  };
});

const displayName = computed(() => {
  if (locale.value === "en-US" && props.dept.nameEn) {
    return props.dept.nameEn;
  } else {
    return props.dept.nameHu;
  }
});
</script>

<template>
  <AccordionPanel :value="dept.id">
    <AccordionHeader
      :class="{ 'pointer-events-none!': locked }"
      :pt="{ toggleicon: { class: { 'hidden!': locked } } }"
    >
      <div class="flex items-center gap-2 w-full justify-between">
        <div class="flex items-center gap-2">
          <MaterialIcon :icon="getDepartmentIcon(dept.id)" />
          {{ dept.id == 1 ? "Example Company Ltd." : displayName }}
        </div>

        <slot name="actions" />
      </div>
    </AccordionHeader>
    <AccordionContent>
      <Accordion
        lazy
        multiple
        :key="expandAll + dept.children.map((d) => d.id).join(',')"
        :value="expandAll ? dept.children.map((d) => d.id) : []"
      >
        <DepartmentNode
          v-for="child in visibleChildren"
          :key="child.id"
          :dept="child"
          :expandAll="expandAll"
          :onlyWithPhone="onlyWithPhone"
          :showInside="showInside"
          :showOutside="showOutside"
        />
        <DepartmentNode
          v-if="visibleChildren.length > 0 && dept.employees.length > 0"
          :dept="otherDept"
          :expandAll="expandAll"
          :onlyWithPhone="onlyWithPhone"
          :showInside="showInside"
          :showOutside="showOutside"
        />
      </Accordion>
      <ul
        class="grid grid-cols-[repeat(auto-fit,minmax(250px,350px))] gap-4 items-stretch bg-(--p-surface-ground) p-4 rounded-2xl shadow-(--p-shadow-innermd) w-full"
        v-if="visibleChildren.length === 0"
      >
        <Card
          v-for="person in filteredPeople"
          :key="person.id"
          class="overflow-hidden w-full hover:from-[--p-surface-hover-bg-primary] to-[--p-surface-hover-bg-secondary] hover:drop-shadow transition-all"
        >
          <template #header>
            <span class="w-full flex items-center justify-center">
              <MaterialIcon
                :icon="
                  person.lastName.includes('Technikai') ? 'group' : 'person'
                "
                class="text-[245px]!"
              />
            </span>
          </template>
          <template #title>
            {{ person.lastName }}
            {{ person.firstName }}
          </template>
          <template #subtitle>
            <Tag
              :value="person.inside ? t('bent_van') : t('nincs_bent')"
              :severity="person.inside ? 'success' : 'error'"
            />
          </template>
          <template #content>
            {{ person.phone }}
          </template>
          <template #footer>
            <div class="flex gap-1 my-1 h-fit">
              <Button
                :label="t('exp')"
                fluid
                :disabled="!person.phone"
                icon="pi pi-download"
                @click="
                  downloadVCard(
                    `${person.lastName}_${person.firstName}.vcf`,
                    personToVCard(person, dept.nameHu),
                  )
                "
              />
              <Button
                v-if="person.phone"
                :label="t('hivas')"
                severity="success"
                icon="pi pi-phone"
                fluid
                as="a"
                :href="`tel:${person.phone}`"
              />
              <Button
                v-else
                :label="t('hivas')"
                severity="success"
                icon="pi pi-phone"
                fluid
                disabled
              />
            </div>
            <div
              v-if="auth.user?.role === 'admin'"
              class="flex gap-1 my-1 h-fit"
            >
              <Button
                :label="t('admin_szerkesztes_gomb')"
                icon="pi pi-pencil"
                severity="secondary"
                fluid
                @click="admin.edit(person)"
              />
              <Button
                :label="t('admin_torles')"
                icon="pi pi-trash"
                severity="danger"
                fluid
                @click="removeEmployee(person)"
              />
            </div>
          </template>
        </Card></ul></AccordionContent
  ></AccordionPanel>
</template>
