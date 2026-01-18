<script setup>
import { ref, watch } from 'vue';
import { fetchCsrfToken } from '@/utils/csrf';
import { useAlertStore } from '@/stores/alert';
const alert = useAlertStore();

const props = defineProps({
  show: Boolean
});
const emit = defineEmits(['close']);

const BACKEND_BASE = import.meta.env.VITE_API_URL;

const email = ref('');
const message = ref('');
const loading = ref(false);


const verificationCode = ref('');
const newPassword = ref('');
const confirmPassword = ref('');
const step = ref(1); 

watch(() => props.show, (newVal) => {
  if (!newVal) {
    email.value = '';
    message.value = '';
    verificationCode.value = '';
    newPassword.value = '';
    confirmPassword.value = '';
    step.value = 1;
    loading.value = false;
  }
});

const sendResetCode = async () => {
  if (!email.value) {
    message.value = 'Please enter your email.';
    return;
  }

  loading.value = true;
  message.value = '';

  try {
    const csrfToken = await fetchCsrfToken();

    const response = await fetch(`${BACKEND_BASE}/api/user/request-password-change-code/${email.value}`, {
      method: 'POST',
      headers: {
        'X-CSRFToken': csrfToken,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      credentials: 'include'
    });

    const data = await response.json();

    if (response.ok) {
      message.value = data.message || 'Reset code sent to your email.';
      step.value = 2;
    } else {
      message.value = data.message || 'Failed to send reset code.';
    }
  } catch (err) {
    console.error(err);
    message.value = 'Server error. Please try again later.';
  }

  loading.value = false;
};

const changePassword = async () => {
  if (!verificationCode.value || !newPassword.value || !confirmPassword.value) {
    message.value = 'All fields are required.';
    return;
  }

  if (newPassword.value !== confirmPassword.value) {
    message.value = 'Passwords do not match.';
    return;
  }

  loading.value = true;
  message.value = '';

  try {
    const csrfToken = await fetchCsrfToken();

    const response = await fetch(`${BACKEND_BASE}/api/user/change-password/${email.value}`, {
      method: 'POST',
      headers: {
        'X-CSRFToken': csrfToken,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        new_password: newPassword.value,
        confirm_password: confirmPassword.value,
        verification_code: verificationCode.value
      })
    });

    const data = await response.json();

    if (response.ok) {
      message.value = data.message || 'Password changed successfully.';
      step.value = 1;
      email.value = '';
      emit('close')
      alert.show("Password Changes Successfully","success")
    } else {
      message.value = data.error || 'Failed to change password.';
    }
  } catch (err) {
    console.error(err);
    message.value = 'Server error. Please try again later.';
  }

  loading.value = false;
};
</script>

<template>
  <div v-if="show" class="modal-backdrop">
    <div class="modal">
      <h3>Reset Password</h3>
      <p v-if="message" class="reset-message">{{ message }}</p>

      <template v-if="step === 1">
        <input
          v-model="email"
          type="email"
          placeholder="Enter your registered email"
          class="modal-input"
          required
        />
        <button @click="sendResetCode" class="btn" :disabled="loading">
          {{ loading ? 'Sending...' : 'Send Code' }}
        </button>
      </template>

      <template v-else>
        <input
          v-model="verificationCode"
          type="text"
          placeholder="Enter verification code"
          class="modal-input"
        />
        <input
          v-model="newPassword"
          type="password"
          placeholder="New password"
          class="modal-input"
        />
        <input
          v-model="confirmPassword"
          type="password"
          placeholder="Confirm new password"
          class="modal-input"
        />
        <button @click="changePassword" class="btn" :disabled="loading">
          {{ loading ? 'Submitting...' : 'Change Password' }}
        </button>
      </template>

      <button @click="emit('close')" class="cancel-btn">Cancel</button>
    </div>
  </div>
</template>

<style scoped>
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}
.modal {
  background: #fff;
  padding: 25px;
  border-radius: 12px;
  width: 90%;
  max-width: 400px;
  text-align: center;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
}
.modal h3 {
  margin-bottom: 20px;
  color: #2c3e50;
}
.modal-input {
  width: 100%;
  padding: 12px;
  font-size: 15px;
  margin-bottom: 15px;
  border-radius: 8px;
  border: 1px solid #ccc;
  background-color: #f9f9f9;
}
.btn {
  width: 100%;
  padding: 10px;
  background-color: #f0a0b0;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  margin-bottom: 10px;
}
.btn:disabled {
  background-color: #ffb6c1;
  cursor: not-allowed;
}
.cancel-btn {
  background: none;
  color: #555;
  border: none;
  cursor: pointer;
  font-size: 14px;
  text-decoration: underline;
}
.reset-message {
  margin-bottom: 10px;
  color: #2e86de;
  font-weight: 500;
}
</style>
