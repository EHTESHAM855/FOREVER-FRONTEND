<template>
  <div class="admin-dashboard">
    <AdminSidebar />
    <main class="admin-main-content">
      <h1 class="page-title">Admin Profile</h1>

      <div class="profile-grid">
        <!-- Left: Profile Info Cards -->
        <section class="profile-main">
          <!-- Identity -->
          <div class="card identity-card">
            <div class="card-header">
              <img
                :src="`https://ui-avatars.com/api/?name=${adminDetails.first_name}+${adminDetails.last_name}&background=3498db&color=fff`"
                alt="Avatar" class="avatar" />
              <div>
                <h2>{{ adminDetails.first_name }} {{ adminDetails.last_name }}</h2>
                <p>{{ adminDetails.isRootAdmin ? 'Root Administrator' : 'Administrator' }}</p>
              </div>
            </div>
          </div>

          <!-- Personal Details -->
          <div class="card detail-card">
            <h3>Personal Details</h3>
            <div class="info-pair" v-for="(value, label) in personalDetails" :key="label">
              <label>{{ label }}:</label>
              <span>{{ value }}</span>
            </div>
          </div>

          <!-- Contact Info -->
          <div class="card detail-card">
            <h3>Contact Information</h3>
            <div class="info-pair">
              <label>Email:</label>
              <span>{{ adminDetails.email }}</span>
            </div>
          </div>

          <!-- Privileges -->
          <div class="card detail-card">
            <h3>Access & Privileges</h3>
            <div class="info-pair">
              <label>Role:</label>
              <span>{{ adminDetails.isRootAdmin ? 'Root Admin' : 'Standard Admin' }}</span>
            </div>
            <div class="info-pair">
              <label>Privileges:</label>
              <span>
                {{ adminDetails.isRootAdmin ? 'Full access to all settings and users' : 'Limited to assigned modules' }}
              </span>
            </div>
          </div>
        </section>

        <!-- Right: Sidebar Summary & Actions -->
        <aside class="profile-sidebar">
          <div class="card summary-card">
            <h3>Account Summary</h3>
            <ul>
              <li><strong>Last Login:</strong> Just now</li>
              <li><strong>Admin Since:</strong> —</li>
              <li><strong>Status:</strong> Active</li>
              <li><strong>Sessions:</strong> —</li>
            </ul>
          </div>

          <div class="card activity-card">
            <h3>Quick Actions</h3>
            <RouterLink to="/admin/settings/editProfile" class="btn-action">Edit Profile</RouterLink>
            <RouterLink to="/admin/settings/editProfile" class="btn-action">Change Password</RouterLink>
            <button @click.prevent="logout" class="btn-action danger">Logout</button>
          </div>
        </aside>
      </div>
    </main>
  </div>
</template>

<script setup>
import AdminSidebar from '@/components/AdminSidebar.vue';
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
const BACKEND_BASE = import.meta.env.VITE_API_URL

const router = useRouter();


const adminDetails = ref({
  username: '',
  email: '',
  first_name: '',
  last_name: '',
  isRootAdmin: false
});

const personalDetails = ref({});


const fetchAdminDetails = async () => {
  try {
    const res = await fetch(`${BACKEND_BASE}/api/admin-details`, {
      credentials: 'include',
    });
    if (res.ok) {
      const data = await res.json();
      adminDetails.value = data;


      personalDetails.value = {
        Username: data.username,
        'First Name': data.first_name,
        'Last Name': data.last_name,
      };
    } else {
      throw new Error('Failed to fetch admin details');
    }
  } catch (err) {
    console.error('Error fetching admin details:', err);
    router.push('/admin/login');
  }
};


const logout = async () => {
  try {
    const res = await fetch(`${BACKEND_BASE}/api/logout`, {
      method: "GET",
      credentials: "include",
    });
    if (!res.ok) throw new Error("Logout failed");
    router.push("/admin/login");
  } catch (err) {
    console.error("Logout error:", err);
    alert("Logout failed. Please try again.");
  }
};

onMounted(() => {
  fetchAdminDetails();
});
</script>


<style scoped>
.admin-dashboard {
  margin-left: 65px;
  display: flex;
  background-color: #f4f6f8;
  height: 100vh;
  overflow: hidden;
}

.admin-main-content {
  flex: 1;
  padding: 40px;
  overflow-y: auto;
  background-color: #ffffff;
}

.page-title {
  font-size: 28px;
  color: #2c3e50;
  margin-bottom: 30px;
  font-weight: 600;
}

.profile-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 30px;
}

.profile-main,
.profile-sidebar {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.card {
  background-color: #fff;
  border-radius: 12px;
  padding: 25px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05);
}

.card h3 {
  margin-bottom: 18px;
  font-size: 18px;
  color: #34495e;
}

.identity-card .card-header {
  display: flex;
  align-items: center;
  gap: 20px;
}

.avatar {
  width: 70px;
  height: 70px;
  border-radius: 50%;
  border: 3px solid #3498db;
  object-fit: cover;
}

.card-header h2 {
  margin: 0;
  font-size: 22px;
  color: #2c3e50;
}

.card-header p {
  margin-top: 6px;
  color: #2980b9;
  font-weight: 500;
}


.info-pair {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px dashed #eee;
}

.info-pair label {
  font-weight: 600;
  color: #7f8c8d;
}

.info-pair span {
  color: #2c3e50;
  text-align: right;
}

.summary-card ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.summary-card li {
  font-size: 14px;
  color: #555;
  margin-bottom: 10px;
}

.btn-action {
  display: block;
  width: 100%;
  text-align: center;
  padding: 12px;
  background-color: #3498db;
  color: #fff;
  border-radius: 6px;
  text-decoration: none;
  font-weight: 500;
  margin-bottom: 10px;
  transition: background-color 0.3s ease;
}

.btn-action:hover {
  background-color: #2980b9;
}

.btn-action.danger {
  background-color: #e74c3c;
}

.btn-action.danger:hover {
  background-color: #c0392b;
}

@media (max-width: 900px) {
  .profile-grid {
    grid-template-columns: 1fr;
  }

  .avatar {
    width: 60px;
    height: 60px;
  }

  .card-header h2 {
    font-size: 20px;
  }

  .admin-main-content {
    padding: 20px;
  }
}
</style>
