<script setup>
import { ref, onMounted } from 'vue';
import { useRouter, RouterLink } from 'vue-router';
const BACKEND_BASE = import.meta.env.VITE_API_URL
import { useAlertStore } from '@/stores/alert'
import { useConfirmStore } from '@/stores/confirm';
import { fetchCsrfToken } from '@/utils/csrf';

const alert = useAlertStore();
const confirm = useConfirmStore();


const user = ref({});
const templates = ref([]);


const router = useRouter();

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
  } catch (err) {
    console.error("Error fetching user:", err);
  }
};

const fetchTemplates = async () => {
  try {
    const res = await fetch(`${BACKEND_BASE}/api/published-templates`, {
      credentials: "include"
    });

    if (!res.ok) {
      throw new Error("Failed to fetch templates");
    }

    const data = await res.json();
    templates.value = data;  // Assuming the response is an array of templates
  } catch (err) {
    console.error("Failed to fetch templates:", err);
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
    router.push('/login');  // Redirect on any error during check
  }
};

const copiedMap = ref({});

const fallbackCopyTextToClipboard = (text) => {
  const textArea = document.createElement("textarea");
  textArea.value = text;

  // Avoid scrolling to bottom
  textArea.style.position = "fixed";
  textArea.style.top = 0;
  textArea.style.left = 0;
  textArea.style.width = "2em";
  textArea.style.height = "2em";
  textArea.style.padding = 0;
  textArea.style.border = "none";
  textArea.style.outline = "none";
  textArea.style.boxShadow = "none";
  textArea.style.background = "transparent";

  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();

  let successful = false;
  try {
    successful = document.execCommand('copy');
  } catch (err) {
    console.error('Fallback: Copy command failed', err);
  }

  document.body.removeChild(textArea);
  return successful;
};

const copyToClipboard = async (text, id) => {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      copiedMap[id] = true;
      alert.show('Successfully Copied', "success");
      setTimeout(() => {
        copiedMap[id] = false;
      }, 3000);
    } catch (err) {
      console.error("Failed to copy:", err);
      alert.show('Copy failed', "error");
    }
  } else {
    // Clipboard API not available, fallback to execCommand
    const success = fallbackCopyTextToClipboard(text);
    if (success) {
      copiedMap[id] = true;
      alert.show('Successfully Copied (fallback)', "success");
      setTimeout(() => {
        copiedMap[id] = false;
      }, 3000);
    } else {
      alert.show('Copy not supported in this browser', "error");
    }
  }
};

const pauseTemplate = async (id,new_status) => {
  const confirmed = await confirm.show(`Are you sure to ${new_status}?`)
  if (confirmed){
    const csrfToken = await fetchCsrfToken();
  try {
    const res = await fetch(`${BACKEND_BASE}/api/published-templates/${id}/${new_status}`, {
      method: 'PUT',
      credentials: 'include',
      headers:{"X-CSRFToken":csrfToken}
    });
    if (res.ok) {
      alert.show('Template paused successfully', 'success');
      fetchTemplates();
    } else {
      alert.show('Failed to pause template', 'error');
    }
  } catch (err) {
    alert.show('Error pausing template', 'error');
    console.error(err);
  }}
};

const deleteTemplate = async (id) => {
  const confirmed = await confirm.show("Confirm that you want to delete, This can't be Undone!!")
  if (confirmed){
  try {
    const csrfToken = await fetchCsrfToken();
    const res = await fetch(`${BACKEND_BASE}/api/published-templates/${id}`, {
      method: 'DELETE',
      credentials: 'include',
      headers:{
        "X-CSRFToken":csrfToken
      }
    });
    if (res.ok) {
      alert.show('Template deleted successfully', 'success');
      templates.value = templates.value.filter(t => t.id !== id);
    } else {
      alert.show('Failed to delete template', 'error');
    }
  } catch (err) {
    alert.show('Error deleting template', 'error');
    console.error(err);
  }}
};

onMounted(() => {
  checkAuth();
  fetchUser();
  fetchTemplates();
  templates.value.forEach(t => t.showDropdown = false);
});
</script>

