<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useAlertStore } from "@/stores/alert";

const BACKEND_BASE = import.meta.env.VITE_API_URL;

import {
  Menu,
  LayoutDashboard,
  Users,
  File,
  Globe,
  Settings,
  Upload,
  MoreHorizontal,
  Mail,
  BarChart,
  LogOut,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  User,
  UserPen,
  UserPlus,
  ReceiptIndianRupee
} from "lucide-vue-next";

const isSidebarOpen = ref(true);
const isCollapsed = ref(true);
const showMore = ref(false);
const hoverMore = ref(false);
const showMoreSettings = ref(false);
const hoverMoreSettings = ref(false);

const router = useRouter();
const alert = useAlertStore();

const toggleMore = () => {
  showMore.value = !showMore.value;
};

const toggleMoreSettings = () => {
  showMoreSettings.value = !showMoreSettings.value;
};

const logout = async () => {
  try {
    const res = await fetch(`${BACKEND_BASE}/api/logout`, {
      method: "GET",
      credentials: "include"
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Logout failed");
    }

    alert.show(data.message || "Logged out successfully.", "success");
    router.push("/admin/login");
  } catch (err) {
    alert.show(err.message || "Logout failed. Please try again.", "error");
  }
};
</script>


<template>
  <div>
    <!-- Mobile toggle button -->
    <button class="toggle-btn" @click="isSidebarOpen = !isSidebarOpen">
      <Menu :size="24" />
    </button>

    <!-- Sidebar -->
    <transition name="slide">
      <aside :class="[
        'admin-sidebar',
        { collapsed: isCollapsed },
        { 'sidebar-open': isSidebarOpen },
        { 'sidebar-closed': !isSidebarOpen }
      ]">



        <header class="sidebar-header">
          <ShieldCheck class="admin-icon" />
          <h2 class="logo" v-if="!isCollapsed">Admin</h2>
        </header>

        <nav>
          <ul>
            <li>
              <RouterLink to="/admin" class="nav-link" :title="isCollapsed ? 'Dashboard' : ''">
                <LayoutDashboard class="icon" />
                <span v-if="!isCollapsed">Dashboard</span>
              </RouterLink>
            </li>
            <li>
              <RouterLink to="/admin/transactions" class="nav-link" :title="isCollapsed ? 'Transactions' : ''">
                <ReceiptIndianRupee class="icon" />
                <span v-if="!isCollapsed">Transactions</span>
              </RouterLink>
            </li>
            <li>
              <RouterLink to="/admin/users" class="nav-link" :title="isCollapsed ? 'Manage Users' : ''">
                <Users class="icon" />
                <span v-if="!isCollapsed">Manage Users</span>
              </RouterLink>
            </li>
            <li>
              <RouterLink to="/admin/templates" class="nav-link" :title="isCollapsed ? 'Manage Templates' : ''">
                <File class="icon" />
                <span v-if="!isCollapsed">Manage Templates</span>
              </RouterLink>
            </li>
            <li>
              <RouterLink to="/admin/template_upload" class="nav-link" :title="isCollapsed ? 'Upload Template' : ''">
                <Upload class="icon" />
                <span v-if="!isCollapsed">Upload Template</span>
              </RouterLink>
            </li>
            <li>
              <RouterLink to="/admin/published-pages" class="nav-link" :title="isCollapsed ? 'Manage Pages' : ''">
                <Globe class="icon" />
                <span v-if="!isCollapsed">Manage Pages</span>
              </RouterLink>
            </li>
            <li class="more-menu" @click="toggleMoreSettings" @mouseenter="hoverMoreSettings = true"
              @mouseleave="hoverMoreSettings = false">
              <a href="#" class="nav-link" :title="isCollapsed ? Settings : ''">
                <Settings class="icon" />
                <span v-if="!isCollapsed">Settings ▾</span>
              </a>
              <ul v-show="showMoreSettings || hoverMoreSettings" class="submenu" :class="{ collapsed: isCollapsed }" style="border-left:3px solid red;">
                <li>
                  <RouterLink to="/admin/profile" class="nav-link" :title="isCollapsed ? 'Profile' : ''">
                    <User class="icon" />
                    <span v-if="!isCollapsed">View Profile</span>
                  </RouterLink>
                </li>
                <li>
                  <RouterLink to="/admin/settings/editProfile" class="nav-link"
                    :title="isCollapsed ? 'Edit Profile' : ''">
                    <UserPen class="icon" />
                    <span v-if="!isCollapsed">Edit Profile</span>
                  </RouterLink>
                </li>
                <li>
                  <RouterLink to="/admin/settings/createAdmin" class="nav-link"
                    :title="isCollapsed ? 'Create Admin' : ''">
                    <UserPlus class="icon" />
                    <span v-if="!isCollapsed">Create Admin</span>
                  </RouterLink>
                </li>
              </ul>

            </li>
            
            

            <li class="more-menu" @click="toggleMore" @mouseenter="hoverMore = true" @mouseleave="hoverMore = false">
              <a href="#" class="nav-link" :title="isCollapsed ? 'More' : ''">
                <MoreHorizontal class="icon" />
                <span v-if="!isCollapsed">More ▾</span>
              </a>
              <ul v-show="showMore || hoverMore" class="submenu" :class="{ collapsed: isCollapsed }">
                
                <li>
                  <RouterLink to="/admin/contacts" class="nav-link" :title="isCollapsed ? 'Contacts' : ''">
                    <Mail class="icon" />
                    <span v-if="!isCollapsed">Contacts</span>
                  </RouterLink>
                </li>
                <li>
                  <RouterLink to="/admin/feedbacks" class="nav-link" :title="isCollapsed ? 'Feedbacks' : ''">
                    <BarChart class="icon" />
                    <span v-if="!isCollapsed">Feedbacks</span>
                  </RouterLink>
                </li>
              </ul>
            </li>
            <li>
              <hr class="divider" />
            </li>
            <li>
              <a href="#" class="nav-link" @click.prevent="logout" :title="isCollapsed ? 'Logout' : ''">
                <LogOut class="icon" />
                <span v-if="!isCollapsed">Logout</span>
              </a>
            </li>
          </ul>
        </nav>

        <!-- Collapse toggle -->
        <button class="collapse-btn" @click="isCollapsed = !isCollapsed"
          :title="isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'">
          <ChevronLeft v-if="!isCollapsed" />
          <ChevronRight v-else />
        </button>
      </aside>
    </transition>
    <div v-if="!isCollapsed" class="mobile-overlay" @click="isCollapsed = true"></div>
  </div>
