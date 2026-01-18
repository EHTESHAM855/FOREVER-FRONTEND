<script setup>
import AdminSidebar from '@/components/AdminSidebar.vue';
import { onMounted, ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { fetchCsrfToken } from '@/utils/csrf';
import { useAlertStore } from '@/stores/alert';  // import alert store
import { File } from 'lucide-vue-next';

const BACKEND_BASE = import.meta.env.VITE_API_URL;

const router = useRouter();
const alert = useAlertStore();

const templates = ref([]);
const isDeleteModalOpen = ref(false);
const selectedTemplate = ref(null);

const showCategoryModal = ref(false);
const showCollectionModal = ref(false);
const newCategory = ref('');
const newCollection = ref('');
const categories = ref([]);
const collections = ref([]);

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

const error = ref(''); // For file upload errors

const checkAuth = async () => {
  try {
    const res = await fetch(`${BACKEND_BASE}/api/check-admin-session`, {
      credentials: "include",
    });
    if (!res.ok) {
      if (res.status === 401) {
        alert.show('Session expired. Please login again.', 'error');
        router.push('/admin/login');
      } else {
        const msg = `Auth check failed with status: ${res.status}`;
        alert.show(msg, 'error');
        throw new Error(msg);
      }
    }
  } catch (err) {
    alert.show('Admin authentication error. Redirecting...', 'error');
    router.push('/admin/login');
  }
};

const fetchTemplates = async () => {
  try {
    const res = await fetch(`${BACKEND_BASE}/api/admin/templates`, {
      credentials: "include",
    });
    if (res.ok) {
      const data = await res.json();
      templates.value = data;
    } else {
      alert.show('Failed to fetch templates.', 'error');
    }
  } catch (err) {
    alert.show('Error fetching templates.', 'error');
  }
};

// Delete Template
const deleteTemplate = async (id) => {
  try {
    const res = await fetch(`${BACKEND_BASE}/api/admin/templates/${id}`, {
      credentials: "include",
    });
    if (!res.ok) {
      alert.show('Template not found.', 'error');
      throw new Error('Template not found');
    }
    selectedTemplate.value = await res.json();
    isDeleteModalOpen.value = true;
  } catch (err) {
    alert.show('Error fetching template to delete.', 'error');
  }
};

const confirmDelete = async () => {
  const csrfToken = await fetchCsrfToken();
  try {
    const res = await fetch(`${BACKEND_BASE}/api/admin/templates/${selectedTemplate.value.id}`, {
      method: "DELETE",
      credentials: "include",
      headers: {
        "X-CSRFToken": csrfToken,
      },
    });
    if (!res.ok) {
      alert.show('Delete failed.', 'error');
      throw new Error('Delete failed');
    }
    templates.value = templates.value.filter(u => u.id !== selectedTemplate.value.id);
    isDeleteModalOpen.value = false;
    alert.show('Template deleted successfully.', 'success');
  } catch (err) {
    alert.show('Error deleting template.', 'error');
  }
};

const fetchCategories = async () => {
  try {
    const res = await fetch(`${BACKEND_BASE}/api/template-categories`);
    if (!res.ok) throw new Error('Failed to fetch categories');
    const data = await res.json();
    categories.value = data.categories;
  } catch {
    alert.show('Failed to load categories.', 'error');
  }
};

const fetchCollections = async () => {
  try {
    const res = await fetch(`${BACKEND_BASE}/api/template-collections`);
    if (!res.ok) throw new Error('Failed to fetch collections');
    const data = await res.json();
    collections.value = data.collections;
  } catch {
    alert.show('Failed to load collections.', 'error');
  }
};

const submitCategory = async () => {
  if (!newCategory.value.trim()) {
    alert.show('Category name cannot be empty.', 'error');
    return;
  }
  const csrfToken = await fetchCsrfToken();
  try {
    const res = await fetch(`${BACKEND_BASE}/api/template-categories`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': csrfToken
      },
      credentials: 'include',
      body: JSON.stringify({ category: newCategory.value.trim() })
    });
    if (!res.ok) throw new Error('Failed to add category');
    await fetchCategories();
    newCategory.value = '';
    showCategoryModal.value = false;
    alert.show('Category added successfully.', 'success');
  } catch {
    alert.show('Failed to add category.', 'error');
  }
};

