<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { fetchCsrfToken } from "@/utils/csrf";
const BACKEND_BASE = import.meta.env.VITE_API_URL
import { useAlertStore } from '@/stores/alert'
import { useConfirmStore } from '@/stores/confirm'

const confirm = useConfirmStore()

const alert = useAlertStore()


const router = useRouter();
const user = ref({});


const editForm = ref({
  first_name: "",
  last_name: "",
  username: "",
});


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

const updateProfile = async () => {
  const confirmed = await confirm.show("Are you sure to update the information?")
  if (confirmed){
  try {
    const csrfToken = await fetchCsrfToken();
    const res = await fetch(`${BACKEND_BASE}/api/user/update`, {
      method: "PUT",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": csrfToken,
      },
      body: JSON.stringify(editForm.value),
    });

    if (!res.ok) {
      const data = await res.json();
      alert.show("Update failed: " + data.message, "error");
      return;
    }

    alert.show("Profile updated!", "success");
    fetchUser();
  } catch (err) {
    console.error(err);
    alert.show("Failed to update profile.", "error");
  }}
  return none;
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

onMounted(() => {
  checkAuth();
  fetchUser();
});
</script>

<template>
      <div class="edit-profile-container">
        <div class="edit-card animated">
          <h2 class="section-title">Edit Profile</h2>
          <form @submit.prevent="updateProfile" class="profile-form">
            <label>
              First Name
              <input v-model="editForm.first_name" placeholder="Enter your first name" />
            </label>

            <label>
              Last Name
              <input v-model="editForm.last_name" placeholder="Enter your last name" />
            </label>

            <label>
              Username
              <input v-model="editForm.username" placeholder="Choose a username" />
            </label>

            <label>
              Email
              <input type="email" v-model="editForm.email" placeholder="Enter your email" readonly/>
            </label>

            <button type="submit" class="submit-btn">Save Changes</button>
          </form>
        </div>
      </div>
</template>


<style scoped>


.edit-profile-container {
  max-width: 700px;
  margin: 0 auto;
}

.edit-card {
  background: #fff;
  padding: 40px;
  border-radius: 20px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.05);
  animation: fadeInUp 0.6s ease forwards;
  opacity: 0;
  transform: translateY(20px);
}

.section-title {
  font-size: 3rem;
  font-family: 'Cormorant Garamond', serif;
  color: var(--text);
  margin-bottom: 30px;
  text-align: center;
  padding-bottom: 20px;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.1);
}


.profile-form label {
  display: block;
  margin-bottom: 20px;
  color: #6a040f;
  font-weight: 600;
}

.profile-form input {
  width: 100%;
  padding: 12px;
  margin-top: 8px;
  border: 1px solid #ffc8dd;
  border-radius: 10px;
  background: #fff;
  font-size: 1rem;
  transition: border 0.3s ease;
}

.profile-form input:focus {
  outline: none;
  border-color: #f72585;
  box-shadow: 0 0 5px rgba(247, 37, 133, 0.2);
}

.submit-btn {
  margin-top: 30px;
  padding: 12px 30px;
  background: #f72585;
  color: white;
  border: none;
  border-radius: 12px;
  font-weight: bold;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.3s ease;
  display: block;
  width: 100%;
}

.submit-btn:hover {
  background: #c9184a;
}

@keyframes fadeInUp {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
