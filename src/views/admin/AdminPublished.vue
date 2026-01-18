<template>
  <div class="admin-dashboard">
    <AdminSidebar />
    <main class="admin-main-content">
      <div class="header">
      <div class="header-logo">
        <Globe class='icon' />
        <h1>Published Pages</h1>
      </div></div>

      <!-- View Modal -->
      <div v-if="isViewModalOpen" class="modal-overlay">
        <div class="modal-box glass">
          <h2 class="modal-title">Page Details</h2>
          <ul class="modal-list">
            <li><strong>Name:</strong> {{ selectedPage.name }}</li>
            <li><strong>Publishing ID:</strong> {{ selectedPage.id }}</li>
            <li><strong>User ID:</strong> {{ selectedPage.user_id }}</li>
            <li><strong>Start Date:</strong> {{ selectedPage.startdate }}</li>
            <li><strong>End Date:</strong> {{ selectedPage.enddate }}</li>
            <li><strong>Total Paid:</strong> ₹{{ selectedPage.totalprice }}</li>
            <li><strong>Total Visitors:</strong> {{ selectedPage.visitors_count }}</li>
            <li><strong>Page link: </strong><RouterLink style="color: blue;" :to= selectedPage.url >Visit Page</RouterLink></li>

          </ul>
          <div class="modal-actions">
            <button @click="isViewModalOpen = false" class="btn primary">Close</button>
          </div>
        </div>
      </div>





      <!-- Toggle Status Modal -->
<div v-if="showToggleModal" class="modal-overlay">
  <div class="modal-box">
    <div class="modal-header">
      <h3>Change Template Status</h3>
      <button class="close-btn" @click="closeToggleModal">×</button>
    </div>

    <div class="modal-body">
      <p><strong>Template:</strong> {{ selectedTemplate?.name }}</p>
      <p><strong>Current Status:</strong> {{ selectedTemplate?.status }}</p>
      <p><strong>New Status:</strong> {{ selectedTemplate?.status === 'active' ? 'inactive' : 'active' }}</p>

      <div class="input-group">
        <label for="statusReason">Reason for Status Change:</label>
        <textarea
          id="statusReason"
          v-model="statusChangeReason"
          placeholder="Enter your reason"
          rows="4"
        ></textarea>
      </div>
    </div>

    <div class="modal-footer">
      <button class="btn cancel" @click="closeToggleModal">Cancel</button>
      <button class="btn confirm" @click="submitStatusChange">Submit</button>
    </div>
  </div>
</div>





      <!-- Delete Modal -->
      <div v-if="isDeleteModalOpen" class="modal-overlay">
        <div class="modal-box glass">
          <h2 class="modal-title text-danger">Confirm Deletion</h2>
          <p>Are you sure you want to delete <strong>{{ selectedPage?.name }}</strong>?</p>
          <div class="modal-actions">
            <button @click="isDeleteModalOpen = false" class="btn secondary">Cancel</button>
            <button @click="confirmDelete" class="btn danger">Yes, Delete</button>
          </div>
        </div>
      </div>

<div class="user-controls">
  <input
    v-model="searchQuery"
    type="text"
    placeholder="Search by Page Name or User ID"
    class="search-input"
  />
</div>


      <!-- Grid -->
      <div class="card-grid">
        <div v-for="page in filteredTemplates" :key="page.id" class="page-card">

          <div class="card-header">
            <h3 class="card-title">{{ page.name }}</h3>
            <span :class="['status-chip', page.status]">{{ page.status }}</span>
          </div>
          <div class="card-body">
            <p><strong>User ID:</strong> {{ page.user_id }}</p>
            <p><strong>Start:</strong> {{ page.startdate }}</p>
            <p><strong>End:</strong> {{ page.enddate }}</p>
            <p><strong>Total:</strong> ₹{{ page.totalprice }}</p>
          </div>
          <div class="card-actions">
            <button class="btn ghost" @click="viewTemplate(page.user_id, page.id)">View</button>
            <button
              v-if="page.status === 'active'"
              class="btn warning"
              @click="openToggleModal(page)"
            >Pause</button>
            <button
              v-if="page.status === 'paused'"
              class="btn success"
              @click="openToggleModal(page)"
            >Activate</button>
            <button class="btn danger" @click="deletePage(page.user_id, page.id)">Delete</button>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>



