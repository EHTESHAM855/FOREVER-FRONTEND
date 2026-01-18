<script setup>
import AdminSidebar from '@/components/AdminSidebar.vue';
import { onMounted, ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { fetchCsrfToken } from '@/utils/csrf';
import { useAlertStore } from '@/stores/alert';

const BACKEND_BASE = import.meta.env.VITE_API_URL;
const router = useRouter();
const alert = useAlertStore();

const reports = ref([]);
const activeTab = ref('reported'); // 'reported' or 'resolved'

const checkAuth = async () => {
  try {
    const res = await fetch(`${BACKEND_BASE}/api/check-admin-session`, {
      credentials: "include",
    });
    if (!res.ok) {
      if (res.status === 401) {
        router.push('/admin/login');
      } else {
        const msg = `Auth check failed: ${res.status}`;
        alert.show(msg, 'error');
        throw new Error(msg);
      }
    }
  } catch (err) {
    alert.show('Authentication error. Redirecting to login...', 'error');
    router.push('/admin/login');
  }
};

const fetchReports = async () => {
  try {
    const res = await fetch(`${BACKEND_BASE}/api/admin/reports`, {
      credentials: "include",
    });
    if (res.ok) {
      reports.value = await res.json();
    } else {
      const errorData = await res.json().catch(() => ({}));
      alert.show(errorData.message || "Failed to fetch reports", 'error');
    }
  } catch (err) {
    alert.show(err.message || "Error fetching reports", 'error');
  }
};

const markAsResolved = async (id) => {
  try {
    const csrfToken = await fetchCsrfToken();
    const res = await fetch(`${BACKEND_BASE}/api/admin/reports/${id}/resolve`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": csrfToken,
      },
      credentials: "include",
    });
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.message || "Failed to mark as resolved");
    }
    await fetchReports();
    alert.show("Report marked as resolved.", 'success');
  } catch (err) {
    alert.show(err.message || "Resolve error", 'error');
  }
};

const showModal = ref(false);
const selectedReportId = ref(null);
const resolutionRemarks = ref('');

const openResolveModal = (reportId) => {
  selectedReportId.value = reportId;
  resolutionRemarks.value = '';
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
  selectedReportId.value = null;
  resolutionRemarks.value = '';
};

const confirmResolve = async () => {
  try {
    const csrfToken = await fetchCsrfToken();
    const res = await fetch(`${BACKEND_BASE}/api/admin/reports/${selectedReportId.value}/resolve`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": csrfToken,
      },
      credentials: "include",
      body: JSON.stringify({ remarks: resolutionRemarks.value })
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.message || "Failed to resolve report");
    }

    showModal.value = false;
    await fetchReports();
    alert.show("Report resolved successfully.", 'success');
  } catch (err) {
    alert.show(err.message || "Error resolving report", 'error');
  }
};

const reportedList = computed(() => reports.value.filter(r => r.status !== 'resolved'));
const resolvedList = computed(() => reports.value.filter(r => r.status === 'resolved'));
const totalReported = computed(() => reportedList.value.length);
const totalResolved = computed(() => resolvedList.value.length);

onMounted(async () => {
  await checkAuth();
  await fetchReports();
});
</script>


<template>
  <div class="admin-dashboard">
    <AdminSidebar />
    <div v-if="showModal" class="modal-overlay">
  <div class="modal-box">
    <h3>Resolve Report</h3>
    <p>Please enter remarks for resolving this report:</p>
    <textarea v-model="resolutionRemarks" rows="4" placeholder="Enter remarks here..."></textarea>
    <div class="modal-actions">
      <button @click="confirmResolve" class="confirm-btn">✅ Confirm</button>
      <button @click="closeModal" class="cancel-btn">❌ Cancel</button>
    </div>
  </div>
</div>

    <main class="admin-main-content">
      <div class="header-section">
        <h1><span class="icon">📋</span> Reports Overview</h1>
        <p>Review user-submitted issues and take action as necessary.</p>
        <!-- <div class="stats-cards">
          <div class="stat-card pending">
            <h3>{{ reportedList.length }}</h3>
            <p>Pending Reports</p>
          </div>
          <div class="stat-card resolved">
            <h3>{{ resolvedList.length }}</h3>
            <p>Resolved Reports</p>
          </div>
        </div> -->
      </div>

      <div class="tabs-menu">
        <button :class="{ active: activeTab === 'reported' }" @click="activeTab = 'reported'">📌 Reported ({{ totalReported }})</button>
        <button :class="{ active: activeTab === 'resolved' }" @click="activeTab = 'resolved'">✅ Resolved ({{ totalResolved }})</button>
      </div>

      <!-- Reported Table -->
      <div v-if="activeTab === 'reported'" class="template-table-container">
        <h2>Pending Reports</h2>
        <table class="template-table">
          <thead>
            <tr>
              <th>S.N.</th><th>User</th><th>Subject</th><th>Description</th><th>Submitted</th><th>Status</th><th>Action</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="reportedList.length" v-for="(report, index) in reportedList" :key="report.id">
              <td>{{ index + 1 }}</td>
              <td>{{ report.user_email }}</td>
              <td>{{ report.subject }}</td>
              <td>{{ report.description }}</td>
              <td>{{ new Date(report.submitted_at).toLocaleString() }}</td>
              <td><span class="status-pill inactive">{{ report.status }}</span></td>
              <td>
                <button class="edit-btn" @click="openResolveModal(report.id)">
                  ✅ Resolve
                </button>
              </td>
            </tr>
            <tr v-else>
              <td colspan="7">🎉 All caught up! No pending reports.</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Resolved Table -->
      <div v-else class="template-table-container">
        <h2>Resolved Reports</h2>
        <table class="template-table">
          <thead>
            <tr>
              <th>#</th><th>User</th><th>Subject</th><th>Description</th><th>Submitted</th><th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="resolvedList.length" v-for="(report, index) in resolvedList" :key="report.id">
              <td>{{ index + 1 }}</td>
              <td>{{ report.user_email }}</td>
              <td>{{ report.subject }}</td>
              <td>{{ report.description }}</td>
              <td>{{ new Date(report.submitted_at).toLocaleString() }}</td>
              <td><span class="status-pill active">{{ report.status }}</span></td>
            </tr>
            <tr v-else>
              <td colspan="6">📭 No reports have been resolved yet.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </main>
  </div>
