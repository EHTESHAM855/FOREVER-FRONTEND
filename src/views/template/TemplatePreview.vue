<template>
  <!-- Toggle toolbar visibility -->
  <div class="toolbar-toggle" @click="toolbarVisible = !toolbarVisible">
    {{ toolbarVisible ? '▲' : '▼' }}
  </div>

  <!-- Animated toolbar -->
  <transition name="fade">
    <div class="toolbar" v-show="toolbarVisible">
      <div class="toolbar-left">
        <button class="back-button" @click="$router.back()">← Back to {{ name }}</button>
      </div>

      <div class="toolbar-center">
        <button
          @click="setPreview('mobile')"
          :class="{ active: iframeWidth === '425px' }"
        >
          <img src="/templates_preview_icons/mobile.svg" alt="Mobile" class="icon" />
        </button>
        <button
          @click="setPreview('tablet')"
          :class="{ active: iframeWidth === '768px' }"
        >
          <img src="/templates_preview_icons/tablet.svg" alt="Tablet" class="icon" />
        </button>
        <button
          @click="setPreview('desktop')"
          :class="{ active: iframeWidth === '1900px' }"
        >
          <img src="/templates_preview_icons/computer.svg" alt="Desktop" class="icon" />
        </button>
      </div>

      <div class="toolbar-right">
        <RouterLink
          :to="{ name: 'Customize', params: { name: name } }"
          class="use-template-button"
        >
          Use This Template
        </RouterLink>
      </div>
    </div>
  </transition>

  <!-- Preview section -->
  <div class="preview-wrapper">
    <div v-if="loading" class="loader">
      <loader />
    </div>
    <iframe
      v-show="!loading"
      @load="onIframeLoad"
      id="preview-frame"
      :src="iframeSrc"
      :style="{ width: iframeWidth, height: iframeHeight }"
    ></iframe>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import loader from '@/components/loader.vue'

const BACKEND_BASE = import.meta.env.VITE_API_URL
const props = defineProps({ name: String })

const loading = ref(true)
const iframeWidth = ref('100%')
const iframeHeight = ref('100%')
const toolbarVisible = ref(true)

const iframeSrc = computed(() =>
  props.name
    ? `${BACKEND_BASE}/static/wedding_templates/${props.name}/${props.name}/index.html`
    : ''
)

const setPreview = (device) => {
  iframeWidth.value =
    device === 'mobile' ? '425px'
    : device === 'tablet' ? '768px'
    : '1900px'
  iframeHeight.value = '100%'
}

const onIframeLoad = () => {
  loading.value = false
}
</script>

<style scoped>

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #f9fafb;
  padding: 12px 20px;
  border-bottom: 1px solid #d1d5db;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  border-radius: 0 0 12px 12px;
  position: sticky;
  top: 0;
  z-index: 999;
}

.toolbar-left,
.toolbar-center,
.toolbar-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.back-button {
  background: none;
  border: none;
  font-size: 1rem;
  font-weight: 500;
  color: #374151;
  cursor: pointer;
  transition: color 0.3s ease;
}
.back-button:hover {
  color: #111827;
}


.icon {
  width: 28px;
  opacity: 0.8;
  transition: transform 0.2s ease, opacity 0.3s;
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1));
}
button.active .icon,
button:hover .icon {
  transform: scale(1.1);
  opacity: 1;
}
button {
  background: transparent;
  border: none;
  cursor: pointer;
  border-radius: 8px;
  padding: 6px;
  transition: background 0.3s;
}
button:hover {
  background-color: #e5e7eb;
}


.use-template-button {
  background-color: #1f2937;
  color: #fff;
  padding: 10px 16px;
  border-radius: 8px;
  margin-right: 35px;
  text-decoration: none;
  font-weight: 600;
  transition: background-color 0.3s ease;
}
.use-template-button:hover {
  background-color: #111827;
}


.preview-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #ffffff;
  height: 100vh;
  padding: 20px;
}
iframe {
  border: 2px solid #d1d5db;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
  background-color: #ffffff;
}
iframe:hover {
  transform: scale(1.005);
}


.toolbar-toggle {
  position: fixed;
  top: 14px;
  right: 10px;
  background: #1f2937;
  color: white;
  padding: 8px 14px;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  z-index: 1000;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
}


.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}


@media (max-width: 1024px) {
  .toolbar {
    padding: 10px 16px;
  }
  .toolbar-left,
  .toolbar-center,
  .toolbar-right {
    flex: 1 1 100%;
      align-items: start;
    gap: 12px;
  }
  .use-template-button {
    margin: 0 auto;
    padding: 8px 14px;
    font-size: 14px;
  }
}

@media (max-width: 768px) {
  .preview-wrapper {
    padding: 12px;
  }
  iframe {
    width: 100% !important;
    height: 80vh;
    border-radius: 10px;
  }
  .toolbar-toggle {
    font-size: 13px;
    padding: 6px 10px;
    top: 12px;
    right: 8px;
  }
  .icon {
    width: 24px;
  }
  .back-button {
    font-size: 0.95rem;
  }
}

@media (max-width: 480px) {
  .toolbar {
    flex-direction: column;
    align-items: stretch;
    padding: 8px 12px;
  }
  .toolbar-left,
  .toolbar-center,
  .toolbar-right {
    flex-direction: column;
    gap: 8px;
  }
  .icon {
    width: 20px;
  }
  .use-template-button {
    font-size: 13px;
    padding: 8px 10px;
    text-align: center;
  }
  .toolbar-toggle {
    padding: 6px 10px;
    font-size: 12px;
  }
  .preview-wrapper {
    padding: 8px;
  }
  iframe {
    height: 75vh;
  }
}
</style>
