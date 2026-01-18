<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
const BACKEND_BASE = import.meta.env.VITE_API_URL


const router = useRouter();
const user = ref({});


const fetchUser = async () => {
  try {
    const res = await fetch(`${BACKEND_BASE}/api/user/me`, {
      credentials: "include",
    });

    if (!res.ok) {
      if (res.status === 401) router.push("/login");
      else throw new Error("Unexpected error");
    }

    const data = await res.json();
    user.value = data.user;
    editForm.value = { ...data.user };
  } catch (err) {
    console.error(err);
  }
};


const checkAuth = async () => {
  try {
    const res = await fetch(`${BACKEND_BASE}/api/check-session`, {
      credentials: "include",
    });
    if (!res.ok) {
      if (res.status === 401) router.push('/login');
      else throw new Error("Auth check failed");
    }
  } catch (err) {
    console.error("User auth check error:", err);
    router.push('/login');
  }
};
const profileData = computed(() => ({
  "First Name": user.value.first_name,
  "Last Name": user.value.last_name,
  "Username": user.value.username,
  "Email": user.value.email
}));
onMounted(() => {
  checkAuth();
  fetchUser();
});
</script>

<template>
      <div class="profile-wrapper">
        <div class="profile-header">
          <div>
            <h1 class="profile-heading">Welcome, {{ user.first_name }} 👋</h1>
            <p class="subheading">Here’s a quick glance at your account info</p>
          </div>
          <button class="edit-btn" @click="router.push('/dashboard/profile/edit')">
            ✏️ Edit Info
          </button>
        </div>

        <div class="profile-grid">
          <div class="profile-box animated" v-for="(value, label) in profileData" :key="label">
            <span class="label">{{ label }}</span>
            <p class="value">{{ value }}</p>
          </div>
        </div>
      </div>

</template>



<style scoped>

.profile-wrapper {
  max-width: 800px;
  margin: 0 auto;
}

.profile-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 40px;
}

.header h1 {
    font-family: 'Cormorant Garamond', serif;
    font-size: 3rem;
    /* margin-bottom: 1.5rem; */
    color: var(--text);
    border-bottom: 1px solid rgb(217, 217, 217);
    padding-bottom: 20px;
    text-shadow: 2px 2px 4px rgba(0,0,0,0.1);
}

.subheading {
  font-size: 1.1rem;
  color: #6c6c6c;
}

.edit-btn {
  padding: 10px 20px;
  font-size: 1rem;
  background-color: #f72585;
  color: white;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: background-color 0.3s ease;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}

.edit-btn:hover {
  background-color: #c9184a;
}

.profile-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 30px;
}

.profile-box {
  background: white;
  padding: 25px 30px;
  border-radius: 20px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.05);
  opacity: 0;
  transform: translateY(20px);
  animation: fadeInUp 0.6s ease forwards;
}

.profile-box:nth-child(1) { animation-delay: 0.1s; }
.profile-box:nth-child(2) { animation-delay: 0.2s; }
.profile-box:nth-child(3) { animation-delay: 0.3s; }
.profile-box:nth-child(4) { animation-delay: 0.4s; }

.label {
  font-size: 0.9rem;
  color: #c9184a;
  text-transform: uppercase;
  letter-spacing: 1px;
  font-weight: 600;
}

.value {
  margin-top: 10px;
  font-size: 1.2rem;
  font-weight: 500;
  color: #333;
}

@keyframes fadeInUp {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>