<template>

  <section class="templates">
    <div class="header">
      <h1>Published Pages</h1>
    </div>

    <div class="table-container">
      <table class="modern-table">
        <thead>
          <tr>
            <th>Thumbnail</th>
            <th>Name</th>
            <th>Unpublishing On</th>
            <th>Total Cost</th>
            <th>Status</th>
            <th>Total visits</th>
            <th>URL</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="template in templates" :key="template.id">
            <td data-label="Thumbnail">
              <img :src="`${BACKEND_BASE}/${template.image}`" alt="Thumbnail" class="thumb" />
            </td>
            <td data-label="Name">{{ template.name }}</td>
            <td data-label="Unpublishing On">{{ template.enddate }}</td>
            <td data-label="Total Cost" >₹{{ template.price }}</td>
            <td data-label="Status">
              <!-- <span :class="getStatus(template.enddate) === 'Active' ? 'status-active' : 'status-expired'">
                    {{ getStatus(template.enddate) }}
                  </span> -->
              <span v-if="template.status == 'active'" class="status-active">Active</span>
              <span v-if="template.status == 'paused-u' || template.status==='paused'" class="status-expired">Paused</span>
              <span v-if="template.status == 'expired'" class="status-expired">Expired</span>


            </td>
            <td data-label="Total visits">{{ template.visitors_count || 0 }}</td>
            <td data-label="URL">
              <div class="url-block">
                <a :href="`http://localhost:5173/p/${template.user}/${template.name}`" target="_blank" class="url-link">
                  Visit
                </a>
                <button class="copy-button" :disabled="copiedMap[template.id]"
                  @click="copyToClipboard('http://localhost:5173/p/' + template.user + '/' + template.name, template.id)">
                  {{ copiedMap[template.id] ? 'Copied' : '📋' }}
                </button>

              </div>
            </td>
            <td data-label="Action">
              <div class="dropdown-container">
                <button @click="template.showDropdown = !template.showDropdown" class="action-btn">
                  More  ⏷
                </button>
                <div v-if="template.showDropdown" class="dropdown-menu">
                  <RouterLink v-if="template.status==='active'" :to="`/dashboard/PublishedTemplates/ExtendTimeline/${template.id}`" class="dropdown-item">
                    Extend
                  </RouterLink>
                  <button v-if="template.status==='active'" @click="pauseTemplate(template.id,'paused-u')" class="dropdown-item">Pause</button>
                  <button v-if="template.status==='paused-u'" @click="pauseTemplate(template.id,'active')" class="dropdown-item">Resume</button>
                  <button  @click="deleteTemplate(template.id)" class="dropdown-item delete">Delete</button>
                </div>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>


<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Dancing+Script:wght@600&display=swap');



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
  color: #555;
}

.templates {
  padding: 0 !important;
  border-radius: 10px;
}

.templates h2 {
  font-size: 26px;
  color: #c9184a;
  margin-bottom: 20px;
  font-weight: 600;
}

.table-container {
  overflow-x: auto;
  background-color: inherit;
  border-radius: 12px;
  /* box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08); */
  padding: 20px;
}

.modern-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.95rem;
  font-family: 'Segoe UI', sans-serif;
}

.modern-table th,
.modern-table td {
  padding: 14px 16px;
  text-align: left;
  border-bottom: 1px solid #eee;
  /* text-align: center; */


}

.modern-table th {
  background-color: inherit;
  color: #a83264;
  font-weight: 600;
  font-size: 0.95rem;
}

.modern-table tr:hover {
  background-color: inherit;
  transition: 0.2s;
}

.thumb {
  width: 280px;
  border-radius: 8px;
  object-fit: cover;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.url-block {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.url-link {
  background-color: #fce7f3;
  padding: 4px 10px;
  border-radius: 5px;
  color: #c9184a;
  font-weight: 500;
  text-decoration: none;
  transition: 0.3s;
}

.url-link:hover {
  background-color: #ffd4ea;
  color: #0000cc;
}

.copy-button {
  background: #ffafcc;
  border: none;
  padding: 6px 10px;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  color: white;
  transition: 0.3s ease;
}

.copy-button:hover {
  background-color: #ff87b2;
}

.copy-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.status-active {
  background-color: #c4fdd2;
  color: #1a6e2b;
  padding: 4px 10px;
  border-radius: 6px;
  font-weight: 600;
}

.status-expired {
  background-color: #ffd1d1;
  color: #a40000;
  padding: 4px 10px;
  border-radius: 6px;
  font-weight: 600;
}

.extend-btn {
  background-color: #eacaff;
  padding: 6px 12px;
  border-radius: 8px;
  text-decoration: none;
  color: #6f00a9;
  font-weight: 600;
  transition: background-color 0.3s ease;
}

.extend-btn:hover {
  background-color: #d3aaff;
}

.dropdown-container {
  position: relative;
  display: inline-block;
}

.action-btn {
  background-color: #d6e0f5;
  border: none;
  padding: 6px 12px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  color: #003366;
  transition: background-color 0.3s ease;
}

.action-btn:hover {
  background-color: #b3c7f9;
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  left: -10px;
  z-index: 1000;
  background: white;
  border: 1px solid #ccc;
  min-width: 150px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  border-radius: 6px;
  padding: 5px 0;
  margin-top: 4px;
}

.dropdown-item {
  padding: 8px 12px;
  font-size: 0.9rem;
  color: #333;
  display: block;
  text-decoration: none;
  background: transparent;
  border: none;
  text-align: left;
  width: 100%;
}

.dropdown-item:hover {
  background-color: #f0f0f0;
  color: #0000aa;
}

.dropdown-item.delete {
  color: #a40000;
}

.dropdown-item.delete:hover {
  background-color: #ffe6e6;
}

@media (max-width: 768px) {
  .modern-table thead {
    display: none;
  }

  .modern-table,
  .modern-table tbody,
  .modern-table tr,
  .modern-table td {
    display: block;
    width: 100%;
  }

  .modern-table tr {
    margin-bottom: 15px;
    border-bottom: 2px solid #eee;
  }

  .modern-table td {
    text-align: right;
    padding-left: 50%;
    position: relative;
  }

  .modern-table td::before {
    content: attr(data-label);
    position: absolute;
    left: 16px;
    width: 45%;
    padding-right: 10px;
    font-weight: bold;
    text-align: left;
  }
}
</style>