const submitCollection = async () => {
  if (!newCollection.value.trim()) {
    alert.show('Collection name cannot be empty.', 'error');
    return;
  }
  const csrfToken = await fetchCsrfToken();
  try {
    const res = await fetch(`${BACKEND_BASE}/api/template-collections`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': csrfToken
      },
      credentials: 'include',
      body: JSON.stringify({ collection: newCollection.value.trim() })
    });
    if (!res.ok) throw new Error('Failed to add collection');
    await fetchCollections();
    newCollection.value = '';
    showCollectionModal.value = false;
    alert.show('Collection added successfully.', 'success');
  } catch {
    alert.show('Failed to add collection.', 'error');
  }
};

const isEditModalOpen = ref(false);
const editing = ref(true);

const editTemplate = async (id) => {
  try {
    const res = await fetch(`${BACKEND_BASE}/api/admin/templates/${id}`, {
      credentials: "include",
    });
    if (!res.ok) {
      alert.show('Template not found.', 'error');
      throw new Error('Template not found');
    }
    selectedTemplate.value = await res.json();
    isEditModalOpen.value = true;
  } catch {
    alert.show('Error fetching template for edit.', 'error');
  }
};

const submitEdit = async () => {
  const csrfToken = await fetchCsrfToken();
  try {
    const data = new FormData();
    data.append('name', selectedTemplate.value.name);
    data.append('pageType', selectedTemplate.value.page_type);
    data.append('category', selectedTemplate.value.category);
    data.append('price', selectedTemplate.value.price);
    data.append('collection', selectedTemplate.value.collection);
    data.append('swatchColor', selectedTemplate.value.swatchColor);
    data.append('description', selectedTemplate.value.description);
    if (selectedTemplate.value.zip) data.append('file', selectedTemplate.value.zip);
    if (selectedTemplate.value.thumbnail) data.append('thumbnail', selectedTemplate.value.thumbnail);

    const res = await fetch(`${BACKEND_BASE}/api/admin/templates/${selectedTemplate.value.id}`, {
      method: "PUT",
      headers: {
        "X-CSRFToken": csrfToken,
      },
      credentials: "include",
      body: data,
    });

    if (!res.ok) {
      alert.show('Update failed.', 'error');
      throw new Error('Update failed');
    }
    await fetchTemplates();
    editing.value = false;
    alert.show('Template updated successfully.', 'success');
    isEditModalOpen.value = false;
  } catch {
    alert.show('Error updating template.', 'error');
  }
};

const searchQuery = ref('');

const filteredTemplates = computed(() => {
  const q = searchQuery.value.toLowerCase();
  return templates.value.filter(template =>
    template.name.toLowerCase().includes(q) ||
    (template.page_type?.toString() || '').toLowerCase().includes(q) ||
    (template.category?.toString() || '').toLowerCase().includes(q) ||
    (template.collection?.toString() || '').toLowerCase().includes(q)
  );
});

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
    error.value = 'No ZIP file selected.';
    selectedTemplate.value.zip = null;
    alert.show(error.value, 'error');
    return;
  }
  const isZip = file.type === 'application/zip' || file.name.endsWith('.zip');
  if (isZip) {
    selectedTemplate.value.zip = file;
    error.value = '';
  } else {
    error.value = 'Please select a valid ZIP file.';
    selectedTemplate.value.zip = null;
    alert.show(error.value, 'error');
  }
};

