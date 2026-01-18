<script setup>

import contact from '@/components/contact.vue'

const toggleFaq = (index) => {
  faqs.value[index].open = !faqs.value[index].open
}
</script>

<template>
  <section class="contact-page">
    <div class="container">
      <h1 class="page-title">Contact Us</h1>
      <p class="page-subtitle">Have questions or need help? We're here for you.</p>
      <contact />

      
    </div>
  </section>
</template>

<style scoped>
.contact-page {
  padding: 4rem 1.5rem;
  background: #f8e7e7;
  min-height: 100vh;
}

.container {
  max-width: 960px;
  margin: auto;
  text-align: center;
}

.page-title {
  font-size: 2.5rem;
  font-weight: bold;
  color: #000000;
}

.page-subtitle {
  font-size: 1.2rem;
  color: #555;
}


</style>
