<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { Button, Checkbox, Dialog, InputText, Select } from "primevue";
import type { Department, Employee } from "../types/sis";
import { api } from "../utils/api";

const props = defineProps<{
  visible: boolean;
  departments: Department[];
  employee?: Employee | null;
}>();

const emit = defineEmits<{
  (e: "update:visible", value: boolean): void;
  (e: "saved"): void;
}>();

const { t, locale } = useI18n();

const lastName = ref("");
const firstName = ref("");
const departmentId = ref<number | null>(null);
const phone = ref("");
const email = ref("");
const position = ref("");
const inside = ref(false);
const saving = ref(false);
const errorMessage = ref("");

function flatten(
  list: Department[],
  depth = 0,
): { id: number; label: string }[] {
  const result: { id: number; label: string }[] = [];
  for (const dept of list) {
    const name =
      locale.value.startsWith("en") && dept.nameEn ? dept.nameEn : dept.nameHu;
    result.push({ id: dept.id, label: "— ".repeat(depth) + name });
    result.push(...flatten(dept.children, depth + 1));
  }
  return result;
}

const departmentOptions = computed(() => flatten(props.departments));

const canSave = computed(
  () =>
    lastName.value.trim() !== "" &&
    firstName.value.trim() !== "" &&
    departmentId.value !== null,
);

const header = computed(() =>
  props.employee ? t("admin_szerkesztes") : t("admin_uj_munkatars"),
);

function resetForm() {
  lastName.value = "";
  firstName.value = "";
  departmentId.value = null;
  phone.value = "";
  email.value = "";
  position.value = "";
  inside.value = false;
  errorMessage.value = "";
}

watch(
  () => props.visible,
  (isVisible) => {
    if (!isVisible) return;
    const e = props.employee;
    if (e) {
      lastName.value = e.lastName;
      firstName.value = e.firstName;
      departmentId.value = e.departmentId;
      phone.value = e.phone ?? "";
      email.value = e.email ?? "";
      position.value = e.position ?? "";
      inside.value = e.inside;
      errorMessage.value = "";
    } else {
      resetForm();
    }
  },
);

function close() {
  emit("update:visible", false);
}

async function save() {
  saving.value = true;
  errorMessage.value = "";
  const payload = {
    lastName: lastName.value.trim(),
    firstName: firstName.value.trim(),
    departmentId: departmentId.value,
    phone: phone.value.trim() || null,
    email: email.value.trim() || null,
    position: position.value.trim() || null,
    inside: inside.value,
  };
  try {
    if (props.employee) {
      await api.patch(`employees/${props.employee.id}`, { json: payload });
    } else {
      await api.post("employees", { json: payload });
    }
    emit("saved");
    close();
  } catch {
    errorMessage.value = t("admin_hiba");
  } finally {
    saving.value = false;
  }
}
</script>

<template>
  <Dialog
    :visible="props.visible"
    @update:visible="(value: boolean) => emit('update:visible', value)"
    modal
    :header="header"
    :style="{ width: '28rem' }"
    :breakpoints="{ '575px': '95vw' }"
  >
    <div class="flex flex-col gap-4">
      <div class="flex flex-col gap-1">
        <label for="lastName">{{ t("admin_vezeteknev") }}</label>
        <InputText id="lastName" v-model="lastName" />
      </div>
      <div class="flex flex-col gap-1">
        <label for="firstName">{{ t("admin_keresztnev") }}</label>
        <InputText id="firstName" v-model="firstName" />
      </div>
      <div class="flex flex-col gap-1">
        <label for="department">{{ t("admin_osztaly") }}</label>
        <Select
          inputId="department"
          v-model="departmentId"
          :options="departmentOptions"
          optionLabel="label"
          optionValue="id"
          filter
        />
      </div>
      <div class="flex flex-col gap-1">
        <label for="phone">{{ t("admin_telefon") }}</label>
        <InputText id="phone" v-model="phone" />
      </div>
      <div class="flex flex-col gap-1">
        <label for="email">{{ t("admin_email") }}</label>
        <InputText id="email" v-model="email" />
      </div>
      <div class="flex flex-col gap-1">
        <label for="position">{{ t("admin_beosztas") }}</label>
        <InputText id="position" v-model="position" />
      </div>
      <div class="flex items-center gap-2">
        <Checkbox v-model="inside" binary inputId="inside" />
        <label for="inside">{{ t("admin_bent_van") }}</label>
      </div>
      <p v-if="errorMessage" class="text-red-500">{{ errorMessage }}</p>
    </div>
    <template #footer>
      <Button :label="t('admin_megse')" text @click="close()" />
      <Button
        :label="t('admin_mentes')"
        :disabled="!canSave"
        :loading="saving"
        @click="save()"
      />
    </template>
  </Dialog>
</template>
