

<script setup>
import AdminSidebar from '@/components/AdminSidebar.vue';
import { onMounted, ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { fetchCsrfToken } from '@/utils/csrf';
import { useAlertStore } from '@/stores/alert';
import { useConfirmStore } from '@/stores/confirm';
const BACKEND_BASE = import.meta.env.VITE_API_URL

const alert = useAlertStore();
const confirm = useConfirmStore();


const swatchColors = [
  '#374151', // Gray
  '#f87171', // Red
  '#fb923c', // Orange
  '#fde68a', // Yellow
  '#34d399', // Green
  '#60a5fa', // Blue
  '#a78bfa', // Purple
  '#f472b6', // Pink
  '#a3a3a3', // Light Gray
  '#78350f'  // Brown
];

const formData = ref({
  pageType: 'one',
  price: '',
  category: '',
  collection: '',
  swatchColor: '#374151',
  description: '',
  zip: null,
  thumbnail: null
});

const loading = ref(false);
const error = ref('');
const success = ref('');
const PreviewPath = ref('');
const showCategoryModal = ref(false);
const showCollectionModal = ref(false);
const newCategory = ref('');
const newCollection = ref('');
const categories = ref([]);
const collections = ref([]);

const isFormValid = computed(() =>
  formData.value.zip && formData.value.thumbnail && formData.value.description && formData.value.price && formData.value.category && formData.value.collection && formData.value.swatchColor
);

const formatFileSize = (bytes) => {
  if (!bytes) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
};

const handleFileUpload = (event) => {
  const file = event.target.files[0];
  if (!file) {
    error.value = 'No ZIP file selected';
    formData.value.zip = null;
    return;
  }
  const isZip = file.type === 'application/zip' || file.name.endsWith('.zip');
  if (isZip) {
    formData.value.zip = file;
    error.value = '';
  } else {
    error.value = 'Please select a valid ZIP file';
    formData.value.zip = null;
  }
};

const handleThumbnailUpload = (event) => {
  const file = event.target.files[0];
  if (!file) {
    error.value = 'No thumbnail selected';
    formData.value.thumbnail = null;
    return;
  }
  const isPng = file.type === 'image/png' || file.name.endsWith('.png');
  if (isPng) {
    formData.value.thumbnail = file;
    error.value = '';
  } else {
    error.value = 'Thumbnail must be a .png file';
    formData.value.thumbnail = null;
  }
};

const submitForm = async () => {
  const confirmed = await confirm.show("Sure to Submit the form?")
  if (!confirmed) { return; }
  error.value = '';
  success.value = '';
  loading.value = true;

  const data = new FormData();
  data.append('pageType', formData.value.pageType);
  data.append('category', formData.value.category);
  data.append('price', formData.value.price);
  data.append('collection', formData.value.collection);
  data.append('swatchColor', formData.value.swatchColor);
  data.append('description', formData.value.description);
  data.append('file', formData.value.zip);
  data.append('thumbnail', formData.value.thumbnail);

  try {
    const csrfToken = await fetchCsrfToken();
    const response = await fetch(`${BACKEND_BASE}/api/templates/upload`, {
      method: 'POST',
      headers: {
        'X-CSRFToken': csrfToken
      },
      credentials: 'include',
      body: data
    });

    const result = await response.json();

    if (response.ok && result.success) {
      success.value = 'Template uploaded successfully!';
      PreviewPath.value = `/TemplatePreview/${result.template_name}`;
      formData.value = {
        pageType: 'one',
        swatchColor: '#374151',
        description: '',
        price: '',
        zip: null,
        thumbnail: null
      };
    } else {
      error.value = result.error || 'Failed to upload template. Please try again.';
    }
  } catch (err) {
    console.error('Upload failed:', err);
    error.value = 'Failed to upload template. Please try again.';
  } finally {
    loading.value = false;
  }
};

const router = useRouter();

const checkAuth = async () => {
  try {
    const res = await fetch(`${BACKEND_BASE}/api/check-admin-session`, {
      credentials: "include",
    });
    if (!res.ok) {
      if (res.status === 401) {
        console.warn("Admin auth check failed, redirecting to login.");
        router.push('/admin/login');
      } else {
        throw new Error(`Auth check failed with status: ${res.status}`)
      }
    }
    // If response is ok, user is authenticated
    // console.log("Admin authenticated.");
  } catch (err) {
    console.error("Admin auth check error:", err);
    router.push('/admin/login');
  }
};



const fetchCategories = async () => {
  const res = await fetch(`${BACKEND_BASE}/api/template-categories`);
  const data = await res.json();
  categories.value = data.categories;
};

const fetchCollections = async () => {
  const res = await fetch(`${BACKEND_BASE}/api/template-collections`);
  const data = await res.json();
  collections.value = data.collections;
};

const submitCategory = async () => {
  if (!newCategory.value.trim()) return;
  const csrfToken = await fetchCsrfToken();

  const res = await fetch(`${BACKEND_BASE}/api/template-categories`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRFToken': csrfToken
    },
    credentials: 'include',
    body: JSON.stringify({ category: newCategory.value.trim() })
  });
  if (res.ok) {
    await fetchCategories();
    alert.show("New Category Added", "success")
    newCategory.value = '';
    showCategoryModal.value = false;
    return;
  } else {
    alert.show("Failed to add new category, Try Again.", "error")
  }
};

