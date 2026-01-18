<script setup>
import { ref, computed, onMounted } from 'vue';
import { useAlertStore } from '@/stores/alert';

const BACKEND_BASE = import.meta.env.VITE_API_URL;
const alert = useAlertStore();

const templates = ref([]);
const allowedFiltersdata = ref([]);

const filters = ref({
  pageType: '',
  category: '',
  collection: '',
  swatchColor: ''
});

const allowedFilters = computed(() => ({
  Layouts: ['one', 'multi'],
  Category: allowedFiltersdata.value.category || [],
  Collection: allowedFiltersdata.value.collection || [],
  Color: [
    '#374151', '#f87171', '#fb923c', '#fde68a',
    '#34d399', '#60a5fa', '#a78bfa', '#f472b6',
    '#a3a3a3', '#78350f'
  ]
}));

const filterOptions = computed(() => ({
  Layouts: allowedFilters.value.Layouts,
  Category: allowedFilters.value.Category,
  Collection: allowedFilters.value.Collection,
  Color: allowedFilters.value.Color
}));

const filteredTemplates = computed(() =>
  templates.value.filter(t =>
    (!filters.value.pageType || t.page_type === filters.value.pageType) &&
    (!filters.value.category || t.category === filters.value.category) &&
    (!filters.value.collection || t.collection === filters.value.collection) &&
    (!filters.value.swatchColor || t.swatchColor === filters.value.swatchColor)
  )
);

const visibleCount = ref(4);
const visibleTemplates = computed(() =>
  filteredTemplates.value.slice(0, visibleCount.value)
);

const loadMore = () => {
  visibleCount.value += 8;
};

const showColorDropdown = ref(false);
const toggleColorDropdown = () => {
  showColorDropdown.value = !showColorDropdown.value;
};
const selectColor = (color) => {
  filters.value.swatchColor = color;
  showColorDropdown.value = false;
};

onMounted(async () => {
  try {
    const [templatesRes, filtersRes] = await Promise.all([
      fetch(`${BACKEND_BASE}/template_data`),
      fetch(`${BACKEND_BASE}/api/filter-list`, { credentials: 'include' })
    ]);

    if (!templatesRes.ok || !filtersRes.ok) {
      throw new Error('Failed to fetch template/filter data.');
    }

    templates.value = await templatesRes.json();
    allowedFiltersdata.value = await filtersRes.json();
  } catch (err) {
    alert.show('Failed to load templates or filters. Please try again later.', 'error');
  }
});
</script>


<template>
    <section class="filters" id="filters">
        <div class="container dropdown-filters" style="width: auto;">
            <select v-model="filters.pageType">
                <option value="">All Layouts</option>
                <option v-for="layout in filterOptions.Layouts" :key="layout" :value="layout">
                    {{ layout === 'one' ? 'One Page' : 'Multi Page' }}
                </option>
            </select>

            <select v-model="filters.category">
                <option value="">All Categories</option>
                <option v-for="cat in filterOptions.Category" :key="cat" :value="cat">{{ cat }}</option>
            </select>

            <select v-model="filters.collection">
                <option value="">All Collections</option>
                <option v-for="col in filterOptions.Collection" :key="col" :value="col">{{ col }}</option>
            </select>

            <!-- Color Filter Dropdown -->
            <div class="custom-dropdown" @click="toggleColorDropdown">
                <div class="selected-color" :style="{
                    backgroundColor: filters.swatchColor || '#f9f9f9',
                    border: filters.swatchColor ? 'none' : '1px dashed #aaa'
                }">
                    <span v-if="filters.swatchColor" class="color-swatch-indicator"></span>
                    <span>{{ filters.swatchColor ? '' : 'Select Color' }}</span>
                </div>
                <div v-if="showColorDropdown" class="dropdown-options">
                    <div class="dropdown-swatch reset" @click.stop="selectColor('')" title="Clear selection">
                        ×
                    </div>
                    <div v-for="color in filterOptions.Color" :key="color" class="dropdown-swatch"
                        :style="{ backgroundColor: color, border: color === filters.swatchColor ? '2px solid #444' : '1px solid #ccc' }"
                        @click.stop="selectColor(color)"></div>
                </div>
            </div>

        </div>
    </section>

    <section class="templates" id="template_sec">
        <div class="container" style="padding: 0 20px;">
            <div class="template-grid">
                <router-link v-for="template in visibleTemplates" :key="template.id"
                    :to="{ name: 'TemplateDetails', params: { template_id: template.id } }" class="template-card-link">
                    <div class="template-card">
                        <div class="template-image">
                            <img :src="`${BACKEND_BASE}/${template.image_url}`" :alt="template.name" />
                        </div>
                        <h3>{{ template.name }} (₹{{ template.price }})</h3>
                    </div>
                </router-link>
            </div>
        </div>

        <div class="explore-more">
            <button class="buton" @click="loadMore" :disabled="visibleTemplates.length >= filteredTemplates.length">
                {{ visibleTemplates.length >= filteredTemplates.length ? 'No More Templates' : 'More Templates' }}
            </button>
        </div>
    </section>
