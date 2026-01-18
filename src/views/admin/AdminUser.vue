<script setup>
import AdminSidebar from '@/components/AdminSidebar.vue'
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { fetchCsrfToken } from '@/utils/csrf'
import { useAlertStore } from '@/stores/alert'

const BACKEND_BASE = import.meta.env.VITE_API_URL

const router = useRouter()
const alert = useAlertStore()

const searchQuery = ref('')
const users = ref([])
const selectedUser = ref(null)
const isViewModalOpen = ref(false)
const isEditModalOpen = ref(false)
const isDeleteModalOpen = ref(false)

// Helper to extract backend message safely
async function getBackendMessage(response, fallback) {
  try {
    const data = await response.json()
    return data.message || fallback
  } catch {
    return fallback
  }
}

// Fetch all users from backend
const fetchUsers = async () => {
  const isLoading = ref(true)
  try {
    const res = await fetch(`${BACKEND_BASE}/api/admin/users`, {
      credentials: 'include',
    })
    if (!res.ok) {
      const msg = await getBackendMessage(res, 'Failed to fetch users')
      alert.show(msg, 'error')
      throw new Error(msg)
    }
    const data = await res.json()
    users.value = data
  } catch (err) {
    console.error('Fetch error:', err)
    alert.show(err.message || 'Failed to fetch users', 'error')
  } finally {
    isLoading.value = false
  }
}

// Filtered list based on search query
const filteredUsers = computed(() => {
  return users.value.filter(user => {
    const name = user.name?.toLowerCase() || ''
    const email = user.email?.toLowerCase() || ''
    const query = searchQuery.value.toLowerCase()
    return name.includes(query) || email.includes(query)
  })
})

// View user
const viewUser = async (id) => {
  try {
    const res = await fetch(`${BACKEND_BASE}/api/admin/users/${id}`, {
      credentials: 'include',
    })
    if (!res.ok) {
      const msg = await getBackendMessage(res, 'User not found')
      alert.show(msg, 'error')
      throw new Error(msg)
    }
    selectedUser.value = await res.json()
    isViewModalOpen.value = true
  } catch (err) {
    console.error('View error:', err)
    alert.show(err.message || 'Failed to load user details', 'error')
  }
}

// Edit user (load user data)
const editUser = async (id) => {
  try {
    const res = await fetch(`${BACKEND_BASE}/api/admin/users/${id}`, {
      credentials: 'include',
    })
    if (!res.ok) {
      const msg = await getBackendMessage(res, 'User not found')
      alert.show(msg, 'error')
      throw new Error(msg)
    }
    selectedUser.value = await res.json()
    isEditModalOpen.value = true
  } catch (err) {
    console.error('Edit fetch error:', err)
    alert.show(err.message || 'Failed to load user for editing', 'error')
  }
}

