<template>
  <div class="admin-login-container">
    <div class="login-box">
      <h2>Admin Login</h2>
      <form @submit.prevent="handleLogin">
        <div class="input-group">
          <label for="username">Email</label>
          <input type="text" id="username" v-model="email" required />
        </div>
        <div class="input-group">
          <label for="password">Password</label>
          <input type="password" id="password" v-model="password" required />
        </div>
        <button type="submit" class="login-button">Login</button>
        <p v-if="error" class="error-message">{{ error }}</p>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { fetchCsrfToken } from "@/utils/csrf";

const BACKEND_BASE = import.meta.env.VITE_API_URL;

const email = ref('');
const password = ref('');
const error = ref('');
const router = useRouter();

const handleLogin = async () => {
  error.value = ''; 

  try {
    const csrfToken = await fetchCsrfToken();

    const res = await fetch(`${BACKEND_BASE}/api/admin/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "X-CSRFToken": csrfToken,
      },
      body: JSON.stringify({
        email: email.value,
        password: password.value,
      }),
      credentials: "include",
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      error.value = data.message || `Login failed (Status: ${res.status})`;
      throw new Error(error.value);
    }

    router.push("/admin");

  } catch (err) {
    console.error("Admin login error:", err);
    if (!error.value) {
      error.value = "An unexpected error occurred during login.";
    }
  }
};
</script>


<style scoped>
.admin-login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(to right, #e0eafc, #cfdef3);
  /* Light blue gradient */
}

.login-box {
  background-color: #ffffff;
  padding: 40px 50px;
  border-radius: 12px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
  text-align: center;
}

h2 {
  color: #333;
  margin-bottom: 30px;
  font-weight: 600;
}

.input-group {
  margin-bottom: 20px;
  text-align: left;
}

.input-group label {
  display: block;
  margin-bottom: 8px;
  color: #555;
  font-weight: 500;
}

.input-group input {
  width: 100%;
  padding: 12px 15px;
  border: 1px solid #ccc;
  border-radius: 6px;
  box-sizing: border-box;
  transition: border-color 0.3s ease;
}

.input-group input:focus {
  outline: none;
  border-color: #007bff;
  /* Admin theme color */
}

.login-button {
  width: 100%;
  padding: 12px;
  background: linear-gradient(to right, #007bff, #0056b3);
  /* Blue gradient */
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  transition: background 0.3s ease;
  margin-top: 10px;
}

.login-button:hover {
  background: linear-gradient(to right, #0056b3, #004085);
}

.error-message {
  color: #dc3545;
  /* Red for errors */
  margin-top: 15px;
  font-size: 0.9em;
}
</style>