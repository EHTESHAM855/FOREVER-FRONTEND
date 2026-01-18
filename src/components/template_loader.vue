<template>
    <component :is="currentComponent" v-if="currentComponent" />
</template>

<script setup>
import { shallowRef, watch } from 'vue';
import { useAlertStore } from '@/stores/alert';

const BACKEND_BASE = import.meta.env.VITE_API_URL;
const alert = useAlertStore();

const props = defineProps({
  templateName: {
    type: String,
    required: true
  }
});

const currentComponent = shallowRef(null);

const loadComponent = async (name) => {
  try {
    const component = await import(
      `${BACKEND_BASE}/static/wedding_templates/${name}/${name}.js`
    );
    currentComponent.value = component.default;
  } catch (error) {
    alert.show(`Failed to load template: ${name}`, 'error');
  }
};

loadComponent(props.templateName);

watch(() => props.templateName, (newName) => {
  loadComponent(newName);
});
</script>