</template>

<style scoped>
.filters {
  padding: 2rem 0;
  background-color: white;
}

.dropdown-filters {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 1rem;
}

.dropdown-filters select {
  min-width: 160px;
  padding: 0.6rem 1rem;
  border-radius: 10px;
  border: 1px solid #ccc;
  background-color: #fff;
  font-size: 1rem;
  font-weight: 500;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
  transition: 0.3s ease;
  cursor: pointer;
}

.dropdown-filters select:hover,
.dropdown-filters select:focus {
  border-color: #999;
  outline: none;
}

/* Custom Color Dropdown */
.custom-dropdown {
  position: relative;
  width: 160px;
  padding: 0.6rem 1rem;
  border: 1px solid #ccc;
  border-radius: 10px;
  background: #fff;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
  cursor: pointer;
  z-index: 5;
  transition: border-color 0.3s ease;
}

.custom-dropdown:hover {
  border-color: #888;
}

.selected-color {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  height: 35px;
  border-radius: 8px;
  font-weight: 500;
  font-size: 0.95rem;
  color: #444;
}

.color-swatch-indicator {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  border: 1px solid #999;
}

.dropdown-options {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 8px;
  padding: 10px;
  border: 1px solid #ccc;
  background: #fff;
  border-radius: 10px;
  position: absolute;
  top: 100%;
  left: 0;
  width: 100%;
  z-index: 10;
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1);
}

.dropdown-swatch {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  border: 1px solid #ccc;
  cursor: pointer;
  transition: transform 0.2s ease, border-color 0.2s ease;
}

.dropdown-swatch:hover {
  transform: scale(1.1);
  border-color: #444;
}

.dropdown-swatch.reset {
  background-color: #f3f3f3;
  border: 1px dashed #999;
  color: #666;
  font-size: 18px;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
}

.dropdown-swatch.reset:hover {
  background-color: #eaeaea;
}

/* Template Grid */
.template-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 1.5rem;
  padding: 1rem 0;
}

.template-card-link {
  text-decoration: none;
  color: inherit;
}

.template-card {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
  overflow: hidden;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.template-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.1);
}

.template-image img {
  width: 100%;
  height: 220px;
  object-fit: cover;
  display: block;
}

.template-card h3 {
  padding: 0.8rem;
  font-size: 1.05rem;
  text-align: center;
  color: #333;
}

/* Explore More Button */
.explore-more {
  text-align: center;
  margin: 2rem 0;
}

.buton {
  padding: 0.75rem 1.8rem;
  border-radius: 10px;
  background-color: #ff69b4;
  color: white;
  border: none;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.buton:hover {
  background-color: #ff4c9a;
}

.buton:disabled {
  background-color: #ccc;
  color: #666;
  cursor: not-allowed;
}

/* Responsive Adjustments */
@media (max-width: 1024px) {
  .template-grid {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  }
}

@media (max-width: 768px) {
  .dropdown-filters {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
  }

  .dropdown-filters select,
  .custom-dropdown {
    width: 100%;
    max-width: 100%;
    z-index: 10;
  }

  .template-image img {
    height: 180px;
  }
  
}

@media (max-width: 480px) {
  .template-grid {
    grid-template-columns: 1fr;
  }

  .template-card {
    margin: 0 auto;
  }

  .template-image img {
    height: 160px;
  }

  .dropdown-options {
    font-size: 14px;
  }
}

</style>