const submitCollection = async () => {
  if (!newCollection.value.trim()) return;
  const csrfToken = await fetchCsrfToken();

  const res = await fetch(`${BACKEND_BASE}/api/template-collections`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRFToken': csrfToken
    },
    credentials: 'include',
    body: JSON.stringify({ collection: newCollection.value.trim() })
  });
  if (res.ok) {
    await fetchCollections();
    alert.show("New Collection Added", "success")
    newCollection.value = '';
    showCollectionModal.value = false;
    return
  }
  alert.show("Failed to add new collection, Try Again.", "error")
};
const resetForm = () => {
  formData.value = {
    pageType: 'one',
    price: '',
    category: '',        
    collection: '',      
    swatchColor: '#374151',
    description: '',
    zip: null,
    thumbnail: null
  };
  error.value = '';
  success.value = '';
  loading.value = false;
};


onMounted(() => {
  checkAuth();
  fetchCategories();
  fetchCollections();
});
</script>


<template>
  <!-- Category Modal -->
  <div v-if="showCategoryModal" class="modal-backdrop">
    <div class="modal">
      <h2>Add New Category</h2>
      <input v-model="newCategory" placeholder="Enter category name" />
      <div class="modal-actions">
        <button @click="submitCategory" class="action-btn edit">Add</button>
        <button @click="showCategoryModal = false" class="action-btn delete">Cancel</button>
      </div>
    </div>
  </div>

  <!-- Collection Modal -->
  <div v-if="showCollectionModal" class="modal-backdrop">
    <div class="modal">
      <h2>Add New Collection</h2>
      <input v-model="newCollection" placeholder="Enter collection name" />
      <div class="modal-actions">
        <button @click="submitCollection" class="action-btn edit">Add</button>
        <button @click="showCollectionModal = false" class="action-btn delete">Cancel</button>
      </div>
    </div>
  </div>
  <div class="admin-dashboard">
    <AdminSidebar />
    <main class="admin-main-content">
      <div class="admin-upload">
        <h1>Upload New Wedding Template</h1>
        <!-- Error Message -->
        <div v-if="error" class="error-message">
          {{ error }}
        </div>

        <!-- Success Message -->
        <div v-if="success" class="success-message">
          {{ success }}<br>
          <router-link :to="PreviewPath" v-if="PreviewPath">
            See Preview
          </router-link>
        </div>
        

        <form @submit.prevent="submitForm" class="upload-form">
          <!-- Page Type Selection -->
          <div class="form-group page-type-group">
            <label>Page Type</label>
            <div class="page-type-options">
              <button type="button" :class="{ active: formData.pageType === 'one' }"
                @click="formData.pageType = 'one'">One Page</button>
              <button type="button" :class="{ active: formData.pageType === 'multi' }"
                @click="formData.pageType = 'multi'">Multi Page</button>
            </div>
          </div>

          <div class="form-group">
            <label for="templateDescription">Price:</label>
            <input type="number" id="templatePrice" v-model="formData.price"
              placeholder="Price/day for the template"></input>
          </div>
