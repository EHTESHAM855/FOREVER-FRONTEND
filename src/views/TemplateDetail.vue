<script setup>
import { ref, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';

const BACKEND_BASE = import.meta.env.VITE_API_URL;
const route = useRoute();
const templateId = ref(route.params.template_id);

const template = ref(null);
const similarTemplates = ref([]);
const recommendedTemplates = ref([]);

async function fetchTemplateDetails(id) {
    try {
        const res = await fetch(`${BACKEND_BASE}/template/${id}`, { credentials: 'include' });
        const data = await res.json();
        template.value = data;

        if (data.collection_id) {
            await fetchSimilarTemplates(data.collection_id, id);
        }

        if (data.category_id) {
            await fetchRecommendedTemplates(data.category_id, id);
        }

    } catch (err) {
        console.error('Error fetching template details:', err);
    }
}

async function fetchSimilarTemplates(collectionId, currentId) {
    try {
        const res = await fetch(`${BACKEND_BASE}/templates/collection/${collectionId}`, { credentials: 'include' });
        const data = await res.json();
        similarTemplates.value = data.filter(t => t.id !== Number(currentId));
    } catch (err) {
        console.error('Error fetching similar templates:', err);
    }
}

async function fetchRecommendedTemplates(categoryId, currentId) {
    try {
        const res = await fetch(`${BACKEND_BASE}/templates/category/${categoryId}`, { credentials: 'include' });
        const data = await res.json();
        recommendedTemplates.value = data.filter(t => t.id !== Number(currentId));
    } catch (err) {
        console.error('Error fetching recommended templates:', err);
    }
}

async function loadData() {
    await fetchTemplateDetails(templateId.value);
}

// Initial load
onMounted(() => {
    loadData();
});

// Re-fetch when route param changes
watch(() => route.params.template_id, (newId) => {
    templateId.value = newId;
    loadData();
});
</script>



<template>
    <div v-if="template" class="page-wrapper">
        <section class="template-details">
            <div class="image-container">
                <img :src="`${BACKEND_BASE}/${template.image_url}`" alt="Template preview" class="hero-image" />
            </div>
            <div class="meta-container">
                <h1 class="template-title">{{ template.name }}</h1>
                <p class="template-description">{{ template.description || 'Explore this beautifully crafted Template' }}
                </p>
                <div class="details-container">
                    <div class="det-item">
                        <span class="det-item-label">Category </span>
                        <span class="det-item-value">{{ template.category }}</span>
                    </div>
                    <div class="det-item">
                        <span class="det-item-label">Collection </span>
                        <span class="det-item-value">{{ template.collection }}</span>
                    </div>
                    <div class="det-item">
                        <span class="det-item-label">Page Type </span>
                        <span class="det-item-value">{{ template.page_type }}</span>
                    </div>
                    <div class="det-item">
                        <span class="det-item-label">Color Theme </span>
                        <div class="color-swatch" :style="{ backgroundColor: template.swatchColor }"></div>
                    </div>
                </div>
                <div class="purchase-container">
                    <div class="price-box">
                        <span class="price-laber">Cost/Day </span>
                        <p class="template-price">₹{{ template.price }}</p>
                    </div>
                    <div class="btns">
                    <router-link :to="`/TemplatePreview/${template.name}`" class="button-action preview">Preview</router-link>
                    <router-link :to="`/customize/${template.name}`" class="button-action customize">Customize Now</router-link></div>

                </div>
            </div>
        </section>
        <section class="similar-container" v-if="similarTemplates.length">
            <div class="section-header">
                <h2>Similar Templates in {{ template.collection }}</h2>
            </div>
            <div class="carousel">
                <div v-for="item in similarTemplates" :key="item.id" class="carousel-card">
                    <img :src="`${BACKEND_BASE}/${item.image_url}`" alt="" class="card-image" />
                    <div class="card-overlay">
                        <router-link :to="`/template/${item.id}`" class="card-link">
                            Know More
                        </router-link>
                    </div>
                    <h3 class="card-title">{{ item.name }}</h3>
                </div>
            </div>
        </section>
        <section v-if="recommendedTemplates.length" class="recomended-container">
            <div class="section-header">
                <h2>More in {{ template.category }}</h2>
            </div>
            <div class="carousel">
                <div v-for="item in recommendedTemplates" :key="item.id" class="carousel-card">
                    <img :src="`${BACKEND_BASE}/${item.image_url}`" alt="" class="card-image" />
                    <div class="card-overlay">
                        <router-link :to="`/template/${item.id}`" class="card-link">
                            Know More
                        </router-link>
                    </div>
                    <h3 class="card-title">{{ item.name }}</h3>
                </div>
            </div>
        </section>
    </div>
</template>



<style scoped>

.page-wrapper {
  padding: 2rem;
  max-width: 100%;
  height: auto;
  background-color: white;
  display: flex;
  justify-content: center;
  flex-direction: column;
  margin: auto;
  align-items: center;
  font-family: 'Segoe UI', sans-serif;
  color: #333;
}

.template-details {
  display: flex;
  flex-wrap: wrap;
  gap: 3rem;
  max-width: 1600px;
  background: #fff;
  border-radius: 20px;
  padding: 2rem;
  margin-bottom: 3rem;
}

.image-container {
  flex: 1 1 400px;
  max-width: 700px;
  border-radius: 16px;
  overflow: hidden;
  padding: 2rem;

}

.hero-image {
  width: 100%;
  border-radius: 16px;
  object-fit: cover;
  transition: transform 0.4s ease;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);

}

