
import './assets/base_style.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import axios from 'axios'
import { createPinia } from 'pinia'

const BACKEND_BASE = import.meta.env.VITE_API_URL

const api = axios.create({
  baseURL: BACKEND_BASE,
  withCredentials: true,
})
const pinia = createPinia()


api.interceptors.request.use(config => {
  const token = localStorage.getItem('csrfToken')
  if (token) config.headers['X-CSRFToken'] = token
  return config
})


export default api


;(async () => {
  try {
    const res = await api.get('/api/csrf-token')
    localStorage.setItem('csrfToken', res.data.csrfToken)
    console.log('CSRF token fetched and stored.')
  } catch (error) {
    console.warn('Failed to fetch CSRF token. Proceeding anyway.', error)
  } finally {
    const app = createApp(App)
    app.use(pinia)
    app.use(router)
    app.mount('#app')
  }
})()

