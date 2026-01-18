<template>
  <div class="verify-wrapper">
    <div class="verify-box">
      <h2>Email Verification Required</h2>
      <p class="info-text">
        A verification link has been sent to your email address. Please check your inbox and click the link to verify your account.
      </p>

      <button @click="resendLink" :disabled="loading" class="resend-btn">
        <span v-if="loading">Resending...</span>
        <span v-else>Resend Verification Email</span>
      </button>

      <p v-if="message" :class="success ? 'success-text' : 'error-text'">{{ message }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref,onMounted } from 'vue'
import {useRouter} from 'vue-router'
const BACKEND_BASE = import.meta.env.VITE_API_URL;
import { fetchCsrfToken } from "@/utils/csrf";
import { useConfirmStore } from '@/stores/confirm'

const confirm = useConfirmStore();
const router = useRouter();

const loading = ref(false)
const message = ref('')
const success = ref(false)

const resendLink = async () => {
    const confirmed = confirm.show("Are you sure to Resend the verification link again?")
    if (confirmed){
  loading.value = true
  message.value = ''
  const csrfToken = await fetchCsrfToken();
  try {
    const res = await fetch(`${BACKEND_BASE}/api/resend-verification`, {
      method: 'POST',
      credentials: 'include',
      headers:{
        "X-CSRFToken":csrfToken
      }
    })
    const data = await res.json()
    message.value = data.message
    success.value = res.ok
  } catch (err) {
    message.value = 'Error resending email.'
    success.value = false
  } finally {
    loading.value = false
  }}
}

const verified = ref(false);
const fetchUser = async () => {
  try {
    const res = await fetch(`${BACKEND_BASE}/api/user/me`, {
      credentials: "include"
    });

    if (!res.ok) {
      if (res.status === 401) {
        router.push("/login");
      } else {
        throw new Error("Unexpected error");
      }
    }

    const data = await res.json();
    verified.value = data.user.verified;
    if(verified.value){
    router.push('/dashboard')
  }
  } catch (err) {
    console.error("Error fetching user:", err);
  }
};

onMounted(async ()  => {
  await fetchUser();});
</script>

<style scoped>
.verify-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: #f0f4f8;
}

.verify-box {
  background: white;
  padding: 2rem 2.5rem;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  text-align: center;
  max-width: 450px;
  width: 90%;
}

h2 {
  font-size: 1.8rem;
  margin-bottom: 1rem;
  color: #333;
}

.info-text {
  font-size: 1rem;
  color: #555;
  margin-bottom: 1.5rem;
}

.resend-btn {
  background: #007bff;
  color: white;
  padding: 0.75rem 1.5rem;
  border: none;
  font-weight: 600;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.3s ease;
}

.resend-btn:disabled {
  background: #a8c5f7;
  cursor: not-allowed;
}

.resend-btn:hover:not(:disabled) {
  background: #0056b3;
}

.success-text {
  color: #28a745;
  margin-top: 1rem;
  font-weight: 500;
}

.error-text {
  color: #dc3545;
  margin-top: 1rem;
  font-weight: 500;
}
</style>