// Submit user edit
const submitEdit = async () => {
  const csrfToken = await fetchCsrfToken()
  try {
    const res = await fetch(`${BACKEND_BASE}/api/admin/users/${selectedUser.value.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': csrfToken,
      },
      credentials: 'include',
      body: JSON.stringify(selectedUser.value),
    })
    if (!res.ok) {
      const msg = await getBackendMessage(res, 'Update failed')
      alert.show(msg, 'error')
      throw new Error(msg)
    }
    alert.show('User updated successfully.', 'success')
    await fetchUsers() // refresh list
    isEditModalOpen.value = false
  } catch (err) {
    console.error('Edit error:', err)
    alert.show(err.message || 'Failed to update user', 'error')
  }
}

// Delete user (load user for confirmation)
const deleteUser = async (id) => {
  try {
    const res = await fetch(`${BACKEND_BASE}/api/admin/users/${id}`, {
      credentials: 'include',
    })
    if (!res.ok) {
      const msg = await getBackendMessage(res, 'User not found')
      alert.show(msg, 'error')
      throw new Error(msg)
    }
    selectedUser.value = await res.json()
    isDeleteModalOpen.value = true
  } catch (err) {
    console.error('Delete fetch error:', err)
    alert.show(err.message || 'Failed to load user for deletion', 'error')
  }
}

// Confirm and perform delete
const confirmDelete = async () => {
  const csrfToken = await fetchCsrfToken()
  try {
    const res = await fetch(`${BACKEND_BASE}/api/admin/users/${selectedUser.value.id}`, {
      method: 'DELETE',
      credentials: 'include',
      headers: {
        'X-CSRFToken': csrfToken,
      },
    })
    if (!res.ok) {
      const msg = await getBackendMessage(res, 'Delete failed')
      alert.show(msg, 'error')
      throw new Error(msg)
    }
    alert.show('User deleted successfully.', 'success')
    users.value = users.value.filter(u => u.id !== selectedUser.value.id)
    isDeleteModalOpen.value = false
  } catch (err) {
    console.error('Delete error:', err)
    alert.show(err.message || 'Failed to delete user', 'error')
  }
}

// Auth check on mount + fetch data
const checkAuth = async () => {
  try {
    const res = await fetch(`${BACKEND_BASE}/api/check-admin-session`, {
      credentials: 'include',
    })
    if (!res.ok) {
      if (res.status === 401) {
        router.push('/admin/login')
      } else {
        const msg = await getBackendMessage(res, `Auth failed: ${res.status}`)
        alert.show(msg, 'error')
        throw new Error(msg)
      }
    }
  } catch (err) {
    console.error('Auth error:', err)
    alert.show(err.message || 'Authentication error', 'error')
    router.push('/admin/login')
  }
}

onMounted(() => {
  checkAuth()
  fetchUsers()
})
</script>


<template>
  <AdminSidebar />
  <div class="admin-dashboard">
    <main class="admin-main-content">
<div class="header">
      <div class="header-logo">
        <Users class='icon' />
        <h1>User Management</h1>
      </div>
      </div>
      <!-- View Modal -->
      <div v-if="isViewModalOpen" class="modal">
        <div class="modal-content">
          <header class="modal-header">
            <h2>User Details</h2>
          </header>
          <section class="modal-body">
            <p><strong>Name:</strong> {{ selectedUser?.first_name }} {{ selectedUser?.last_name }}</p>
            <p><strong>Username:</strong> {{ selectedUser?.username }}</p>
            <p><strong>Email:</strong> {{ selectedUser?.email }}</p>
            <p><strong>Role:</strong> {{ selectedUser?.role }}</p>
            <p><strong>Status:</strong> {{ selectedUser?.status }}</p>
          </section>
          <footer class="modal-footer">
            <button @click="isViewModalOpen = false" class="btn btn-close">Close</button>
          </footer>
        </div>
      </div>

      <!-- Edit Modal -->
      <div v-if="isEditModalOpen" class="modal">
        <div class="modal-content">
          <header class="modal-header">
            <h2>Edit User</h2>
          </header>
          <form @submit.prevent="submitEdit" class="modal-body">
            <label>
              First Name
              <input v-model="selectedUser.first_name" required />
            </label>
            <label>
              Last Name
              <input v-model="selectedUser.last_name" required />
            </label>
            <label>
              Status
              <select v-model="selectedUser.status">
                <option>active</option>
                <option>inactive</option>
              </select>
            </label>
            <footer class="modal-footer">
              <button @click="isEditModalOpen = false" type="button" class="btn btn-cancel">Cancel</button>
              <button type="submit" class="btn btn-save">Save</button>
            </footer>
          </form>
        </div>
      </div>

      <!-- Delete Modal -->
      <div v-if="isDeleteModalOpen" class="modal">
        <div class="modal-content">
          <header class="modal-header">
            <h2>Confirm Deletion</h2>
          </header>
          <section class="modal-body">
            <p>Are you sure you want to delete user <strong>{{ selectedUser?.name }}</strong>?</p>
          </section>
          <footer class="modal-footer">
            <button @click="isDeleteModalOpen = false" class="btn btn-cancel">Cancel</button>
            <button @click="confirmDelete" class="btn btn-delete">Yes, Delete</button>
          </footer>
        </div>
      </div>

      <p v-if="isLoading" class="loading-text">Loading users...</p>

      <div class="user-controls">
        <input v-model="searchQuery" type="search" placeholder="Search by name or email..." aria-label="Search users" />
      </div>

      <div class="user-table-wrapper">
        <table class="user-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Username</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in filteredUsers" :key="user.id" tabindex="0">
              <td>{{ user.id }}</td>
              <td>{{ user.first_name }} {{ user.last_name }}</td>
              <td>{{ user.username }}</td>
              <td>{{ user.email }}</td>
              <td>{{ user.role }}</td>
              <td>
                <span :class="['status', user.status]">{{ user.status }}</span>
              </td>
              <td class="actions-cell">
                <button class="btn btn-view" @click="viewUser(user.id)">View</button>
                <button class="btn btn-edit" @click="editUser(user.id)">Edit</button>
                <button class="btn btn-delete" @click="deleteUser(user.id)">Delete</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </main>
  </div>
</template>

<style scoped>

.admin-dashboard {
  margin-left: 70px;
  display: flex;
  height: 100vh;
  background-color: #f9fafb;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.admin-main-content {
  flex: 1;
    padding: 30px 40px;

  overflow-y: auto;
  background-color: #ffffff;
  border-top-left-radius: 18px;
  box-shadow: 0 10px 30px rgb(0 0 0 / 0.05);
}


.header{
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 1px solid rgb(184, 177, 177);
}
.header-logo{
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-start;
}
h1 {
  color: #222f3e;
  font-size: 32px;
  font-weight: 700;
  margin-bottom: 8px;
  letter-spacing: 0.03em;
}

p {
  color: #57606f;
  font-size: 1.05rem;
  margin-bottom: 28px;
  line-height: 1.5;
}


.user-controls {
  margin-bottom: 28px;
  width: 100%;
}

.user-controls input {
  width: 100%;
  padding: 12px 16px;
  font-size: 16px;
  border: 1.8px solid #ced6e0;
  border-radius: 12px;
  box-shadow: inset 0 2px 5px rgb(0 0 0 / 0.03);
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
}

.user-controls input:focus {
  border-color: #e3e4f3;
  box-shadow: 0 0 8px rgba(55, 66, 250, 0.4);
  outline: none;
}


.user-table-wrapper {
  overflow-x: auto;
}

.user-table {
  width: 97%;
  border-collapse: separate;
  border-spacing: 0 10px;
  background-color: transparent;
  font-size: 15px;
}

.user-table thead tr th {
  background: transparent;
  color: #57606f;
  font-weight: 600;
  text-transform: uppercase;
  font-size: 13px;
  padding: 14px 18px;
  text-align: left;
  letter-spacing: 0.05em;
  border-bottom: 2px solid #dcdde1;
}

.user-table tbody tr {
  background: #f1f2f6;
  border-radius: 14px;
  box-shadow: 0 2px 8px rgb(0 0 0 / 0.05);
  transition: background-color 0.2s ease;
}

.user-table tbody tr:hover,
.user-table tbody tr:focus-within {
  background-color: #dff9fb;
  outline: none;
}

.user-table tbody td {
  padding: 16px 18px;
  color: #2f3542;
  vertical-align: middle;
  border: none;
}


.status {
  padding: 6px 14px;
  border-radius: 20px;
  font-weight: 600;
  font-size: 0.9rem;
  text-transform: capitalize;
  user-select: none;
  display: inline-block;
}

.status.active {
  background-color: #2ed573;
  color: #1eae48;
  box-shadow: 0 0 8px #2ed573aa;
}

.status.inactive {
  background-color: #ff6b81;
  color: #b8324b;
  box-shadow: 0 0 8px #ff6b81aa;
}


.actions-cell {
  white-space: nowrap;
}

.btn {
  font-weight: 600;
  border: none;
  border-radius: 10px;
  padding: 9px 20px;
  cursor: pointer;
  color: white;
  font-size: 14px;
  width: auto;
  margin-right: 8px;
  box-shadow: 0 4px 12px rgb(0 0 0 / 0.1);
  transition: background-color 0.3s ease, transform 0.15s ease, box-shadow 0.3s ease;
}

.btn:hover,
.btn:focus {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgb(0 0 0 / 0.15);
  outline: none;
}


.btn-view {
  background: linear-gradient(135deg, #1dd1a1, #10ac84);
  box-shadow: 0 4px 12px #10ac84aa;
}

.btn-edit {
  background: linear-gradient(135deg, #ffa502, #ff7f50);
  box-shadow: 0 4px 12px #ff7f50aa;
}

.btn-delete {
  background: linear-gradient(135deg, #ff4757, #c0392b);
  box-shadow: 0 4px 12px #c0392baa;
}

.loading-text {
  font-size: 1.2rem;
  font-weight: 600;
  color: #57606f;
  margin-bottom: 24px;
  user-select: none;
}


.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(34, 49, 63, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1100;
  animation: fadeIn 0.3s ease forwards;
}

.modal-content {
  background: #fff;
  padding: 36px 44px;
  border-radius: 20px;
  width: 100%;
  max-width: 520px;
  box-shadow: 0 12px 36px rgb(0 0 0 / 0.25);
  animation: scaleIn 0.3s ease forwards;
  color: #222f3e;
  display: flex;
  flex-direction: column;
}

.modal-header h2 {
  font-weight: 700;
  font-size: 26px;
  margin: 0 0 18px 0;
  letter-spacing: 0.03em;
  color: #1e272e;
}

.modal-body {
  font-size: 17px;
  color: #57606f;
  line-height: 1.6;
  flex-grow: 1;
}

.modal-body label {
  display: block;
  margin-bottom: 18px;
  font-weight: 600;
  color: #222f3e;
}

.modal-body input,
.modal-body select {
  width: 100%;
  padding: 12px 14px;
  border: 1.8px solid #ced6e0;
  border-radius: 12px;
  font-size: 16px;
  box-shadow: inset 0 2px 6px rgba(0, 0, 0, 0.04);
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
}

.modal-body input:focus,
.modal-body select:focus {
  border-color: #3742fa;
  box-shadow: 0 0 8px rgba(55, 66, 250, 0.3);
  outline: none;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 14px;
  margin-top: 24px;
}


.btn-close {
  background: #57606f;
  box-shadow: 0 4px 12px #57606faa;
  color: #fff;
}

.btn-close:hover,
.btn-close:focus {
  background: #3d4451;
}

.btn-cancel {
  background: #aaaeb3;
  box-shadow: 0 4px 12px #aaaeb3aa;
  color: #222f3e;
}

.btn-cancel:hover,
.btn-cancel:focus {
  background: #858a92;
}

.btn-save {
  background: #3742fa;
  box-shadow: 0 4px 12px #3742faaa;
  color: white;
}

.btn-save:hover,
.btn-save:focus {
  background: #2a33c7;
}

.icon {
  width: 36px;
  height: auto;
  margin-right: 8px;
}

/* Animations */
@keyframes fadeIn {
  from {
    background: rgba(34, 49, 63, 0);
  }

  to {
    background: rgba(34, 49, 63, 0.6);
  }
}

@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.85);
  }

  to {
    opacity: 1;
    transform: scale(1);
  }
}
</style>
