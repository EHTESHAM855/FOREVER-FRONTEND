<template>
  <div class="admin-dashboard">
    <AdminSidebar />
    <main class="admin-main-content">

      <!-- Edit Details Section -->
      <div class="details-section">
        <h2>Edit Your Details</h2>
        <form @submit.prevent="updateAdminDetails" class="form-layout">
  <!-- Personal Info -->
  <div class="form-section">
    <h3>Personal Information</h3>
    <div class="form-grid">
      <div class="form-group">
        <label for="first-name">First Name</label>
        <input type="text" id="first-name" v-model="adminDetails.first_name" />
      </div>
      <div class="form-group">
        <label for="last-name">Last Name</label>
        <input type="text" id="last-name" v-model="adminDetails.last_name" />
      </div>
    </div>
  </div>

  <!-- Account Info -->
  <div class="form-section">
    <h3>Account Details</h3>
    <div class="form-grid">
      <div class="form-group">
        <label for="username">Username</label>
        <input type="text" id="username" v-model="adminDetails.username" required />
      </div>
      <div class="form-group">
        <label for="email">Email Address</label>
        <input type="email" id="email" v-model="adminDetails.email" required />
      </div>
      <div class="form-group full-width">
        <label for="password">New Password <span class="optional">(Leave blank to keep current)</span></label>
        <input type="password" id="password" v-model="adminDetails.password" />
      </div>
    </div>
  </div>

  <!-- Submit Button -->
  <div class="form-actions">
    <button type="submit" class="btn-submit">Update Details</button>
  </div>
</form>

      </div>
    </main>
  </div>
</template>

<script setup>
import AdminSidebar from '@/components/AdminSidebar.vue';
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { fetchCsrfToken } from '@/utils/csrf';
import { useAlertStore } from '@/stores/alert';
import { useConfirmStore } from '@/stores/confirm'

const confirm = useConfirmStore()

const BACKEND_BASE = import.meta.env.VITE_API_URL

const router = useRouter();
const alert = useAlertStore();

const adminDetails = ref({
  username: '',
  email: '',
  first_name: '',
  last_name: '',
  password: '',
  isRootAdmin: false
});

// Fetch current admin details for editing
const fetchAdminDetails = async () => {
  try {
    const res = await fetch(`${BACKEND_BASE}/api/admin-details`, {
      credentials: 'include',
    });
    if (res.ok) {
      const data = await res.json();
      adminDetails.value = data;
    } else {
      alert.show('Failed to fetch admin details.', 'error');
      router.push('/admin/login');
    }
  } catch (err) {
    console.error('Error fetching admin details:', err);
    alert.show('Error fetching admin details. Please login again.', 'error');
    router.push('/admin/login');
  }
};

const updateAdminDetails = async () => {
  const confirmed = await confirm.show("Are you sure to update the information?")
  if (confirmed){
  const csrfToken = await fetchCsrfToken();
  try {
    const res = await fetch(`${BACKEND_BASE}/api/update-admin-details`, {
      method: 'PUT',
      credentials: "include",
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': csrfToken
      },
      body: JSON.stringify(adminDetails.value),
    });
    if (res.ok) {
      alert.show('Details updated successfully!', 'success');
    } else {
      const data = await res.json().catch(() => null);
      alert.show(data?.message || 'Failed to update details.', 'error');
      throw new Error('Failed to update details');
    }
  } catch (err) {
    console.error('Error updating details:', err);
    if (!err.message.includes('Failed to update details')) {
      alert.show('Error updating details.', 'error');
    }
  }}
};

onMounted(() => {
  fetchAdminDetails(); // Fetch the current logged-in admin details for editing
});
</script>


<style scoped>
.admin-dashboard {
  margin-left: 65px;
  display: flex;
  height: 100vh;
  background: #ffffff;
}

.admin-main-content {
  flex: 1;
  /* padding: 50px; */
  background: inherit;
  border-radius: 20px;
  margin: 30px;
  /* box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1); */
  overflow-y: auto;
  backdrop-filter: blur(10px);
}

h2 {
  color: #2d3436;
  font-size: 26px;
  font-weight: 700;
  margin-bottom: 30px;
}


.details-section {
  background: white;
  /* padding: 40px; */
  border-radius: 16px;
  /* box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08); */
  transition: all 0.3s ease;
}


form {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 25px;
}

.form-group {
  display: flex;
  flex-direction: column;
}

label {
  font-weight: 600;
  color: #555;
  margin-bottom: 8px;
  font-size: 15px;
}

input {
  padding: 14px 16px;
  border-radius: 10px;
  border: 1.5px solid #dfe6e9;
  font-size: 15px;
  color: #2d3436;
  background-color: #f9f9f9;
  transition: border 0.3s, box-shadow 0.3s;
}

input:focus {
  border-color: #74b9ff;
  outline: none;
  box-shadow: 0 0 0 3px rgba(116, 185, 255, 0.2);
}


.btn-submit {
  grid-column: span 2;
  padding: 14px 24px;
  background: linear-gradient(to right, #6c5ce7, #a29bfe);
  color: white;
  font-weight: 600;
  border: none;
  border-radius: 10px;
  font-size: 16px;
  cursor: pointer;
  transition: transform 0.2s, background 0.3s;
  max-width: 100%;
  width: 100%;
}

.btn-submit:hover {
  background: linear-gradient(to right, #5e54c7, #8e85f2);
  transform: translateY(-2px);
}


@media (max-width: 768px) {
  .admin-main-content {
    padding: 30px 20px;
    margin: 15px;
  }

  .btn-submit {
    grid-column: span 1;
    width: 100%;
  }
}

.form-layout {
  display: flex;
  flex-direction: column;
  gap: 40px;
}

.form-section {
  background: #ffffff;
  border-radius: 12px;
  padding: 30px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.06);
}

.form-section h3 {
  margin-bottom: 25px;
  font-size: 18px;
  color: #2c3e50;
  font-weight: 600;
  border-left: 4px solid #74b9ff;
  padding-left: 10px;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
}

.full-width {
  grid-column: span 2;
}

.optional {
  font-weight: normal;
  color: #999;
  font-size: 13px;
  margin-left: 6px;
}

.form-actions {
  display: flex;
  justify-content: flex-start;
}


</style>
