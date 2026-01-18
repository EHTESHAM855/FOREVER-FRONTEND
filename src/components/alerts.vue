<template>
  <div class="alerts-wrapper">
    <!-- Bell Icon -->
    <div class="icon-wrapper" @click="toggleDropdown">
      <div class="bell-container" :class="{ active: showDropdown }">
        <Bell style="width: 40px; height: auto; color: red; font-weight: bolder;" />
        <span v-if="unreadCount > 0" class="badge">{{ unreadCount }}</span>
      </div>
    </div>

    <!-- Dropdown -->
    <transition name="slide-fade">
      <div v-if="showDropdown" class="alerts-dropdown" @click.stop>
        <h4 class="dropdown-header">🔔 Notifications</h4>

        <div class="tab-buttons">
          <button :class="{ active: activeTab === 'unread' }" @click="activeTab = 'unread'">Unread</button>
          <button :class="{ active: activeTab === 'read' }" @click="activeTab = 'read'">Read</button>
        </div>

        <!-- Unread Alerts -->
        <div v-if="activeTab === 'unread'" class="tab-section">
          <div v-if="unread.length === 0" class="empty-state">You're all caught up! 🎉</div>
          <transition-group name="fade-item" tag="div">
            <div v-for="alert in unread" :key="alert.id" class="alert unread">
              <div class="alert-message">
                <strong>{{ alert.sender }}:</strong> {{ alert.message.slice(0, 60) }}...
              </div>
              <div class="alert-actions">
                <button @click="openDetail(alert)">View</button>
                <button class="mark-btn" @click="markAsRead(alert.id)">Mark as Read</button>
              </div>
            </div>
          </transition-group>
        </div>

        <!-- Read Alerts -->
        <div v-if="activeTab === 'read'" class="tab-section">
          <div v-if="read.length === 0" class="empty-state">No read notifications.</div>
          <transition-group name="fade-item" tag="div">
            <div v-for="alert in read" :key="alert.id" class="alert read">
              <div class="alert-message">
                <strong>{{ alert.sender }}:</strong> {{ alert.message.slice(0, 60) }}...
              </div>
              <div class="alert-actions">
                <button @click="openDetail(alert)">View</button>
              </div>
            </div>
          </transition-group>
        </div>
      </div>
    </transition>

    <!-- Modal -->
    <transition name="modal-fade">
      <div v-if="selectedAlert" class="alert-modal" @click.self="closeDetail">
        <div class="modal-content">
          <h4>{{ selectedAlert.sender }}</h4>
          <p>{{ selectedAlert.message }}</p>
          <div class="modal-footer">
            <button @click="closeDetail">Close</button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { Bell } from 'lucide-vue-next';
import { fetchCsrfToken } from '@/utils/csrf';

const BACKEND_BASE = import.meta.env.VITE_API_URL;

const alerts = ref([]);
const selectedAlert = ref(null);
const showDropdown = ref(false);
const activeTab = ref('unread');

const toggleDropdown = () => showDropdown.value = !showDropdown.value;
const closeDropdown = () => showDropdown.value = false;

const fetchAlerts = async () => {
  try {
    const res = await fetch(`${BACKEND_BASE}/api/alerts`, { credentials: 'include' });
    const data = await res.json();
    alerts.value = data.alerts || [];
  } catch (error) {
    console.error("Failed to fetch alerts", error);
  }
};

const markAsRead = async (id) => {
  const csrfToken = await fetchCsrfToken();
  try {
    await fetch(`${BACKEND_BASE}/api/alerts/${id}/mark_read`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "X-CSRFToken": csrfToken,
      }
    });
    fetchAlerts();
  } catch (err) {
    console.error('Failed to mark alert as read', err);
  }
};

const openDetail = async (alert) => {
  selectedAlert.value = alert;
  if (alert.status === 'unread') await markAsRead(alert.id);
};

const closeDetail = () => selectedAlert.value = null;

