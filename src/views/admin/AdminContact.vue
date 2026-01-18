<script setup>
import AdminSidebar from '@/components/AdminSidebar.vue';
import { onMounted, ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { fetchCsrfToken } from '@/utils/csrf';
import { useAlertStore } from '@/stores/alert'; 
import { useConfirmStore } from '@/stores/confirm'

const confirm = useConfirmStore()

const BACKEND_BASE = import.meta.env.VITE_API_URL
const alert = useAlertStore(); 


const formatDate = (dateStr) => {
  if (!dateStr) return 'N/A';
  const date = new Date(dateStr);
  return date.toLocaleString();
};

const timeSince = (dateStr) => {
  if (!dateStr) return 'N/A';
  const now = new Date();
  const past = new Date(dateStr);
  const diff = now - past; // ms
  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return `${seconds} seconds ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} minutes ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hours ago`;
  const days = Math.floor(hours / 24);
  return `${days} days ago`;
};

const router = useRouter();
const contacts = ref([]);
const searchQuery = ref('');
const activeTab = ref('tocontact'); // 'tocontact' or 'contacted'

const checkAuth = async () => {
  try {
    const res = await fetch(  `${BACKEND_BASE}/api/check-admin-session`, {
      credentials: "include",
    });
    if (!res.ok) {
      if (res.status === 401) {
        router.push('/admin/login');
        alert.show('Unauthorized access. Please log in.', 'error');
      }
      else {
        const data = await res.json().catch(() => null);
        alert.show(data?.message || `Auth check failed: ${res.status}`, 'error');
        throw new Error(data?.message || `Auth check failed: ${res.status}`);
      }
    }
  } catch (err) {
    console.error("Admin auth error:", err);
    alert.show(err.message || 'Authentication error occurred', 'error');
    router.push('/admin/login');
  }
};

const fetchContacts = async () => {
  try {
    const res = await fetch(`${BACKEND_BASE}/api/admin/contacts`, {
      credentials: "include",
    });
    if (res.ok) {
      contacts.value = await res.json();
    } else {
      const data = await res.json().catch(() => null);
      alert.show(data?.message || 'Failed to fetch contacts', 'error');
    }
  } catch (err) {
    console.error("Error fetching contacts:", err);
    alert.show(err.message || 'Network error while fetching contacts', 'error');
  }
};

const markAsContacted = async (id) => {
  const confirmed = await confirm.show("Are you sure to mark contacted?")
  if (confirmed){
  const csrfToken = await fetchCsrfToken();
  try {
    const res = await fetch(`${BACKEND_BASE}/api/admin/contacts/${id}/mark`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": csrfToken
      },
      credentials: "include",
      body: JSON.stringify({ status: "contacted" }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => null);
      alert.show(data?.message || 'Failed to update contact status', 'error');
      throw new Error(data?.message || 'Update failed');
    }
    alert.show('Marked as contacted successfully!', 'success');
    await fetchContacts();
  } catch (err) {
    console.error("Edit error:", err);
    alert.show(err.message || 'Error updating contact', 'error');
  }}
};

// Filtered lists by status and search query
const toContactList = computed(() =>
  contacts.value
    .filter(c => c.status !== 'contacted')
    .filter(c => [c.name, c.email, c.message].some(field => field?.toLowerCase().includes(searchQuery.value.toLowerCase())))
);
const contactedList = computed(() =>
  contacts.value
    .filter(c => c.status === 'contacted')
    .filter(c => [c.name, c.email, c.message].some(field => field?.toLowerCase().includes(searchQuery.value.toLowerCase())))
);

// Stats
const totalContacts = computed(() => contacts.value.length);
const totalToContact = computed(() => toContactList.value.length);
const totalContacted = computed(() => contactedList.value.length);

onMounted(async () => {
  await checkAuth();
  await fetchContacts();
});
</script>


