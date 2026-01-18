<template>
  <a
    class="google-btn"
    :href="googleAuthUrl"
    role="button"
    aria-label="Login with Google"
  >
    <img
      src="https://developers.google.com/identity/images/g-logo.png"
      alt="Google logo"
      class="google-icon"
    />
    <span>Login with Google</span>
  </a>
</template>

<script setup>
import { computed } from 'vue'
const BACKEND_BASE = import.meta.env.VITE_API_URL

const googleAuthUrl = computed(() => `${BACKEND_BASE}/google-login`)
</script>

<style scoped>
.google-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-top: 20px;
  padding: 12px 24px;
  background-color: #fff;
  color: #444;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-weight: 600;
  font-size: 15px;
  text-decoration: none;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

.google-btn:hover {
  background-color: #f8f8f8;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transform: translateY(-1px);
}

.google-icon {
  height: 20px;
  width: 20px;
}
</style>