const unread = computed(() => alerts.value.filter(a => a.status === 'unread'));
const read = computed(() => alerts.value.filter(a => a.status === 'read'));
const unreadCount = computed(() => unread.value.length);

onMounted(() => {
  fetchAlerts();
  setInterval(fetchAlerts, 10000);
});
</script>



<style scoped>
.alerts-wrapper {
  position: fixed;
  top: 110px;
  right: 80px;
  z-index: 9999;
  font-family: 'Segoe UI', sans-serif;
}

.icon-wrapper {
  position: relative;
  cursor: pointer;
}

.bell-container {
  display: inline-block;
  position: relative;
  font-size: 30px;
  color: #444;
  transition: transform 0.3s ease;
}

.bell-container.active {
  transform: translateX(-10px); /* move bell+badge to the left */
}

.badge {
  background-color: crimson;
  color: white;
  border-radius: 999px;
  font-size: 12px;
  padding: 2px 6px;
  position: absolute;
  top: -6px;
  right: -8px;
  transition: transform 0.3s ease;
}


.alerts-dropdown {
  background: white;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  border-radius: 12px;
  width: 360px;
  max-height: 480px;
  overflow-y: auto;
  padding: 16px;
  margin-top: 10px;
  animation: dropdown 0.4s ease;
}

.dropdown-header {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 10px;
  color: #222;
}

.tab-buttons {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}

.tab-buttons button {
  flex: 1;
  padding: 8px;
  border-radius: 6px;
  border: 1px solid #ddd;
  background: #f3f3f3;
  font-size: 14px;
  cursor: pointer;
  transition: 0.2s;
}

.tab-buttons button.active {
  background: #4a90e2;
  color: white;
  border-color: #4a90e2;
}

.alert {
  background: #f8fafd;
  border-left: 4px solid #4a90e2;
  padding: 10px;
  border-radius: 8px;
  margin-bottom: 10px;
  transition: 0.3s ease-in-out;
}

.alert.read {
  opacity: 0.7;
  border-left-color: #ccc;
}

.alert-message {
  margin-bottom: 8px;
}

.alert-actions {
  display: flex;
  gap: 8px;
}

.alert-actions button {
  padding: 5px 12px;
  font-size: 13px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  background: #4a90e2;
  color: white;
  transition: 0.2s;
}
.mark-btn {
  background: #888;
}

.alert-actions button:hover {
  opacity: 0.9;
}

.alert-modal {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10000;
}

.modal-content {
  background: white;
  border-radius: 10px;
  padding: 24px;
  width: 400px;
  max-width: 90%;
  animation: scale-in 0.3s ease;
}

.modal-footer {
  margin-top: 16px;
  text-align: right;
}

.modal-footer button {
  padding: 6px 14px;
  background: #222;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

/* Animations */
@keyframes dropdown {
  from {
    transform: translateY(-8px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

@keyframes pop {
  0% { transform: scale(0.8); opacity: 0.5; }
  100% { transform: scale(1); opacity: 1; }
}

@keyframes scale-in {
  from {
    transform: scale(0.95);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

/* Transition classes */
.fade-badge-enter-active, .fade-badge-leave-active,
.fade-item-enter-active, .fade-item-leave-active {
  transition: all 0.3s ease;
}
.fade-badge-enter-from, .fade-badge-leave-to,
.fade-item-enter-from, .fade-item-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

.slide-fade-enter-active, .slide-fade-leave-active {
  transition: all 0.4s ease;
}
.slide-fade-enter-from, .slide-fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

.modal-fade-enter-active, .modal-fade-leave-active {
  transition: all 0.3s ease;
}
.modal-fade-enter-from, .modal-fade-leave-to {
  opacity: 0;
}

@media (max-width: 700px) {
  .alerts-wrapper{
    position: fixed;
    top:85px; 
    right:20px;
  }
  .alerts-dropdown{
    width: 73vw;
  }
}
</style>
