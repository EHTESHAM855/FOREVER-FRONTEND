<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAlertStore } from '@/stores/alert';
import { fetchCsrfToken } from '@/utils/csrf';
import { useConfirmStore } from '@/stores/confirm'

const confirm = useConfirmStore()

const BACKEND_BASE = import.meta.env.VITE_API_URL;
const router = useRouter();
const alert = useAlertStore();

const images = ref([]);


const fetchImages = async () => {
  try {
    const res = await fetch(`${BACKEND_BASE}/api/user/images`, {
      credentials: "include"
    });
    const data = await res.json();

    if (!res.ok) {
      alert.show(data.message || "Unable to load images", "error");
    } else {
      images.value = data;
    }
  } catch (err) {
    console.error(err);
    alert.show("Unable to load images.", "error");
  }
};

const deleteImage = async (id) => {
  const confirmed = await confirm.show("Are you sure you want to delete this image?");
  if (!confirmed) return;
  if (confirmed){
const csrfToken = await fetchCsrfToken();
  try {
    const res = await fetch(`${BACKEND_BASE}/api/images/${id}`, {
      method: 'DELETE',
      credentials: "include",
      headers:{
        "X-CSRFToken":csrfToken
      }
    });
    const data = await res.json();
    if (!res.ok) {
      alert.show(data.message || "Failed to delete image", "error");
      return;
    }
    images.value = images.value.filter(img => img.id !== id);
    alert.show("Image deleted successfully", "success");
  } catch (err) {
    console.error(err);
    alert.show("Failed to delete image", "error");
  }}
};

onMounted(() => {
  fetchImages();
});
</script>

<template>
  <section class="image-gallery">
    <h1 class="title">Your Uploaded Images</h1>

    <div v-if="images.length === 0" class="empty-state">
      No images uploaded yet.
    </div>

    <div v-else class="gallery-grid">
      <div v-for="image in images" :key="image.id" class="image-card">
        <img :src="`${BACKEND_BASE}/${image.path}`" alt="Uploaded Image" />
        <button class="delete-btn" @click="deleteImage(image.id)">🗑️ Delete</button>
      </div>
    </div>
  </section>
</template>
<style scoped>

.title {
  font-family: 'Cormorant Garamond', serif;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
    font-size: 3rem;
  color: #000000;
  color: var(--text);
  border-bottom: 1px solid #ccc;
  padding-bottom: 25px;
  margin-bottom: 20px;
}


.gallery-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 20px;
}

.image-card {
  position: relative;
  overflow: hidden;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s;
}

.image-card:hover {
  transform: scale(1.02);
}

.image-card img {
  width: 100%;
  height: 200px;
  object-fit: cover;
  display: block;
  border-radius: 12px;
}

.delete-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  background-color: rgba(255, 0, 0, 0.8);
  border: none;
  color: white;
  padding: 6px 10px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  opacity: 0;
  transition: opacity 0.3s;
}

.image-card:hover .delete-btn {
  opacity: 1;
}

.empty-state {
  font-style: italic;
  color: #777;
  padding: 30px;
  text-align: center;
}
</style>