.hero-image:hover {
  transform: scale(1.02);
}

.meta-container {
  flex: 1 1 300px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.template-title {
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 1rem;
}

.template-description {
  font-size: 1.1rem;
  margin-bottom: 2rem;
  line-height: 1.6;
}

.details-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem 2rem;
  margin-bottom: 2rem;
}

.det-item-label {
  font-weight: 600;
  font-size: 0.9rem;
  color: #777;
}

.det-item-value {
  font-size: 1rem;
  margin-top: 0.3rem;
}

.color-swatch {
  width: 25px;
  height: 25px;
  border-radius: 50%;
  border: 1px solid #ccc;
  margin-top: 0.3rem;
}

.purchase-container {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.btns{
    display: flex;
    flex-direction: row;
    gap: 15px;
    margin-right: 0;
    margin-left: auto;
}

.price-box {
  text-align: center;
}

.price-laber {
  font-weight: 500;
  color: #888;
}

.template-price {
  font-size: 1.5rem;
  font-weight: bold;
  color: #333;
}

.button-action {
  padding: 0.6rem 1.2rem;
  border-radius: 10px;
  text-decoration: none;
  font-weight: 600;
  transition: background 0.3s ease;
}

.preview {
  background: linear-gradient(to right, #f7b42c, #fc575e);
  color: white;
}

.customize {
  background: linear-gradient(to right, #36d1dc, #5b86e5);
  color: white;
}

.button-action:hover {
  opacity: 0.9;
}
.similar-container, .recomended-container{
    display: flex;
    align-items: flex-start;
    flex-direction: column;
    width: 100%;
    margin: 20px 0;
    padding: 10px;
}
.section-header h2 {
  font-size: 1.8rem;
  margin-bottom: 1rem;
  font-weight: bold;
}

.carousel {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  gap: 1.5rem;
}

.carousel-card {
  position: relative;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
  background: white;
}

.carousel-card:hover {
  transform: translateY(-5px);
}

.card-image {
  width: 100%;
  height: 180px;
  object-fit: cover;
}

.card-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  opacity: 0;
  transition: opacity 0.3s ease;
  display: flex;
  justify-content: center;
  align-items: center;
}

.carousel-card:hover .card-overlay {
  opacity: 1;
}

.card-link {
  background: white;
  color: #333;
  padding: 0.4rem 1rem;
  border-radius: 8px;
  font-weight: 600;
  text-decoration: none;
}

.card-title {
  text-align: center;
  font-size: 1.1rem;
  padding: 0.8rem 0;
  font-weight: 600;
}

/* Responsive Adjustments */
@media (max-width: 768px) {
  .template-details {
    flex-direction: column;
  }

  .details-container {
    grid-template-columns: 1fr;
  }

  .purchase-container {
    flex-direction: column;
    align-items: flex-start;
  }
}

</style>
