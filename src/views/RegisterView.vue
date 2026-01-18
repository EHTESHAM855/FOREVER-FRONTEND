<script setup>
import { ref, reactive, onMounted, watch, computed } from 'vue';
import { useRouter } from 'vue-router';
import GoogleLoginButton from '@/components/GoogleLoginButton.vue';
import { fetchCsrfToken } from "@/utils/csrf";
const BACKEND_BASE = import.meta.env.VITE_API_URL


const router = useRouter();
const showPassword = ref(false);
const form = reactive({
  username: '',
  first_name: '',
  last_name: '',
  email: '',
  password: ''
});

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
const registering = ref(false)
const registerUser = async () => {
  registering.value = true
  const csrfToken = await fetchCsrfToken();

  try {
    const response = await fetch(`${BACKEND_BASE}/api/user/register`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "X-CSRFToken": csrfToken,
      },
      body: JSON.stringify({
        username: form.username,
        user_f_name: form.first_name,
        user_l_name: form.last_name,
        user_email: form.email,
        user_password: form.password
      })
    });

    let data = {};
    try {
      data = await response.json();
    } catch (e) {
      // Not JSON
    }

    if (response.ok) {
      router.push("/login");
    } else {
      message.value = data.message || "Registration failed. Try again.";
    }
  } catch (error) {
    console.error("Registration error:", error);
    message.value = "Network error. Please try again later.";
  }
  registering.value=false
};

const passwordRules = ref({
  length: false,
  lowercase: false,
  uppercase: false,
  number: false,
  specialChar: false,
});

watch(() => form.password, (newVal) => {
  passwordRules.value.length = newVal.length >= 7;
  passwordRules.value.lowercase = /[a-z]/.test(newVal);
  passwordRules.value.uppercase = /[A-Z]/.test(newVal);
  passwordRules.value.number = /\d/.test(newVal);
  passwordRules.value.specialChar = /[^a-zA-Z0-9]/.test(newVal);
  console.log(passwordRules)
});


const isPasswordValid = computed(() =>
  passwordRules.value.length &&
  passwordRules.value.lowercase &&
  passwordRules.value.uppercase &&
  passwordRules.value.number &&
  passwordRules.value.specialChar &&
  form.username.length >= 8
);


onMounted(checkSession);
</script>



<template>
  <div class="page">
    <div class="registration-container">
      <div class="form-box">
        <h2><strong>Register</strong></h2>

        <p v-if="message" class="error-message">{{ message }}</p>

        <form @submit.prevent="registerUser">
          <div class="input-cont">
            <div class="input-group">
              <input type="text" v-model="form.username" placeholder="Username" minlength="8" required
                title="Username length should be greater than or equal to 8 characters!!" />
              <ul class="password-feedback" v-if="form.username.length > 1">
                <li :class="{ valid: form.username.length >= 8 }">✔ At least 8 characters long</li>
              </ul>
            </div>
            <div class="input-group">
              <input type="email" v-model="form.email" placeholder="Email" required />
            </div>
          </div>
          <div class="input-cont">
            <div class="input-group">
              <input type="text" v-model="form.first_name" placeholder="First Name" required />
            </div>
            <div class="input-group">
              <input type="text" v-model="form.last_name" placeholder="Last Name" required />
            </div>
          </div>

          <div class="input-group password-group">
            <input id="password" v-model="form.password" name="password" placeholder="Password" minlength="7"
              :type="showPassword ? 'text' : 'password'" pattern="(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z0-9]).{7,}"
              title="Password must be at least 7 characters long and include at least one uppercase letter, one lowercase letter, one number, and one special character."
              required class="password-input" />
            <span @click="showPassword = !showPassword" class="toggle-password">
              {{ showPassword ? '👁️' : '👁️‍🗨️' }}
            </span>
          </div>

          <ul class="password-feedback" v-if="form.password.length > 1">
            <li :class="{ valid: passwordRules.length }">✔ At least 7 characters</li>
            <li :class="{ valid: passwordRules.lowercase }">✔ One lowercase letter</li>
            <li :class="{ valid: passwordRules.uppercase }">✔ One uppercase letter</li>
            <li :class="{ valid: passwordRules.number }">✔ One number</li>
            <li :class="{ valid: passwordRules.specialChar }">✔ One special character</li>
          </ul>


          <button type="submit" class="btn" :disabled="!isPasswordValid || registering">{{ registering ? "Registering..." : "Register" }}</button>
        </form>


        <!-- <p class="social-login">Or</p> -->
        <div class="google-button-wrapper">
          <GoogleLoginButton />
        </div>
        <p class="signin-text">
          Already registered?
          <RouterLink to="/login">Login</RouterLink>
        </p>
      </div>
    </div>
  </div>
</template>


<style scoped>
.page {
  font-family: 'Poppins', sans-serif;
  display: flex;
  justify-content: center;
  align-items: center;
  height: auto;
  padding: 100px 20px;
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
.input-cont{
  display: flex;
  flex-direction: auto;
  gap: 10px;
  min-width: 400px;
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
  background: #fe8d9e;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: background 0.3s ease;
}

.btn:hover {
  background: #FFB6C1;

}

.btn:disabled {
  background: #FFB6C1;
  cursor: not-allowed;

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

.password-feedback {
  list-style: none;
  padding: 0;
  margin-top: 8px;
  font-size: 13px;
  color: #ff0000;
}

.password-feedback li {
  margin-bottom: 4px;
}

.password-feedback li.valid {
  color: green;
  font-weight: 500;
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
  /* right padding for the icon */
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

.password-feedback {
  list-style: none;
  padding: 8px 0 0;
  margin: 0;
  text-align: left;
  font-size: 0.9rem;
}

.password-feedback li {
  color: #888;
  margin-bottom: 4px;
}

.password-feedback li.valid {
  color: #28a745;
  /* Green for valid */
  font-weight: 500;
}
</style>