</template>


<style scoped>
.admin-dashboard {
  margin-left: 65px;
  display: flex;
  height: 100vh;
  background-color: #f4f7f6;
}
.admin-main-content {
  flex: 1;
  padding: 30px 40px;
  overflow-y: auto;
  background-color: #ffffff;
  border-top-left-radius: 15px;
  box-shadow: inset 3px 3px 10px rgba(0, 0, 0, 0.05);
}
h1 {
  color: #2c3e50;
  margin-bottom: 20px;
  font-size: 28px;
  font-weight: 600;
}
h2 {
  font-size: 22px;
  color: #2c3e50;
  margin-bottom: 12px;
}

p {
  color: #555;
  font-size: 1rem;
}
.template-table-container {
  margin-top: 30px;
  overflow-x: auto;
}
.template-table {
  width: 100%;
  border-collapse: collapse;
  background-color: #fff;
  font-size: 0.95rem;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}
.template-table th,
.template-table td {
  padding: 14px 18px;
  text-align: left;
  border-bottom: 1px solid #e0e0e0;
}
.template-table th {
  background-color: #f1f1f1;
  color: #333;
}
.edit-btn {
  background-color: #3498db;
  color: white;
  padding: 6px 10px;
  border: none;
  border-radius: 4px;
  font-size: 0.85rem;
  cursor: pointer;
}
.status-pill {
  padding: 4px 10px;
  border-radius: 50px;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
}
.status-pill.active {
  background-color: #d4edda;
  color: #155724;
}
.status-pill.inactive {
  background-color: #f8d7da;
  color: #721c24;
}
.tabs-menu {
  display: flex;
  gap: 10px;
  margin-top: 20px;
  margin-bottom: 20px;
}

.tabs-menu button {
  padding: 8px 16px;
  background-color: #e0e0e0;
  border: none;
  border-radius: 8px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: background-color 0.3s;
}

.tabs-menu button.active {
  background-color: #3498db;
  color: white;
}
.header-section {
  margin-bottom: 20px;
}

.icon {
  font-size: 1.4rem;
  margin-right: 8px;
}

.stats-cards {
  display: flex;
  gap: 20px;
  margin-top: 20px;
}

.stat-card {
  flex: 1;
  background-color: #f4f6f9;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.06);
  text-align: center;
}

.stat-card h3 {
  font-size: 24px;
  color: #2c3e50;
  margin-bottom: 5px;
}

.stat-card.pending {
  border-left: 4px solid #e74c3c;
}

.stat-card.resolved {
  border-left: 4px solid #27ae60;
}

.template-table tbody tr:nth-child(even) {
  background-color: #fafafa;
}

.template-table tbody tr:hover {
  background-color: #f0f8ff;
}

.edit-btn {
  background-color: #2ecc71;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  font-size: 0.85rem;
  border-radius: 5px;
  transition: background 0.3s;
}

.edit-btn:hover {
  background-color: #27ae60;
}

.tabs-menu button {
  display: flex;
  align-items: center;
  gap: 6px;
}
.modal-overlay {
  position: fixed;
  top: 0; left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0,0,0,0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-box {
  background: white;
  padding: 20px;
  border-radius: 10px;
  width: 400px;
  max-width: 90%;
  box-shadow: 0 2px 12px rgba(0,0,0,0.2);
}

.modal-box h3 {
  margin-top: 0;
  font-size: 1.25rem;
  margin-bottom: 10px;
}

.modal-box textarea {
  width: 100%;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 6px;
  resize: none;
  font-size: 0.9rem;
  margin-bottom: 15px;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.confirm-btn {
  background-color: #27ae60;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 5px;
  cursor: pointer;
}

.cancel-btn {
  background-color: #e74c3c;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 5px;
  cursor: pointer;
}

</style>
