<template>
  <div class="toolbar-toggle" @click="toolbarVisible = !toolbarVisible">
    {{ toolbarVisible ? '▲' : '▼' }}
  </div>

  <transition name="fade">
    <div class="toolbar" v-show="toolbarVisible">
      <div class="toolbar-left">
        <button class="back-button" @click="$router.back()">← Back</button>
      </div>
      <div class="toolbar-center">
        <button @click="setPreview('mobile')" :class="{ active: iframeWidth === '425px' }">
          <img src="/templates_preview_icons/mobile.svg" alt="Mobile" class="icon" />
        </button>
        <button @click="setPreview('tablet')" :class="{ active: iframeWidth === '768px' }">
          <img src="/templates_preview_icons/tablet.svg" alt="Tablet" class="icon" />
        </button>
        <button @click="setPreview('desktop')" :class="{ active: iframeWidth === '1900px' }">
          <img src="/templates_preview_icons/computer.svg" alt="Desktop" class="icon" />
        </button>
      </div>
      <div class="toolbar-right">
        <RouterLink :to="`/dashboard/myTemplates/customize/${edited_template_id}`" class="action-button">Customize</RouterLink>
        <RouterLink :to="`/dashboard/myTemplates/publish/${edited_template_id}`" class="action-button">Publish</RouterLink>
      </div>
    </div>
  </transition>

  <!-- Preview Container -->
  <div class="preview-wrapper">
    <div v-if="loading" class="loader"><Loader /></div>
    <iframe
      v-show="!loading"
      @load="onIframeLoad"
      id="preview-frame"
      :srcdoc="templateHtml"
      :style="{ width: iframeWidth, height: iframeHeight }"
      class="preview-frame"
    ></iframe>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import Loader from '@/components/loader.vue'

const BACKEND_BASE = import.meta.env.VITE_API_URL
const route = useRoute()
const edited_template_id = route.params.edited_template_id

const loading = ref(true)
const toolbarVisible = ref(true)
const templateHtml = ref('')
const iframeWidth = ref('100%')
const iframeHeight = ref('100%')

const fetchEditedTemplate = async () => {
  try {
    const res = await fetch(`${BACKEND_BASE}/api/editedTemplates/${edited_template_id}`, {
      credentials: 'include'
    })
    if (!res.ok) throw new Error('Failed to fetch template.')
    const data = await res.json()
    templateHtml.value = data.html_content
  } catch (err) {
    console.error('Failed to load template:', err)
  }
}

const setPreview = (device) => {
  if (device === 'mobile') iframeWidth.value = '425px'
  else if (device === 'tablet') iframeWidth.value = '768px'
  else iframeWidth.value = '1900px'
  iframeHeight.value = '100%'
}

const onIframeLoad = () => {
  loading.value = false
}

onMounted(() => {
  fetchEditedTemplate()
  document.title = `Preview - ${edited_template_id}`
})
</script>

<style scoped>
.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #f0f0f0;
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
  height: auto;
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

.action-button {
  background-color: #1f2937;
  color: #fff;
  padding: 10px 1vh;
  border-radius: 8px;
  margin-right: 10px;
  text-decoration: none;
  font-weight: 1vh;
  transition: background-color 0.3s ease;
}

.action-button:hover {
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
  top: 67px;
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

/* Transitions */
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
    justify-content: center;
    margin: 0;
    flex: 1 1 100%;
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
    padding: 8px 12px;
  }

  .toolbar-left,
  .toolbar-center,
  .toolbar-right {
    flex-direction: column;
    align-items: stretch;
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