<div class="fil-cont">
          <!-- Category Dropdown -->
          <div class="form-group">
            <label for="category">Category</label>
            <div class="input-group">
              <select id="category" v-model="formData.category">
                <option v-for="cat in categories" :key="cat.id" :value="cat.category">{{ cat.category }}</option>
              </select>
              <button type="button" class="small-btn" @click="showCategoryModal = true">+ Add</button>
            </div>
          </div>

          <!-- Collection Dropdown -->
          <div class="form-group">
            <label for="collection">Collection</label>
            <div class="input-group">
              <select id="collection" v-model="formData.collection">
                <option v-for="col in collections" :key="col.id" :value="col.collection">{{ col.collection }}</option>
              </select>
              <button type="button" class="small-btn" @click="showCollectionModal = true">+ Add</button>
            </div>
          </div>
</div>




          <!-- Color Swatches -->
          <div class="form-group color-swatches">
            <label>Color Theme</label>
            <div class="swatch-list">
              <span v-for="(swatch, idx) in swatchColors" :key="idx" :style="{ backgroundColor: swatch }"
                :class="{ swatch: true, selected: formData.swatchColor === swatch }"
                @click="formData.swatchColor = swatch"></span>
            </div>
          </div>

          <!-- Thumbnail Image -->
          <div class="form-group">
            <label for="thumbnail" class="file-upload">Select Thumbnail Image (.png):</label>
            <input type="file" id="thumbnail" accept=".png" @change="handleThumbnailUpload" required>
            <div class="file-details" v-if="formData.thumbnail">
              Selected image: {{ formData.thumbnail.name }} ({{ formatFileSize(formData.thumbnail.size) }})
            </div>
          </div>

          <!-- Template Description -->
          <div class="form-group">
            <label for="templateDescription">Description:</label>
            <textarea minlength="200" id="templateDescription" v-model="formData.description"
              placeholder="Add template description" rows="3"></textarea>
          </div>

          <!-- Template ZIP File -->
          <div class="form-group">
            <label for="zipFile" class="file-upload">Select Template ZIP:</label>
            <input type="file" id="zipFile" accept=".zip" @change="handleFileUpload" required>
            <div class="file-details" v-if="formData.zip">
              Selected file: {{ formData.zip.name }} ({{ formatFileSize(formData.zip.size) }})
            </div>
          </div>
<div class="buttons">
          <!-- Submit Button -->
          <button type="submit" class="submit-btn" :disabled="loading || !isFormValid">
            <span v-if="!loading">Upload Template</span>
            <span v-else>Uploading...</span>
          </button>
          <!-- Reset Button -->
        <button type="button" class="reset-btn" @click="resetForm">Reset Form</button>
       </div>


        </form>
      </div>
    </main>
  </div>
</template>






<style scoped>
.admin-dashboard {
  display: flex;
  height: 100vh;
  margin-left: 65px;
  background: #f3f4f6;
}

.admin-main-content {
  flex: 1;
  padding: 2rem 3rem;
  overflow-y: auto;
  background: #ffffff;
  border-top-left-radius: 1rem;
  box-shadow: inset 0 0 10px rgba(0, 0, 0, 0.05);
}


.admin-upload {
  max-width: 850px;
  margin: 0 auto;
  font-family: 'Inter', sans-serif;
}

.admin-upload h1 {
  font-size: 2rem;
  font-weight: 700;
  color: #111827;
  margin-bottom: 1.5rem;
}


.error-message,
.success-message {
  padding: 1rem;
  border-radius: 0.75rem;
  font-size: 1rem;
  font-weight: 500;
  margin-bottom: 1rem;
}

.error-message {
  background-color: #fee2e2;
  color: #991b1b;
  border: 1px solid #fecaca;
}

.success-message {
  background-color: #dcfce7;
  color: #065f46;
  border: 1px solid #bbf7d0;
}


.upload-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}


.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

label {
  font-weight: 600;
  color: #374151;
  font-size: 1rem;
}