const handleThumbnailUpload = (event) => {
  const file = event.target.files[0];
  if (!file) {
    error.value = 'No thumbnail selected.';
    selectedTemplate.value.thumbnail = null;
    alert.show(error.value, 'error');
    return;
  }
  const isPng = file.type === 'image/png' || file.name.endsWith('.png');
  if (isPng) {
    selectedTemplate.value.thumbnail = file;
    error.value = '';
  } else {
    error.value = 'Thumbnail must be a .png file.';
    selectedTemplate.value.thumbnail = null;
    alert.show(error.value, 'error');
  }
};

onMounted(async () => {
  await checkAuth();
  await fetchCategories();
  await fetchCollections();
  await fetchTemplates();
});
</script>



<template>

  <!-- Category Modal -->

  <div v-if="showCategoryModal" class="modal">
    <div class="modal-content">
      <h2>Add New Category</h2>
      <input v-model="newCategory" placeholder="Enter category name" />
      <div class="modal-actions">
        <button @click="submitCategory" class="action-btn edit">Add</button>
        <button @click="showCategoryModal = false" class="action-btn btn-cancel">Cancel</button>
      </div>
    </div>
  </div>

  <!-- Collection Modal -->

  <div v-if="showCollectionModal" class="modal">
    <div class="modal-content">
      <h2>Add New Collection</h2>
      <input v-model="newCollection" placeholder="Enter collection name" />
      <div class="modal-actions">
        <button @click="submitCollection" class="action-btn edit">Add</button>
        <button @click="showCollectionModal = false" class="action-btn btn-cancel">Cancel</button>
      </div>
    </div>
  </div>


  <!-- Edit Modal  -->
  <div v-if="isEditModalOpen" class="modal">
    <div class="modal-content">
      <h2>Edit Template</h2>
      <form v-if="editing" @submit.prevent="submitEdit">
        <div class="form-group page-type-group">
          <label>Page Type</label>
          <div class="page-type-options">
            <button type="button" :class="{ active: selectedTemplate.page_type === 'one' }"
              @click="selectedTemplate.page_type = 'one'">One Page</button>
            <button type="button" :class="{ active: selectedTemplate.page_type === 'multi' }"
              @click="selectedTemplate.page_type = 'multi'">Multi Page</button>
          </div>
        </div>

        <div class="form-group">
          <label for="templateDescription">Price:</label>
          <input type="number" id="templatePrice" v-model="selectedTemplate.price"
            placeholder="Price/day for the template"></input>
        </div>

        <!-- Category Dropdown -->
        <div class="form-group">
          <label for="category">Category</label>
          <div class="input-group">
            <select id="category" v-model="selectedTemplate.category">
              <option v-for="cat in categories" :key="cat.id" :value="cat.category">{{ cat.category }}</option>
            </select>
            <button type="button" class="small-btn"
              @click="showCategoryModal = true, isEditModalOpen = false">+</button>
          </div>
        </div>

        <!-- Collection Dropdown -->
        <div class="form-group">
          <label for="collection">Collection</label>
          <div class="input-group">
            <select id="collection" v-model="selectedTemplate.collection">
              <option v-for="col in collections" :key="col.id" :value="col.collection">{{ col.collection }}</option>
            </select>
            <button type="button" class="small-btn"
              @click="showCollectionModal = true, isEditModalOpen = false">+</button>
          </div>
        </div>





        <!-- Color Swatches -->
        <div class="form-group color-swatches">
          <label>Color Theme</label>
          <div class="swatch-list">
            <span v-for="(swatch, idx) in swatchColors" :key="idx" :style="{ backgroundColor: swatch }"
              :class="{ swatch: true, selected: selectedTemplate.swatchColor === swatch }"
              @click="selectedTemplate.swatchColor = swatch"></span>
          </div>
        </div>

        <!-- Template Description -->
        <div class="form-group">
          <label for="templateDescription">Description:</label>
          <textarea minlength="200" id="templateDescription" v-model="selectedTemplate.description"
            placeholder="Add template description" rows="3"></textarea>
        </div>
        <!-- Thumbnail Image -->
          <div class="form-group">
            <label for="thumbnail">Thumbnail Image (.png):</label>
            <input type="file" id="thumbnail" accept=".png" @change="handleThumbnailUpload" >
            <div class="file-details" v-if="selectedTemplate.thumbnail">
              Selected image: {{ selectedTemplate.thumbnail.name }} ({{ formatFileSize(selectedTemplate.thumbnail.size) }})
            </div>
          </div>
        <!-- Template ZIP File -->
          <div class="form-group">
            <label for="zipFile">Template ZIP:</label>
            <input type="file" id="zipFile" accept=".zip" @change="handleFileUpload" >
            <div class="file-details" v-if="selectedTemplate.zip">
              Selected file: {{ selectedTemplate.zip.name }} ({{ formatFileSize(selectedTemplate.zip.size) }})
            </div>
          </div>

        <button @click="isEditModalOpen = false" type="button" class="action-btn btn-cancel">Cancel</button>
        <button type="submit" class="action-btn edit">Save Edit</button>


      </form>
      <p v-if="!editing">Succesfully Edited</p>
      <button v-if="!editing" @click="isEditModalOpen = false, editing = true" type="button"
        class="action-btn btn-close">Close</button>

    </div>
  </div>

  <div v-if="isDeleteModalOpen" class="modal">
    <div class="modal-content">
      <h2>Confirm Deletion</h2>
      <p>Are you sure you want to delete <strong>{{ selectedTemplate?.name }}</strong>?</p>
      <button @click="isDeleteModalOpen = false" class="action-btn btn-cancel">Cancel</button>
      <button @click="confirmDelete" class="action-btn delete-btn">Yes, Delete</button>
    </div>
  </div>

  <AdminSidebar />
  <div class="admin-dashboard">
    <main class="admin-main-content">
      <div class="header">
        <div class="header-logo">
          <File class='icon' />
          <h1>Templates Management</h1>
        </div>
      </div>
      <div class="user-controls">
        <input v-model="searchQuery" type="text" placeholder="Search by Page Name or User ID" class="search-input" />
      </div>

      <div class="template-table-container">
        <table class="template-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Template Name</th>
              <th>Page Type</th>
              <th>Price</th>
              <th>Category</th>
              <th>Collection</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="template in filteredTemplates" :key="template.id">
              <td>{{ template.id }}</td>
              <td>{{ template.name }}</td>
              <td>{{ template.page_type }}</td>
              <td>{{ template.price }}</td>
              <td>{{ template.category }}</td>
              <td>{{ template.collection }}</td>
              <td>
                <button class="view-btn" @click="router.push(`/TemplatePreview/${template.name}`)">View</button>
                <button class="action-btn edit" @click="editTemplate(template.id)">Edit</button>
                <button class="delete-btn" @click="deleteTemplate(template.id)">Delete</button>
              </td>
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