<template>
  <div class="admin-dashboard">
    <AdminSidebar />
    <main class="admin-main-content">
      <h1>Contact Messages Dashboard</h1>
      <p>Review, search, and manage user contact submissions.</p>

      <!-- Summary Stats -->
      <section class="summary-stats">
        <div><strong>Total Messages:</strong> {{ totalContacts }}</div>
        <div><strong>To Contact:</strong> {{ totalToContact }}</div>
        <div><strong>Contacted:</strong> {{ totalContacted }}</div>
      </section>

      <!-- Search box -->
      <div class="search-box">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search contacts by name, email or message..."
          aria-label="Search contacts"
        />
      </div>

      <!-- Tabs -->
      <div class="tabs-menu" role="tablist" aria-label="Contact message tabs">
        <button
          :class="{ active: activeTab === 'tocontact' }"
          @click="activeTab = 'tocontact'"
          role="tab"
          aria-selected="activeTab === 'tocontact'"
          id="tab-tocontact"
          aria-controls="tabpanel-tocontact"
        >
          To Contact ({{ totalToContact }})
        </button>
        <button
          :class="{ active: activeTab === 'contacted' }"
          @click="activeTab = 'contacted'"
          role="tab"
          aria-selected="activeTab === 'contacted'"
          id="tab-contacted"
          aria-controls="tabpanel-contacted"
        >
          Contacted ({{ totalContacted }})
        </button>
      </div>

      <!-- To Contact Table -->
      <section
        v-if="activeTab === 'tocontact'"
        class="template-table-container"
        role="tabpanel"
        :aria-labelledby="'tab-tocontact'"
        id="tabpanel-tocontact"
      >
        <h2>Messages to Contact</h2>
        <table class="template-table" aria-describedby="desc-tocontact">
          <thead>
            <tr>
              <th>S.N.</th>
              <th>Name</th>
              <th>Email</th>
              <th>ID</th>
              <th>Message</th>
              <th>Received</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(contact, index) in toContactList" :key="contact.id">
              <td>{{ index+1 }}</td>
              <td>{{ contact.name }}</td>
              <td><a :href="`mailto:${contact.email}`" class="email-link">{{ contact.email }}</a></td>
              <td>{{ contact.id }}</td>
              <td class="message-cell" :title="contact.message">{{ contact.message }}</td>
              <td>{{ timeSince(contact.created_at) }}</td>
              <td>
                <span class="status-pill inactive" title="User has not been contacted yet">
                  {{ contact.status || 'new' }}
                </span>
              </td>
              <td>
                <button class="edit-btn" @click="markAsContacted(contact.id)" aria-label="Mark as contacted for {{ contact.name }}">
                  Mark as Contacted
                </button>
              </td>
            </tr>
            <tr v-if="toContactList.length === 0">
              <td colspan="7" class="empty-message">
                Everyone has been contacted! 🎉
              </td>
            </tr>
          </tbody>
        </table>
      </section>

      <!-- Contacted Table -->
      <section
        v-else
        class="template-table-container"
        role="tabpanel"
        :aria-labelledby="'tab-contacted'"
        id="tabpanel-contacted"
      >
        <h2>Contacted Messages</h2>
        <table class="template-table" aria-describedby="desc-contacted">
          <thead>
            <tr>
              <th>S.N.</th>
              <th>Name</th>
              <th>Email</th>
              <th>ID</th>
              <th>Message</th>
              <th>Received</th>

              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(contact, index) in contactedList" :key="contact.id">
              <td>{{ index+1 }}</td>
              <td>{{ contact.name }}</td>
              <td><a :href="`mailto:${contact.email}`" class="email-link">{{ contact.email }}</a></td>
              <td>{{ contact.id }}</td>
              <td class="message-cell" :title="contact.message">{{ contact.message }}</td>
              <td>{{ contact.created_at }}</td>

              <td>
                <span class="status-pill active" title="User has been contacted">
                  {{ contact.status }}
                </span>
              </td>
            </tr>
            <tr v-if="contactedList.length === 0">
              <td colspan="7" class="empty-message">
                No one has been contacted yet. Start reaching out! 📞
              </td>
            </tr>
          </tbody>
        </table>
      </section>
    </main>
  </div>
</template>

<style scoped>
.admin-dashboard {
  display: flex;
  height: 100vh;
  background-color: #f0f2f5;
  margin-left: 65px;
}

.admin-main-content {
  flex: 1;
  padding: 30px 40px;
  overflow-y: auto;
  background-color: #fff;
  border-top-left-radius: 15px;
  box-shadow: inset 0 2px 10px rgba(0, 0, 0, 0.03);
}

h1 {
  font-size: 2rem;
  color: #2c3e50;
  margin-bottom: 10px;
  font-weight: 700;
}

h2 {
  font-size: 1.5rem;
  color: #2c3e50;
  margin: 20px 0 10px;
}

p {
  color: #555;
  font-size: 1rem;
  margin-bottom: 20px;
}

.summary-stats {
  display: flex;
  gap: 25px;
  font-size: 1rem;
  font-weight: 600;
  background-color: #f9f9f9;
  padding: 15px 20px;
  border-radius: 12px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
}

.search-box {
  margin-bottom: 20px;
}

.search-box input {
  width: 100%;
  max-width: 500px;
  padding: 10px 14px;
  font-size: 1rem;
  border-radius: 8px;
  border: 1.5px solid #ccc;
  transition: 0.3s;
}

.search-box input:focus {
  border-color: #3498db;
  outline: none;
  box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
}

.tabs-menu {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
}

.tabs-menu button {
  padding: 10px 20px;
  border: none;
  background-color: #ecf0f1;
  border-radius: 8px;
  font-weight: 600;
  color: #2c3e50;
  transition: background-color 0.3s;
  cursor: pointer;
}

.tabs-menu button.active {
  background-color: #3498db;
  color: white;
}

.template-table-container {
  background-color: #fff;
  padding: 15px;
  border-radius: 12px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.04);
}

.template-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.95rem;
}

.template-table thead {
  background-color: #f1f1f1;
}

.template-table th,
.template-table td {
  padding: 12px 14px;
  border-bottom: 1px solid #ddd;
  text-align: left;
}

.template-table th {
  color: #2c3e50;
}

.template-table td a.email-link {
  color: #2980b9;
  text-decoration: none;
}

.template-table td a.email-link:hover {
  text-decoration: underline;
}

.message-cell {
  max-width: 300px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.status-pill {
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 0.85rem;
  font-weight: 600;
  display: inline-block;
  text-transform: capitalize;
}

.status-pill.inactive {
  background-color: #f39c12;
  color: white;
}

.status-pill.active {
  background-color: #2ecc71;
  color: white;
}

.edit-btn {
  padding: 8px 14px;
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: background-color 0.3s;
}

.edit-btn:hover {
  background-color: #2980b9;
}

.empty-message {
  text-align: center;
  padding: 20px;
  color: #7f8c8d;
  font-style: italic;
}
</style>
