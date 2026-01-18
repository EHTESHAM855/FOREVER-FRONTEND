<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import GoogleLoginButton from '@/components/GoogleLoginButton.vue';
import { fetchCsrfToken } from "@/utils/csrf";
const BACKEND_BASE = import.meta.env.VITE_API_URL
import { useRoute } from 'vue-router';
import ResetPassword from '@/components/ResetPassword.vue';

const showModal = ref(false)


const route = useRoute();
const router = useRouter();
const showPassword = ref(false);

const email = ref('');
const password = ref('');
const message = ref('');

const checkSession = async () => {
  try {
    const res = await fetch(`${BACKEND_BASE}/api/check-session`, {
      method: "GET",
      credentials: "include"
    });

    if (!res.ok) throw new Error("Not logged in");

    const data = await res.json();
    if (data.logged_in) {
      router.push("/dashboard");
    }
  } catch (err) {
    console.log("User not logged in", err);
  }
};

const handleLogin = async () => {
  const csrfToken = await fetchCsrfToken();

  if (!csrfToken) {
    message.value = "Security token missing. Please refresh and try again.";
    return;
  }

  try {
    const response = await fetch(`${BACKEND_BASE}/api/login`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "X-CSRFToken": csrfToken,
      },
      body: JSON.stringify({
        user_email: email.value,
        user_password: password.value,
      }),
    });

    let data = {};
    try {
      data = await response.json();
    } catch (err) {
      console.error("Response is not valid JSON:", err);
      message.value = "Unexpected response from server.";
      return;
    }

    if (response.ok) {
      router.push("/dashboard");
    } else {
      message.value = data.message || "Login failed. Please check your credentials.";
    }
  } catch (error) {
    console.error("Login error:", error);
    message.value = "Network error - please try again later.";
  }
};
onMounted(() => {
  checkSession();

  const errorMessage = route.query.error;
  if (errorMessage) {
    message.value = decodeURIComponent(errorMessage);
  }
});
</script>



<template>
  <div class="page">
    <div class="registration-container">
      <div class="form-box">
        <h2><strong>Login</strong></h2>
        <p v-if="message" style="color: red; font-weight: bold;">{{ message }}</p>
        <form @submit.prevent="handleLogin">
          <div class="input-group">
            <input id="email" type="text" v-model="email" name="email" placeholder="Email or Username" required>
          </div>
          <div class="input-group password-group">
            <input id="password" :type="showPassword ? 'text' : 'password'" v-model="password" name="password"
              placeholder="Password" required class="password-input" />
            <span @click="showPassword = !showPassword" class="toggle-password">
              {{ showPassword ? '👁️' : '👁️‍🗨️' }}
            </span>
          </div>

          <button type="submit" class="btn">Login</button>
        </form>
        <div class="forgot_password">
        <span @click="showModal = true" id="forgot_password">Forgot Password</span></div>
        <ResetPassword :show="showModal" @close="showModal = false" />

        <div class="google-button-wrapper">
          <GoogleLoginButton />
        </div>
        <p class="signup-text">
          Don't have an account yet?
          <RouterLink to="/register" style="color: green;">Register Now</RouterLink>
        </p>
      </div>
    </div>
  </div>

</template>

<style>
.page {
  font-family: 'Poppins', sans-serif;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background: #f8e7e7;
}

.registration-container {
  width: 100%;
  max-width: 450px;
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
  padding: 30px 25px;
  transition: all 0.3s ease-in-out;
}

.form-box {
  text-align: center;
}

.form-box h2 {
  font-size: 28px;
  color: #2c3e50;
  margin-bottom: 20px;
  font-weight: 600;
}

.input-group {
  margin-bottom: 18px;
  text-align: left;
}

.input-group input {
  width: 100%;
  padding: 12px 14px;
  font-size: 15px;
  border: 1px solid #dcdcdc;
  border-radius: 8px;
  background-color: #f9f9f9;
  transition: border-color 0.3s, box-shadow 0.3s;
}

.input-group input::placeholder {
  color: #aaa;
}

.input-group input:focus {
  border-color: #6c63ff;
  box-shadow: 0 0 0 2px rgba(108, 99, 255, 0.15);
  background-color: #fff;
  outline: none;
}

.btn {
  width: 100%;
  padding: 12px;
  font-size: 16px;
  color: white;
  border: none;
  background: #fe8d9e;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: background 0.3s ease;
}

.btn:hover {
  background: #FFB6C1;
}

.social-login {
  margin: 20px 0;
  font-weight: 500;
  color: #555;
}

.signin-text {
  font-size: 14px;
  color: #555;
  margin-top: 10px;
}

.signin-text a {
  color: #6c63ff;
  font-weight: 500;
  text-decoration: none;
}

.signin-text a:hover {
  text-decoration: underline;
}

.error-message {
  color: #e74c3c;
  font-weight: 500;
  margin-bottom: 12px;
}
.forgot_password{
  width: 100%;
  margin: 10px;
  cursor: pointer;
  display: flex;
  justify-content: flex-start;
  transition: all 0s;
}
.forgot_password:hover{
  color: rgb(27, 27, 250);
  text-decoration: underline;
}

@media (max-width: 600px) {
  .registration-container {
    width: 90%;
    padding: 20px;
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  }
}

.google-button-wrapper {
  margin-top: 10px;
}


.signup-text {
  margin-top: 15px;
}

.signup-text a {
  color: #6a11cb;
}

.signup-text a:hover {
  text-decoration: underline;
}

.password-group {
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
}

.password-input {
  width: 100%;
  padding: 10px 40px 10px 12px;
  font-size: 1rem;
  border: 1px solid #ccc;
  border-radius: 8px;
  outline: none;
  transition: border 0.2s ease;
}

.password-input:focus {
  border-color: #5b9bd5;
}

.toggle-password {
  position: absolute;
  right: 12px;
  cursor: pointer;
  font-size: 1.2rem;
  user-select: none;
  color: #666;
}
</style>