input,
textarea,
select {
  padding: 0.75rem 1rem;
  border-radius: 0.5rem;
  border: 1px solid #d1d5db;
  font-size: 1rem;
  background: #f9fafb;
  color: #111827;
  transition: 0.2s ease;
}

input:focus,
textarea:focus,
select:focus,
.file-upload:hover {
  border-color: #ec4899;
  background: #fff;
  outline: none;
}


input[type="file"] {
  /* padding: ; */
  display: none;
  /* border: none;/ */
  /* padding: 0; */
}
.file-upload{
  display: inline-block;
  padding: 0.75rem 1rem;
  border-radius: 0.5rem;
  cursor: pointer;
  border: 1px solid #d1d5db;
  font-size: 1rem;
  background: #f9fafb;
  color: #111827;
  transition: 0.2s ease;
}

.file-details {
  font-size: 0.9rem;
  color: #6b7280;
}
.fil-cont{
  display: flex;
  flex-direction: auto;
  gap: 20px;
}

.page-type-group .page-type-options {
  display: flex;
  gap: 1rem;
}

.page-type-options button {
  padding: 0.6rem 1.2rem;
  border-radius: 0.5rem;
  background: #f3f4f6;
  border: 1px solid #d1d5db;
  color: #374151;
  font-weight: 600;
  transition: all 0.2s;
  cursor: pointer;
}

.page-type-options button.active {
  background-color: #ec4899;
  color: white;
  border-color: #ec4899;
}


.color-swatches .swatch-list {
  display: flex;
  gap: 0.5rem;
}

.swatch {
  width: 28px;
  height: 28px;
  border-radius: 9999px;
  border: 2px solid #e5e7eb;
  cursor: pointer;
  transition: border 0.2s ease;
}

.swatch.selected {
  border: 3px solid #ec4899;
  box-shadow: 0 0 0 3px #fce7f3;
}


.input-group {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.small-btn {
  padding: 0.4rem 0.7rem;
  font-size: 0.875rem;
  border-radius: 0.4rem;
  border: 1px solid #ec4899;
  background: #fff0f6;
  color: #ec4899;
  cursor: pointer;
  font-weight: 600;
  transition: background 0.2s;
}

.small-btn:hover {
  background: #fce7f3;
}

.buttons{
  display: flex;
  gap: 20px;
  
}

.submit-btn {
  background-color: #ec4899;
  color: white;
  padding: 0.85rem 1.5rem;
  font-size: 1rem;
  font-weight: 600;
  border: none;
  border-radius: 0.5rem;
  width: fit-content;
  transition: background-color 0.2s ease;
  cursor: pointer;
}

.submit-btn:hover:not(:disabled) {
  background-color: #db2777;
}

.submit-btn:disabled {
  background: #f9a8d4;
  cursor: not-allowed;
}


.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(17, 24, 39, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
}

.modal {
  background: white;
  border-radius: 1rem;
  padding: 2rem;
  width: 90%;
  max-width: 400px;
  box-shadow: 0 20px 35px rgba(0, 0, 0, 0.2);
}

.modal h2 {
  font-size: 1.5rem;
  margin-bottom: 1rem;
  color: #111827;
  font-weight: 700;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 1.5rem;
}

.action-btn {
  padding: 0.5rem 1rem;
  border-radius: 0.4rem;
  font-weight: 600;
  cursor: pointer;
  border: none;
  font-size: 0.95rem;
  transition: background 0.2s;
}

.action-btn.edit {
  background-color: #10b981;
  color: white;
}

.action-btn.edit:hover {
  background-color: #059669;
}

.action-btn.delete {
  background-color: #ef4444;
  color: white;
}

.action-btn.delete:hover {
  background-color: #dc2626;
}

.reset-btn {
  background: #f3f4f6;
  color: #374151;
  font-weight: 600;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  cursor: pointer;
  padding: 0.85rem 1.5rem;
  font-size: 1rem;
  transition: background-color 0.2s, transform 0.13s;
}

.reset-btn:hover {
  background-color: #e5e7eb;
  transform: translateY(-1px);
}
</style>