</template>


<style scoped>
.admin-sidebar {
  width: 325px;
  background: linear-gradient(to bottom, #1f1f2f, #12121b);
  color: #e0e0e0;
  padding: 24px 20px;
  height: 100vh;
  position: fixed;
  top: 0;
  left: 0;
  overflow-y: auto;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.3);
  z-index: 1000;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  transition: all 0.3s ease;
}

.admin-sidebar.collapsed {
  width: 85px;
  padding: 24px 10px;
}

.sidebar-header {
  display: flex;
  flex-direction: row;
  justify-content: center;
  gap: 10px;
  /* margin-bottom: 16px; */
}
.admin-icon {
  color: #4a90e2;
  width: 36px;
  height: 36px;
}

.logo {
  font-size: 22px;
  font-weight: bold;
  color: #fff;
  user-select: none;
  white-space: nowrap;
}

nav ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

nav li {
  margin: 10px 0;
}

.nav-link {
  color: #d0d0d0;
  display: flex;
  align-items: center;
  font-size: 15px;
  text-decoration: none;
  padding: 10px 14px;
  border-radius: 8px;
  transition: background-color 0.3s, transform 0.2s;
}

.nav-link:hover,
.router-link-exact-active {
  background-color: rgba(255, 255, 255, 0.1);
  color: #ffffff;
  transform: translateX(4px);
}

.icon {
  margin-right: 10px;
  min-width: 20px;
}

.more-menu {
  position: relative;
}

.submenu {
  background-color: #2d2d3d;
  padding-left: 10px;
  border-left: 3px solid #4a90e2;
  margin-top: 6px;
  border-radius: 6px;
  overflow: hidden;
  transition: all 0.3s ease;
}

.submenu.collapsed {
  padding-left: 4px;
}

.submenu li {
  margin: 6px 0;
}

.submenu a {
  font-size: 14px;
  padding: 8px 14px;
}

.divider {
  border: none;
  height: 1px;
  background-color: rgba(255, 255, 255, 0.2);
  margin: 20px 0;
}

.toggle-btn {
  display: none;
  position: fixed;
  top: 16px;
  left: 16px;
  background: #1f1f2f;
  border: none;
  color: white;
  padding: 8px 10px;
  border-radius: 6px;
  z-index: 1100;
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
}

.collapse-btn {
  background: transparent;
  border: none;
  color: #4a90e2;
  cursor: pointer;
  padding: 10px;
  font-size: 18px;
  align-self: center;
  margin-top: auto;
  transition: color 0.3s ease;
}

.collapse-btn:hover {
  color: #82b1ff;
}

.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s ease;
}

.slide-enter-from,
.slide-leave-to {
  transform: translateX(-100%);
  opacity: 0;
}

.mobile-overlay {
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  width: 100vw;
  background-color: rgba(0, 0, 0, 0.4);
  z-index: 999;
}


/* Responsive */
@media (max-width: 768px) {
  .admin-sidebar {
    position: fixed;
    left: 0;
    top: 0;
    bottom: 0;
    height: 100vh;
    z-index: 1000;
    transition: transform 0.3s ease-in-out;
    transform: translateX(-100%);
    /* Default hidden */
  }

  .admin-sidebar.sidebar-open {
    transform: translateX(0);
    /* Slide in */
  }

  .admin-sidebar.sidebar-closed {
    transform: translateX(-100%);
    /* Slide out */
  }
}
</style>