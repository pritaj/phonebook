<script setup lang="ts">
import type { Department } from "../types/sis";
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

const props = defineProps<{
  dept: Department;
  expandAll?: boolean;
  onlyWithPhone?: boolean;
  showInside?: boolean;
  showOutside?: boolean;
  locked?: boolean;
}>();
const { t, locale } = useI18n();
const filteredPeople = computed(() => {
  return props.dept.people.filter((person) => {
    if (person.inside === true && !props.showInside) {
      return false;
    }
    if (person.inside === false && !props.showOutside) {
      return false;
    }
    if (!props.onlyWithPhone) return true;
    if (person.Phone !== null && person.Phone !== "") {
      return true;
    }
    return false;
  });
});
const visibleChildren = computed(() => {
  return props.dept.departments.filter((dept) => {
    return collectAllPeople([dept]).length > 0;
  });
});

const otherDept = computed(() => {
  return {
    ID: -props.dept.ID,
    Name_hu: "Egyéb",
    Name_en: "Other",
    IdFrom: props.dept.ID,
    departments: [],
    people: props.dept.people,
  };
});

const displayName = computed(() => {
  if (locale.value === "en-US" && props.dept.Name_en) {
    return props.dept.Name_en;
  } else {
    return props.dept.Name_hu;
  }
});
</script>

<template>
  <AccordionPanel :value="dept.ID">
    <AccordionHeader
      :class="{ 'pointer-events-none!': locked }"
      :pt="{ toggleicon: { class: { 'hidden!': locked } } }"
    >
      <div class="flex items-center gap-2 w-full justify-between">
        <div class="flex items-center gap-2">
          <MaterialIcon :icon="getDepartmentIcon(dept.ID)" />
          {{ dept.ID == 1 ? "Example Company Ltd." : displayName }}
        </div>

        <slot name="actions" />
      </div>
    </AccordionHeader>
    <AccordionContent>
      <Accordion
        lazy
        multiple
        :key="expandAll + dept.departments.map((d) => d.ID).join(',')"
        :value="expandAll ? dept.departments.map((d) => d.ID) : []"
      >
        <DepartmentNode
          v-for="child in visibleChildren"
          :key="child.ID"
          :dept="child"
          :expandAll="expandAll"
          :onlyWithPhone="onlyWithPhone"
          :showInside="showInside"
          :showOutside="showOutside"
        />
        <DepartmentNode
          v-if="visibleChildren.length > 0 && dept.people.length > 0"
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
          :key="person.ID"
          class="overflow-hidden w-full hover:from-[--p-surface-hover-bg-primary] to-[--p-surface-hover-bg-secondary] hover:drop-shadow transition-all"
        >
          <template #header>
            <span class="w-full flex items-center justify-center">
              <MaterialIcon
                :icon="
                  person.LastName.includes('Technikai') ? 'group' : 'person'
                "
                class="text-[245px]!"
              />
            </span>
          </template>
          <template #title>
            {{ person.LastName }}
            {{ person.FirstName }}
          </template>
          <template #subtitle>
            <Tag
              :value="person.inside ? t('bent_van') : t('nincs_bent')"
              :severity="person.inside ? 'success' : 'error'"
            />
          </template>
          <template #content>
            {{ person.Phone }}
          </template>
          <template #footer>
            <div class="flex gap-1 my-1 h-fit">
              <Button
                :label="t('exp')"
                fluid
                :disabled="!person.Phone"
                icon="pi pi-download"
                @click="
                  downloadVCard(
                    `${person.LastName}_${person.FirstName}.vcf`,
                    personToVCard(person, dept.Name_hu),
                  )
                "
              />
              <Button
                v-if="person.Phone"
                :label="t('hivas')"
                severity="success"
                icon="pi pi-phone"
                fluid
                as="a"
                :href="`tel:${person.Phone}`"
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
          </template>
        </Card>
      </ul>
    </AccordionContent>
  </AccordionPanel>
</template>
