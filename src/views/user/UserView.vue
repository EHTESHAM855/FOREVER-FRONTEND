<template>
  <div class="dashboard">
    <User_sidebar />
    <main class="main-content">
      <router-view />
    </main>
    <Alerts />
    <Report_button />
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import Report_button from '@/components/Report_button.vue';
import User_sidebar from '@/components/user_sidebar.vue';
import Alerts from '@/components/alerts.vue';

const BACKEND_BASE = import.meta.env.VITE_API_URL;
const router = useRouter();

const checkAuth = async () => {
  try {
    const res = await fetch(`${BACKEND_BASE}/api/check-session`, {
      credentials: "include",
    });

    if (!res.ok) {
      if (res.status === 401) {
        console.warn("User auth check failed, redirecting to login.");
        router.push('/login');
      } else {
        throw new Error(`Auth check failed with status: ${res.status}`);
      }
    }

    console.log("User authenticated.");
  } catch (err) {
    console.error("User auth check error:", err);
    router.push('/login');
  }
};

onMounted(() => {
  checkAuth();
});
</script>

<style scoped>
.dashboard {
  display: flex;
  flex-direction: row;
  background: #ffffff;
  font-family: 'Segoe UI', sans-serif;
  min-height: 100vh;
}

.main-content {
  flex: 1;
  height: auto;
  padding: 24px 40px;
  background: inherit;
  overflow-y: auto;
  box-sizing: border-box;
}


@media (max-width: 1024px) {
  *{
    margin: 0;
    padding: 0;
  }
  .main-content {
    padding: 0;
    margin-left: 65px;

  }
}

@media (max-width: 768px) {
  .dashboard {
    flex-direction: column;
  }

  .main-content {
    padding: 16px 16px;
  }
}

@media (max-width: 480px) {
  .main-content {
    padding: 14px 12px;
  }
}
</style>
