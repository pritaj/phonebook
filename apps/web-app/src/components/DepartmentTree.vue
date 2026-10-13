<script setup lang="ts">
import type { Department } from "../types/sis";
import { Accordion } from "primevue";
import DepartmentNode from "./DepartmentNode.vue";
import { collectAllPeople } from "../utils/vcard.ts";
import { computed } from "vue";

const props = defineProps<{
  departments?: Department[];
  expandAll?: boolean;
  onlyWithPhone?: boolean;
  showInside?: boolean;
  showOutside?: boolean;
  locked?: boolean;
}>();

const visibleDepartments = computed(() => {
  return props.departments?.filter((dept) => {
    return collectAllPeople([dept]).length > 0;
  });
});
</script>

<template>
  <p v-if="!departments">Töltés...</p>
  <Accordion
    lazy
    v-else
    multiple
    :key="expandAll + departments.map((d) => d.ID).join(',')"
    :value="expandAll ? departments.map((d) => d.ID) : [departments[0].ID]"
  >
    <DepartmentNode
      v-for="dept in visibleDepartments"
      :key="dept.ID"
      :dept="dept"
      :expandAll="expandAll"
      :onlyWithPhone="onlyWithPhone"
      :showInside="showInside"
      :showOutside="showOutside"
      locked
    >
      <template #actions>
        <slot name="actions" />
      </template>
    </DepartmentNode>
  </Accordion>
</template>
