<template>

  <section class="templates">
    <div class="header">
      <h1>My Templates</h1>
    </div>
<div class="template-list">
    <div v-if="templates.length>0" v-for="template in templates" :key="template.id" class="template-card">
      <!-- Delete Icon -->
      <span class="delete-icon" @click="deleteTemplate(template.id)" title="Delete Template">
        <Trash2 class="icon" />
      </span>

      <img :src="`${BACKEND_BASE}/${template.image_url}`" :alt="template.name" />
      <h3>{{ template.name }}</h3>
      <p class="template-id">Template ID: {{ template.id }}</p>
      <RouterLink :to="`/dashboard/myTemplates/${template.id}`" class="preview-button">
        Publish / Edit
      </RouterLink>
    </div>
    <div v-else><p style="color: red;">You haven't edited any templates yet!!</p><p><RouterLink to="/dashboard/templates">Search for one and edit now!</RouterLink> </p></div>
</div>
  </section>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
const BACKEND_BASE = import.meta.env.VITE_API_URL
import { Trash2 } from 'lucide-vue-next';
import { useAlertStore } from '@/stores/alert';
import { useConfirmStore } from '@/stores/confirm';
import { fetchCsrfToken } from '@/utils/csrf';

const alert = useAlertStore();
const confirm = useConfirmStore();


const user = ref({});
const templates = ref([]);
const router = useRouter();

const fetchUserDashboard = async () => {
  try {
    const res = await fetch(`${BACKEND_BASE}/api/user/me`, {
      credentials: "include"
    });

    if (!res.ok) {
      if (res.status === 401) {
        router.push("/login");
      } else {
        throw alert.show("Unexpected error","error");
      }
    } else {
      const data = await res.json();
      user.value = data.user;
      templates.value = data.templates || [];
    }
  } catch (err) {
    alert.show("Failed to fetch dashboard data: " + err, "error");
  }
};

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


const deleteTemplate = async (templateId) => {
  const confirmed = await confirm.show("Are you sure to delete this Template? The published Page will also be deleted!!")
  if (!confirmed){
    return;
  }
if (confirmed){
  const csrfToken = await fetchCsrfToken();
  try {
    const res = await fetch(`${BACKEND_BASE}/api/templates/${templateId}/delete`, {
      method: 'DELETE',
      credentials: 'include',
      headers:{"X-CSRFToken":csrfToken}
    });

    const result = await res.json();

    if (res.ok) {
      templates.value = templates.value.filter(t => t.id !== templateId);
      alert.show("Template deleted successfully.","success");
    } else {
      alert.show(result.message || "Failed to delete template.","error");
    }
  } catch (err) {
    console.error("Error deleting template:", err);
    alert.show("An error occurred while deleting the template.","error");
  }}
};


onMounted(() => {
  checkAuth();
  fetchUserDashboard();
});
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Dancing+Script:wght@600&display=swap');

.dashboard {
  display: flex;
  height: 100vh;
  font-family: 'Segoe UI', sans-serif;
  background: #ffffff;
}

.main-content {
  flex: 1;
  background: inherit;
  overflow-y: auto;
}

.templates {
  background: #ffffff;
  padding : 0 !important;
}

.header h1 {
  font-family: 'Cormorant Garamond', serif;
  font-size: 3rem;
  /* margin-bottom: 1.5rem; */
  color: var(--text);
  border-bottom: 1px solid rgb(217, 217, 217);
  padding-bottom: 20px;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
}

.subtitle {
  font-size: 1rem;
  color: #6c757d;
  margin-bottom: 30px;
}

.template-list {
  display: flex;
  flex-wrap: wrap;
  gap: 32px;
  justify-content: flex-start;
}

.template-card {
  position: relative;
  background: #fff0f6;
  border-radius: 18px;
  width: 260px;
  padding: 20px;
  text-align: center;
  transition: all 0.3s ease;
  border: 2px solid #ffdbe9;
  box-shadow: 0 6px 18px rgba(255, 174, 211, 0.15);
}

.template-card:hover {
  transform: translateY(-8px);
  border-color: #ffafcc;
  background-color: #fff6fb;
  box-shadow: 0 12px 28px rgba(229, 2, 237, 0.15);
}

.template-card img {
  width: 100%;
  height: 160px;
  object-fit: cover;
  border-radius: 12px;
  margin-bottom: 14px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.template-card h3 {
  font-size: 1.2rem;
  color: #c9184a;
  margin-bottom: 6px;
}

.template-id {
  font-size: 0.9rem;
  color: #6c757d;
  margin-bottom: 16px;
}

.preview-button {
  display: inline-block;
  background-color: #ffafcc;
  color: white;
  padding: 10px 18px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  transition: background-color 0.3s ease, transform 0.2s ease;
  text-decoration: none;
}

.preview-button:hover {
  background-color: #ff87b2;
  transform: translateY(-2px);
}

.icon{
  width: 35px;
  height: auto;
  color: #c9184a;
}
.delete-icon {
  position: absolute;
  top: 10px;
  right: 10px;
  background-color: transparent;
  border-radius: 50%;
  padding: 5px;
  font-size: 18px;
  cursor: pointer;
  display: none;
  transition: all 0.2s ease;
  z-index: 2;
}

.template-card:hover .delete-icon {
  display: inline-block;
}

</style>