.header {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 1px solid rgb(184, 177, 177);
}

.header-logo {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-start;
}

.icon {
  width: 36px;
  height: auto;
  margin-right: 8px;
}

h1 {
  color: #222f3e;
  font-size: 32px;
  font-weight: 700;
  margin-bottom: 8px;
  letter-spacing: 0.03em;
}

p {
  color: #555;
  font-size: 1rem;
  line-height: 1.6;
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
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  overflow: hidden;
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
  font-weight: 600;
}

.template-table tbody tr:hover {
  background-color: #f9fafb;
}

.action-btn,
.view-btn,
.delete-btn {
  font-weight: 600;
  border: none;
  border-radius: 10px;
  padding: 9px 20px;
  cursor: pointer;
  color: white;
  font-size: 14px;
  width: auto;
  margin-right: 8px;
  box-shadow: 0 4px 12px rgb(0 0 0 / 0.1);
  transition: background-color 0.3s ease, transform 0.15s ease, box-shadow 0.3s ease;
}

.view-btn {
  background: linear-gradient(135deg, #1dd1a1, #10ac84);
  box-shadow: 0 4px 12px #10ac84aa;
}

.action-btn.edit {
  background: linear-gradient(135deg, #ffa502, #ff7f50);
  box-shadow: 0 4px 12px #ff7f50aa;
}

.delete-btn {
  background: linear-gradient(135deg, #ff4757, #c0392b);
  box-shadow: 0 4px 12px #c0392baa;
}

.action-btn:hover,
.view-btn:hover,
.delete-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgb(0 0 0 / 0.15);
  outline: none;
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

/* Modal Styles */
.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  animation: fadeIn 0.3s ease-in-out;
}

.modal-content {
  background: #fff;
  padding: 32px 30px;
  border-radius: 16px;
  width: 100%;
  max-width: 500px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  animation: scaleIn 0.3s ease-in-out;
  color: #333;
  max-height: 90vh;
  overflow-y: auto;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}

@keyframes scaleIn {
  from {
    transform: scale(0.95);
    opacity: 0;
  }

  to {
    transform: scale(1);
    opacity: 1;
  }
}

.modal-content form label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #2c3e50;
}

.modal-content input,
.modal-content select,
.modal-content textarea {
  width: 100%;
  padding: 10px 14px;
  border: 1px solid #ccc;
  border-radius: 8px;
  font-size: 15px;
  /* margin-top: 6px; */
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
  resize: vertical;
}

.modal-content input:focus,
.modal-content select:focus,
.modal-content textarea:focus {
  border-color: #3a6073;
  box-shadow: 0 0 0 3px rgba(58, 96, 115, 0.2);
  outline: none;
}

.modal-actions {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.page-type-group {
  margin-bottom: 15px;
}

.page-type-options button {
  background: #f1f1f1;
  border: none;
  padding: 8px 14px;
  margin-right: 8px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  color: #555;
  transition: background-color 0.25s ease;
}

.page-type-options button.active,
.page-type-options button:hover {
  background-color: #3a6073;
  color: #fff;
}

.input-group {
  display: flex;
  gap: 10px;
  justify-content: center;
  align-items: center;
}

.small-btn {
  background: linear-gradient(to bottom, #3a6073, #16222a);
  border: none;
  color: white;
  padding: 8px 12px;
  font-size: 0.85rem;
  border-radius: 6px;
  cursor: pointer;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
  transition: background-color 0.2s ease;
}

.small-btn:hover {
  background-color: #25404b;
}

/* Color Swatches */
.color-swatches .swatch-list {
  display: flex;
  gap: 0.6rem;
  margin-top: 6px;
}

.swatch {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: 2px solid #e5e7eb;
  cursor: pointer;
  transition: border 0.18s ease;
  display: inline-block;
}

.swatch.selected {
  border: 3px solid #ec4899;
  box-shadow: 1px 3px 10px 2px rgba(236, 72, 153, 0.5);
}

/* Modal buttons */
.btn-close {
  background: #57606f;
  box-shadow: 0 4px 12px #57606faa;
  color: #fff;
}

.btn-close:hover,
.btn-close:focus {
  background: #3d4451;
}

.btn-cancel {
  background: #aaaeb3;
  box-shadow: 0 4px 12px #aaaeb3aa;
  color: #222f3e;
}

.btn-cancel:hover,
.btn-cancel:focus {
  background: #858a92;
}

.btn-save {
  background: #3742fa;
  box-shadow: 0 4px 12px #3742faaa;
  color: white;
}

.btn-save:hover,
.btn-save:focus {
  background: #2a33c7;
}

.user-controls {
  margin-bottom: 28px;
  max-width: 100%;
  width: 100%;
}

.user-controls input {
  width: 100%;
  padding: 12px 16px;
  font-size: 16px;
  border: 1.8px solid #ced6e0;
  border-radius: 12px;
  box-shadow: inset 0 2px 5px rgb(0 0 0 / 0.03);
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
}

.user-controls input:focus {
  border-color: #e3e4f3;
  box-shadow: 0 0 8px rgba(55, 66, 250, 0.4);
  outline: none;
}
</style>
