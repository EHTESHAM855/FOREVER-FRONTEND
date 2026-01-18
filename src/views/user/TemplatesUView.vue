<template>
      <!-- All Templates List -->
      <div class="template-wrapper">
        <div class="header">
          <h1>Templates</h1>
        </div>
        <alltemplates />
      </div>
</template>

<script setup>
import alltemplates from '@/components/templates.vue'
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Dancing+Script:wght@600&display=swap');


.header h1 {
    font-family: 'Cormorant Garamond', serif;
    font-size: 3rem;
    /* margin-bottom: 1.5rem; */
    color: var(--text);
    border-bottom: 1px solid rgb(217, 217, 217);
    padding-bottom: 20px;
    text-shadow: 2px 2px 4px rgba(0,0,0,0.1);
}

.subtitle {
  font-size: 1rem;
  color: #555;
}

/* Templates Section */
.template-wrapper {
  flex: 1;
  background: white;
  /* padding: 30px; */
  /* border-radius: 16px; */
  /* box-shadow: 0 6px 20px rgba(235, 143, 178, 0.2); */
  transition: all 0.3s ease;
}

.template-card:hover {
  box-shadow: 0 12px 24px rgba(240, 145, 220, 0.52);
  transform: translateY(-4px);
}
@media (max-width: 700px) {
  .template-wrapper{
    padding: 0;
  }
}
</style>