<script setup>
import AdminSidebar from '@/components/AdminSidebar.vue';
import { onMounted, ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { fetchCsrfToken } from '@/utils/csrf';
import { useAlertStore } from '@/stores/alert';

const BACKEND_BASE = import.meta.env.VITE_API_URL;
const router = useRouter();
const alert = useAlertStore();

const publishedTemplates = ref([]);
const selectedPage = ref(null);
const selectedTemplate = ref(null);

const isViewModalOpen = ref(false);
const isDeleteModalOpen = ref(false);
const showToggleModal = ref(false);

const statusChangeReason = ref('');
const searchQuery = ref('');


const checkAuth = async () => {
  try {
    const res = await fetch(`${BACKEND_BASE}/api/check-admin-session`, {
      credentials: 'include',
    });
    if (!res.ok) {
      if (res.status === 401) {
        router.push('/admin/login');
      } else {
        const msg = `Auth check failed with status: ${res.status}`;
        alert.show(msg, 'error');
        throw new Error(msg);
      }
    }
  } catch (err) {
    alert.show('Authentication error. Redirecting to login...', 'error');
    router.push('/admin/login');
  }
};

const fetchPublishedTemplates = async () => {
  try {
    const response = await fetch(`${BACKEND_BASE}/api/admin/published-templates`, {
      credentials: 'include',
      method: 'GET',
    });
    if (response.ok) {
      const data = await response.json();
      publishedTemplates.value = data;
    } else {
      const errorData = await response.json().catch(() => ({}));
      alert.show(errorData.message || 'Failed to fetch published templates', 'error');
    }
  } catch (err) {
    alert.show(err.message || 'Error loading templates', 'error');
  }
};

const viewTemplate = async (user_id, id) => {
  try {
    const res = await fetch(`${BACKEND_BASE}/api/admin/published-templates/${user_id}/${id}`, {
      credentials: 'include',
    });
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.message || 'Page not found or expired');
    }
    selectedPage.value = await res.json();
    isViewModalOpen.value = true;
  } catch (err) {
    alert.show(err.message || 'Failed to load the template page', 'error');
  }
};

const openToggleModal = (template) => {
  selectedTemplate.value = template;
  statusChangeReason.value = '';
  showToggleModal.value = true;
};

const closeToggleModal = () => {
  showToggleModal.value = false;
};

const submitStatusChange = async () => {
  if (!statusChangeReason.value.trim()) {
    alert.show('Please enter a reason.', 'error');
    return;
  }

  const newStatus = selectedTemplate.value.status === 'active' ? 'paused' : 'active';

  try {
    const csrfToken = await fetchCsrfToken();
    const res = await fetch(`${BACKEND_BASE}/api/admin/published-templates/update/${selectedTemplate.value.id}`, {
      method: 'PUT',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': csrfToken,
      },
      body: JSON.stringify({
        status: newStatus,
        reason: statusChangeReason.value,
      }),
    });

    const data = await res.json();

    if (res.ok && data.success) {
      selectedTemplate.value.status = newStatus;
      alert.show('Status updated successfully.', 'success');
      closeToggleModal();
    } else {
      alert.show(data.error || 'Failed to update status.', 'error');
    }
  } catch (err) {
    alert.show(err.message || 'Server error.', 'error');
  }
};

const filteredTemplates = computed(() => {
  const q = searchQuery.value.toLowerCase();
  return publishedTemplates.value.filter(
    (page) =>
      page.name.toLowerCase().includes(q) || page.user_id.toString().includes(q)
  );
});

const deletePage = async (user_id, id) => {
  try {
    const res = await fetch(`${BACKEND_BASE}/api/admin/published-templates/${user_id}/${id}`, {
      credentials: 'include',
    });
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.message || 'User not found');
    }
    selectedPage.value = await res.json();
    isDeleteModalOpen.value = true;
  } catch (err) {
    alert.show(err.message || 'Error fetching page for deletion.', 'error');
  }
};

