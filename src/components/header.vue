<script setup>
import { ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAlertStore } from '@/stores/alert';

const BACKEND_BASE = import.meta.env.VITE_API_URL;

const route = useRoute();
const router = useRouter();
const alert = useAlertStore();

const isMobileMenuOpen = ref(false);
const showDropdown = ref(false);
const LoggedIn = ref(false);
const user = ref({});

const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value;
};

const fetchUser = async () => {
  try {
    const res = await fetch(`${BACKEND_BASE}/api/user/me`, {
      credentials: 'include',
    });

    if (!res.ok) {
      if (res.status === 401) {
        LoggedIn.value = false;
      } else {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to fetch user');
      }
    } else {
      const data = await res.json();
      user.value = data.user;
      LoggedIn.value = true;
    }
  } catch (err) {
    LoggedIn.value = false;
  }
};

watch(() => route.fullPath, () => {
  fetchUser();
});

const logout = async () => {
  try {
    const res = await fetch(`${BACKEND_BASE}/api/logout`, {
      method: 'GET',
      credentials: 'include',
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || 'Logout failed');
    }

    router.push('/login');
    alert.show(data.message || 'Logged out successfully.', 'success');
  } catch (err) {
    alert.show(err.message || 'Logout failed. Please try again.', 'error');
  }
};
</script>




<template>
    <header>
        <div class="container">
            <div class="logo">
                <RouterLink to="/">Forever</RouterLink>
            </div>
            <div class="mb-toggle-btn-div">
                <button class="mobile-menu-toggle" @click="toggleMobileMenu">
                    <span :class="{ open: isMobileMenuOpen }"></span>
                    <span :class="{ open: isMobileMenuOpen }"></span>
                    <span :class="{ open: isMobileMenuOpen }"></span>
                </button>
            </div>

            <nav :class="['main-nav', { open: isMobileMenuOpen }]">
                <ul>
                    <li :class="{ 'is-active': route.meta.navName === 'template' }">
                        <RouterLink to="/template" @click="toggleMobileMenu">Templates</RouterLink>
                    </li>
                    <li :class="{ 'is-active': route.meta.navName === 'features' }">
                        <RouterLink to="/features" @click="toggleMobileMenu">Features</RouterLink>
                    </li>
                    <li :class="{ 'is-active': route.meta.navName === 'pricing' }">
                        <RouterLink to="/pricing" @click="toggleMobileMenu">Pricing</RouterLink>
                    </li>
                    <li :class="{ 'is-active': route.meta.navName === 'contact' }">
                        <RouterLink to="/contact" @click="toggleMobileMenu">Contact Us</RouterLink>
                    </li>
                    <li v-if="!LoggedIn">
                        <div class="auth-dropdown" @mouseenter="showDropdown = true" @mouseleave="showDropdown = false">
                            <button class="dropdown-toggle">Get Started</button>
                            <div class="dropdown-menu" v-if="showDropdown">
                                <RouterLink to="/login" class="dropdown-item" @click="toggleMobileMenu"
                                    :class="{ 'is-active': route.meta.navName === 'login' }">
                                    Sign In
                                </RouterLink>
                                <RouterLink to="/register" class="dropdown-item" @click="toggleMobileMenu"
                                    :class="{ 'is-active': route.meta.navName === 'register' }">
                                    Register
                                </RouterLink>
                            </div>
                        </div>

                    </li>
                    <li v-if="LoggedIn">
                        <div class="auth-dropdown" @mouseenter="showDropdown = true" @mouseleave="showDropdown = false">
                            <button class="dropdown-toggle" style="border: none;">{{ user.first_name }}</button>
                            <div class="dropdown-menu" v-if="showDropdown">
                                <RouterLink to="/dashboard" class="dropdown-item" @click="toggleMobileMenu"
                                    :class="{ 'is-active': route.meta.navName === 'dashboard' }">
                                    Dashboard
                                </RouterLink>
                                <RouterLink to="/dashboard/templates" class="dropdown-item" @click="toggleMobileMenu"
                                    :class="{ 'is-active': route.meta.navName === 'dashboard/templates' }">
                                    Templates
                                </RouterLink>
                                <RouterLink to="/dashboard/myTemplates" class="dropdown-item" @click="toggleMobileMenu"
                                    :class="{ 'is-active': route.meta.navName === 'dashboard/myTemplates' }">
                                    My Edits
                                </RouterLink>
                                <RouterLink to="/dashboard/published" class="dropdown-item" @click="toggleMobileMenu"
                                    :class="{ 'is-active': route.meta.navName === 'dashboard/published' }">
                                    Published Templates
                                </RouterLink>
                    <RouterLink class="dropdown-item">
                        <a href="#" @click.prevent="logout" title="Logout" @click="toggleMobileMenu">
                            Logout
                        </a>
                    </RouterLink>

        </div>
        </div>

        </li>
        </ul>
        </nav>

        </div>

    </header>
