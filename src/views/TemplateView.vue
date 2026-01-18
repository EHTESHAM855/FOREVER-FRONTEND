<script setup>
import { ref, computed, onMounted } from 'vue';
import alltemplates from '@/components/templates.vue';
const BACKEND_BASE = import.meta.env.VITE_API_URL


const visibleCount = ref(6)

const visibleTemplates = computed(() => {
  return filteredTemplates.value.slice(0, visibleCount.value)
})

function loadMore() {
  visibleCount.value += 6
}
</script>

<template>
    <section class="hero">
        <div class="container">
            <div class="hero-content">
                <h2>Free Wedding Website Designs</h2>
                <h1>Thousands of design combinations.</h1>
                <p>Create the perfect look. Mix and match layouts, themes, fonts, colors, and photos to design your own
                    wedding website template in minutes. You can change any part of your design at any time.</p>
                <a href="#filters" class="btn-primary">Start Customizing Your Website</a>
            </div>
            <div class="hero-image">
                <img src="https://sjc.microlink.io/KXNfUpbxEi-NT7zrTcrJvmnwAPG65HG47eMqiDwXloTb3IsGp3FsNlyFTzxBCWiG2TgeXmy4sqxBpYYlHS2hRQ.jpeg"
                    alt="Wedding website template example" />
            </div>
        </div>
        <div class="flower flower-1"></div>
        <div class="flower flower-2"></div>
        <div class="circle circle-1"></div>
    </section>

    <alltemplates />

    <section class="features" id="features">
        <div class="container">
            <h2>Everything you need for your special day</h2>
            <div class="feature-grid">
                <div class="feature-card">
                    <div class="feature-icon heart-icon"></div>
                    <h3>Beautiful Templates</h3>
                    <p>Choose from our collection of stunning, customizable designs.</p>
                </div>
                <div class="feature-card">
                    <div class="feature-icon checklist-icon"></div>
                    <h3>Easy Planning</h3>
                    <p>Manage RSVPs, registries, and guest information effortlessly.</p>
                </div>
                <div class="feature-card">
                    <div class="feature-icon mobile-icon"></div>
                    <h3>Mobile Friendly</h3>
                    <p>Your website looks perfect on any device.</p>
                </div>
            </div>
        </div>
        <div class="flower flower-3"></div>
        <div class="circle circle-2"></div>
    </section>
</template>

<style scoped>
.hero {
    padding: 80px 0;
    position: relative;
    overflow: hidden;
  }
  .hero .container {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 40px;
    align-items: center;
  }
  .hero-content {
    max-width: 600px;
  }
  .hero-content h2 {
    color: var(--accent-color);
    font-size: 1.2rem;
    margin-bottom: 10px;
  }
  .hero-content h1 {
    margin-bottom: 20px;
  }
  .hero-image {
    position: relative;
    z-index: 1;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  }



  

</style>