const confirmDelete = async () => {
  try {
    const csrfToken = await fetchCsrfToken();
    const res = await fetch(`${BACKEND_BASE}/api/admin/published-templates/${selectedPage.value.id}`, {
      method: 'DELETE',
      credentials: 'include',
      headers: {
        'X-CSRFToken': csrfToken,
      },
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.message || 'Delete failed');
    }

    publishedTemplates.value = publishedTemplates.value.filter(
      (u) => u.id !== selectedPage.value.id
    );
    isDeleteModalOpen.value = false;
    alert.show('Template deleted successfully.', 'success');
  } catch (err) {
    alert.show(err.message || 'Error deleting template.', 'error');
  }
};

onMounted(async () => {
  await checkAuth();
  await fetchPublishedTemplates();
});
</script>



<style scoped>
.admin-dashboard {
  display: flex;
  margin-left: 65px;
  background-color: #ffffff;
  height: 100vh;
}

.admin-main-content {
  flex: 1;
  padding: 2rem 2.5rem;
  overflow-y: auto;
  background-color: inherit;
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
.icon {
  width: 36px;
  height: auto;
  margin-right: 8px;
}
h1 {
  color: #222f3e;
  font-size: 32px;
  font-weight: 700;
  margin-bottom: 8px;
  letter-spacing: 0.03em;
}

.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(310px, 1fr));
  gap: 20px;
}

.page-card {
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.04);
  transition: all 0.2s ease-in-out;
}

.page-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.06);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.card-title {
  font-size: 1.2rem;
  font-weight: 600;
}

.status-chip {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
  text-transform: capitalize;
}

.status-chip.active {
  background-color: #e0fce9;
  color: #28a745;
}

.status-chip.paused {
  background-color: #fdecea;
  color: #dc3545;
}

.card-body p {
  font-size: 0.9rem;
  margin: 0.3rem 0;
}

.card-actions {
  margin-top: 1rem;
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.btn {
  font-size: 0.85rem;
  padding: 6px 14px;
  border-radius: 8px;
  font-weight: 500;
  border: none;
  cursor: pointer;
  transition: 0.2s;
}

.btn:hover {
  opacity: 0.9;
}

.btn.primary {
  background: #007bff;
  color: white;
}

.btn.secondary {
  background: #6c757d;
  color: white;
}

.btn.success {
  background: #28a745;
  color: white;
}

.btn.warning {
  background: #ffb347;
  color: white;
}

.btn.danger {
  background: #dc3545;
  color: white;
}

.btn.ghost {
  background: transparent;
  color: #333;
  border: 1px solid #ccc;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(30, 30, 30, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
}

.modal-box {
  background: white;
  padding: 2rem;
  border-radius: 16px;
  width: 420px;
  max-width: 90%;
  box-shadow: 0 8px 40px rgba(0, 0, 0, 0.15);
}

.modal-box.glass {
  backdrop-filter: blur(8px);
  background: rgba(255, 255, 255, 0.85);
}

.modal-title {
  font-size: 1.4rem;
  font-weight: 600;
  margin-bottom: 1rem;
}

.modal-title.text-danger {
  color: #dc3545;
}

.modal-list {
  list-style: none;
  padding-left: 0;
  font-size: 0.95rem;
}

.modal-list li {
  margin: 6px 0;
}

.modal-actions {
  margin-top: 1.5rem;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
.user-controls {
  margin-bottom: 28px;
  max-width: 100%;
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
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0,0,0,0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
}
.modal-box {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 5px 15px rgba(0,0,0,0.3);
}
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
}
.modal-body {
  margin-top: 1rem;
}
.input-group {
  margin-top: 1rem;
}
textarea {
  width: 100%;
  padding: 0.5rem;
}
.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  margin-top: 1.5rem;
}
.btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
.btn.cancel {
  background: #ccc;
}
.btn.confirm {
  background: #007bff;
  color: white;
}

</style>