</template>


<style scoped>
header {
    position: sticky;
    top: 0;
    z-index: 999999999;
    padding: 15px 0;
    background-color: rgba(255, 255, 255, 0.8); 
    backdrop-filter: blur(10px); 
    -webkit-backdrop-filter: blur(10px); 
    box-shadow: 0 8px 30px rgba(255, 255, 255, 0.3), 
                0 2px 10px var(--shadow); 
    transition: background-color 0.3s ease;
}


header .container {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
}

.logo a {
    font-family: "Playfair Display", serif;
    font-size: 1.8rem;
    font-weight: 600;
    color: var(--text-color);
}

/* Desktop nav */
.main-nav {
    display: flex;
    align-items: center;
}

.main-nav ul {
    display: flex;
    align-items: center;
    gap: 30px;
    list-style: none;
    margin: 0;
    padding: 0;
}

.main-nav a {
    font-weight: 500;
    color: var(--text-color);
    text-decoration: none;
}

.main-nav a:hover {
    color: var(--accent-color);
}

.sign-in {
    padding: 10px 20px;
    border: 1px solid var(--accent-color);
    border-radius: 6px;
    font-weight: 500;
    text-align: center;
    margin-right: 10px;
}

.auth-buttons {
    display: flex;
    flex-wrap: wrap;
}

.active_button,
.active_button:hover {
    color: var(--accent-color);
    font-weight: bold;
}

.mb-toggle-btn-div {
    display: flex;
    justify-content: flex-end;
}

/* Hamburger menu button */
.mobile-menu-toggle {
    display: none;
    background: none;
    border: none;
    cursor: pointer;
    flex-direction: column;
    margin-left: 0;
    margin-right: auto;
    gap: 5px;
}

.mobile-menu-toggle span {
    display: block;
    width: 25px;
    height: 3px;
    background-color: var(--text-color);
    transition: all 0.3s ease;
}

.mobile-menu-toggle span.open:nth-child(1) {
    transform: rotate(45deg) translateY(11px);
}

.mobile-menu-toggle span.open:nth-child(2) {
    opacity: 0;
}

.mobile-menu-toggle span.open:nth-child(3) {
    transform: rotate(-45deg) translateY(-11px);
}

/* Responsive styles */
@media (max-width: 768px) {
    .container {
        width: auto;
    }

    .main-nav {
        width: 100%;
        flex-direction: column;
        overflow: hidden;
        max-height: 0;
        transition: max-height 0.3s ease;
    }

    .main-nav.open {
        min-height: 100vh;
        height: auto;
        padding: 10px 0;
    }

    .main-nav ul {
        
        flex-direction: column;
        justify-content: center;
        align-items: center;
        margin-top: 7vh;
        font-size: 140%;
        gap: 25px;
    }

    .mobile-menu-toggle {
        display: flex;
    }

    .auth-buttons {
        flex-direction: column;
        gap: 15px;
        
    }
    .auth-dropdown{
        border-left: none !important;
        border-top: 1px solid black ;
        padding: 0 !important;
        align-items: center;
        padding-top: 10px !important;

    }
}


.is-active>a,
a.is-active {
    color: var(--accent-color);

}

.active_button,
.active_button:hover {

    color: var(--accent-color);

}

.auth-dropdown {
    position: relative;
    display: inline-block;
    border-left: 1px solid black;
    padding-left: 20px;
}

.dropdown-toggle {
    padding: 0.5rem 1rem;
    background: transparent;
  text-transform: capitalize;

    color: black;
    border: 1px solid black;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 500;
    font-size: large;
    padding: 10px;
    transition: background 0.3s ease;
}

.dropdown-toggle:hover {
    background: #f0f4ff;
    color: var(--accent-color);

}

.dropdown-menu {
    position: absolute;
    top: 100%;
    left: 0;
    background: white;
    border-radius: 8px;
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
    overflow: hidden;
    z-index: 999;
    min-width: 160px;
}

.dropdown-item {
    display: block;
    padding: 0.75rem 1rem;
    color: #333;
    text-decoration: none;
    font-weight: 500;
  text-transform: capitalize;

    transition: background 0.2s ease, color 0.2s ease;
}

.dropdown-item:hover {
    background: #f0f4ff;
    color: #4c51bf;
}

.is-active,
.active_button {
    font-weight: bold;
    color: #4c51bf;
}
</style>