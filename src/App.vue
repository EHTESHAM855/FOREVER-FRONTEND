<script setup>
import { RouterView } from 'vue-router'
import headerr from './components/header.vue'
import footerr from './components/footer.vue'
import { useRoute } from 'vue-router'
import { ref, computed, onMounted } from 'vue'
import { fetchCsrfToken } from './utils/csrf'
import { useAlertStore } from '@/stores/alert'
import ConfirmToast from '@/components/ConfirmToast.vue'
import loader from '@/components/loader.vue'


const alert = useAlertStore()

const BACKEND_BASE = import.meta.env.VITE_API_URL
const route = useRoute()

const showLayout = computed(() => !route.meta.hideLayout)
const dashboard = computed(() => !route.meta.dashboard)

const loading = ref(true)

let visitTracked = false

const visitor_update = async () => {
  if (visitTracked) return

  try {
    const csrfToken = await fetchCsrfToken()
    const res = await fetch(`${BACKEND_BASE}/api/track-visit`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': csrfToken
      },
      body: JSON.stringify({ page: window.location.pathname })
    })

    if (!res.ok) {
      let backendMessage = `Visit tracking failed: ${res.statusText}`
      try {
        const errorData = await res.json()
        if (errorData.message) backendMessage = errorData.message
      } catch {}

      // alert.show(backendMessage, 'error')
      throw new Error(backendMessage)
    }

    visitTracked = true
  } catch (err) {
    console.error(err)
    // alert.show(err.message || 'An unexpected error occurred.', 'error')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  visitor_update()
})
</script>

<template>
  <div v-if="loading" class="loading-screen">
    <loader />
  </div>

  <div v-else>
    <headerr v-if="showLayout" />
    <RouterView />
    <footerr v-if="showLayout && dashboard" />
<ConfirmToast />
    <div v-if="alert.visible" :class="['alert-toast', alert.type]">
      <span>{{ alert.message }}</span>
      <button class="close-btn" @click="alert.hide()">✕</button>
    </div>
  </div>
</template>



<style>
* {
  transition: all 0.7s;
}

.loading-screen {
  text-align: center;
  padding: 2rem;
  font-size: 1.5rem;
  color: #555;
}

.error-message {
  background-color: #ffe6e6;
  color: #d8000c;
  padding: 1rem;
  margin: 1rem;
  border: 1px solid #d8000c;
  border-radius: 8px;
  text-align: center;
}
.alert-toast {
  position: fixed;
  top: 100px;
  left: 50%;
  transform: translateX(-50%);
  padding: 12px 24px;
  border-radius: 8px;
  color: white;
  font-weight: 500;
  font-size: 14px;
  z-index: 1000;
  box-shadow: 0 4px 12px rgba(0,0,0,0.2);
  display: flex;
  align-items: center;
  gap: 16px;
  /* text-align: center; */
  /* min-width: 280px; */
  max-width: 90vw;
}

.alert-toast.success {
  background-color: #28a745; /* Green */
}

.alert-toast.error {
  background-color: #dc3545; /* Red */
}

.close-btn {
  background: transparent;
  border: none;
  color: white;
  font-size: 18px;
  cursor: pointer;
  font-weight: bold;
  line-height: 1;
  padding: 0;
  user-select: none;
  transition: color 0.2s ease;
}

.close-btn:hover {
  color: #ddd;
}


@keyframes fadein {
  from { opacity: 0; }
  to { opacity: 1; }
}
</style>