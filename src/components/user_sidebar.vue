<template>
  <aside :class="['sidebar', { collapsed }]">
    <div class="sidebar-header">
      <span v-if="!collapsed">{{ user.first_name }}</span>
      <div class="toggle-btn" @click="collapsed = !collapsed">
        <ChevronRight  v-if="collapsed" />
        <ChevronLeft v-else/>
      </div>
    </div>
    <li style="list-style: none;">
          <hr class="divider" />
        </li>
    <nav>
      <ul>
        <li>
          <RouterLink to="/dashboard" title="Dashboard">
            <LayoutDashboard ></LayoutDashboard>
            <span v-if="!collapsed">Dashboard</span>
          </RouterLink>
        </li>
        <li>
          <RouterLink to="/dashboard/templates" title="Templates">
            <Layers ></Layers>
            <span v-if="!collapsed">Templates</span>
          </RouterLink>
        </li>
        <li>
          <RouterLink to="/dashboard/myTemplates" title="Edited Templates">
            <FilePenLine ></FilePenLine>
            <span v-if="!collapsed">My Edits</span>
          </RouterLink>
        </li>
        <li>
          <RouterLink to="/dashboard/uploads" title="Images Uploaded">
            <Upload  />
            <span v-if="!collapsed">Uploaded Images</span>
          </RouterLink>
        </li>
        <li>
          <RouterLink to="/dashboard/published" title="Published Pages">
            <Globe ></Globe>
            <span v-if="!collapsed">Published Pages</span>
          </RouterLink>
        </li>
        <li>
          <RouterLink to="/dashboard/transactions" title="Transactions">
            <IndianRupeeIcon  />
            <span v-if="!collapsed">Transactions</span>
          </RouterLink>
        </li>
        <li class="more-menu" @click="toggleMore" @mouseenter="showMore = true" @mouseleave="showMore = false"
          title="Account">
          <a href="#" class="nav-link">
            <CircleUser  />
            <span v-if="!collapsed">Account ▾</span>
          </a>
          <ul v-show="showMore || hoverMore" class="submenu">
            <li>
              <RouterLink to="/dashboard/profile" title="Profile" class="nav-link">
                <User  />
                <span v-if="!collapsed">Profile</span>
              </RouterLink>
            </li>
            <li>
              <RouterLink to="/dashboard/profile/edit" title="Edit Profile" class="nav-link">
                <UserPen  />
                <span v-if="!collapsed">Edit Profile</span>
              </RouterLink>
            </li>
          </ul>

        </li>

        <li>
          <hr class="divider" />
        </li>
        <li>
          <a href="#" @click.prevent="logout" title="Logout">
            <i class="fas fa-sign-out-alt"></i>
            <span v-if="!collapsed">Logout</span>
          </a>
        </li>
      </ul>
    </nav>
  </aside>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { CircleUser, UserPen, KeyRound, User, IndianRupeeIcon,Upload,LayoutDashboard,Layers,FilePenLine,Globe,ChevronRight,ChevronLeft } from 'lucide-vue-next';
import { useAlertStore } from '@/stores/alert';

const BACKEND_BASE = import.meta.env.VITE_API_URL;
const alert = useAlertStore();

const user = ref({});
const router = useRouter();

const collapsed = ref(true);
const showMore = ref(false);

const toggleMore = () => {
  showMore.value = !showMore.value;
};

const verified = ref(false);
const fetchUser = async () => {
  try {
    const res = await fetch(`${BACKEND_BASE}/api/user/me`, {
      credentials: "include"
    });

    if (!res.ok) {
      if (res.status === 401) {
        router.push("/login");
      } else {
        throw new Error("Unexpected error");
      }
    }

    const data = await res.json();
    user.value = data.user;
    verified.value = data.user.verified;
    if(!verified){
    router.push('/verify-email')
  }
  } catch (err) {
    console.error("Error fetching user:", err);
  }
};


const logout = async () => {
  try {
    const res = await fetch(`${BACKEND_BASE}/api/logout`, {
      method: 'GET',
      credentials: 'include',
    });

    if (!res.ok) throw new Error('Logout failed.');

    router.push('/login');
  } catch (err) {
    console.error(err);
    alert.show(err.message || 'Logout failed. Please try again.', 'error');
  }
};

onMounted(fetchUser);
</script>


<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Segoe+UI:wght@400;600&display=swap');
/* *{
  border: 1px solid red;
} */
.sidebar {
  width: 240px;
  background-color: #ffffff;
  color: #333;
  padding: 25px 10px;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.05);
  border-right: 0.5px solid rgb(219, 219, 219);
  display: flex;
  flex-direction: column;
  transition: width 0.3s ease;
  font-family: 'Segoe UI', sans-serif;
  min-height: 100vh;
  z-index: 0;
}

.sidebar-header {
  display: flex;
  flex-direction: row;
  justify-content: space-evenly;
  align-items: center;
}

.sidebar-header span {
  display: flex;
  justify-content: flex-end;
  margin: auto;
  font-weight: 700;
  font-size: 1.5rem;
  text-transform: capitalize;
}

.sidebar.collapsed {
  width: 70px;
}

.toggle-btn {
  display: flex;
  justify-content: flex-end;
  padding: 10px;
  font-size: 20px;
  margin: 6px;
  /* margin-right: 0;
  margin-left: auto; */
  cursor: pointer;
  color: #555;
}

.sidebar nav ul {
  list-style: none;
  padding: 0;
  margin: 20px 0 0 0;
}

.sidebar nav li {
  margin: 16px 0;
}

.sidebar nav a {
  display: flex;
  align-items: center;
  gap: 14px;
  color: #333;
  font-size: 16px;
  padding: 10px 14px;
  border-radius: 8px;
  transition: background-color 0.2s ease;
  text-decoration: none;
}

.sidebar nav a:hover,
.router-link-exact-active{
  background-color: #e0e0e0;
}

.divider {
  border: none;
  height: 1px;
  background-color: #ccc;
  margin: 16px 0;
}

/* Responsive */
@media (max-width: 768px) {
  .sidebar {
    position: fixed;
    z-index: 9999;
    left: 0;
    top: 10px;
    height: 100vh;
    width: 70px;
    padding-top: 60px;
  }

  .sidebar:not(.collapsed) {
    width: 240px;
  }
}

.more-menu {
  position: relative;
}

/* Nav link */
.nav-link {
  color: #333;
  text-decoration: none;
  font-size: 16px;
  display: flex;
  align-items: center;
  padding: 10px 14px;
  border-radius: 8px;
  transition: 0.2s ease;
  white-space: nowrap;
  position: relative;
}


.submenu {
  background-color: inherit;
  padding-left: 10px;
  margin-top: 5px;
  border-left: 2px solid #4a90e2;
}

.submenu li {
  margin: 8px 0;
}

.submenu a {
  font-size: 15px;
  padding: 8px 18px;
  transition: background-color 0.3s ease;
}

.submenu a:hover {
  background-color: rgba(255, 255, 255, 0.1);
  color: #333;
}
</style>
