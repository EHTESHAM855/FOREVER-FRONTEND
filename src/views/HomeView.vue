<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
const BACKEND_BASE = import.meta.env.VITE_API_URL
import { ChevronDown,ChevronUp } from 'lucide-vue-next';

const templates = ref([]);

const fetchData = async () => {
  try {
    const response = await axios.get(`${BACKEND_BASE}/template_data`);
    templates.value = response.data;
  } catch (error) {
    console.error('Error fetching data:', error);
  }
};
const faqs = ref([
  {
    question: "Can I edit my template after publishing?",
    answer: "Yes, you can edit your template anytime from your dashboard and republish it.",
    open: false
  },
  {
    question: "Is there a free trial available?",
    answer: "You can explore and customize templates for free. Publishing may incur a small cost.",
    open: false
  },
  {
    question: "How secure is my data?",
    answer: "We use modern encryption and security practices to ensure your data is safe and private.",
    open: false
  },
  {
    question: "Can I cancel or delete my published template?",
    answer: "Absolutely. You can manage, unpublish, or delete any of your templates from the dashboard.",
    open: false
  }
])
const toggleFaq = (index) => {
  faqs.value[index].open = !faqs.value[index].open
}
onMounted(fetchData);
</script>


<template>
  <section class="hero">
        <div class="hero-carousel">
            <!-- Images will be added via JavaScript -->
        </div>
        <div class="hero-content">
            <h1>Share Your Love Story</h1>
            <p>Create a beautiful wedding website to share your journey, keep guests informed, and cherish memories forever.</p>
            <RouterLink to="template" class="buton">Create Your Website</RouterLink>
        </div>
        <div class="hibiscus hibiscus-top-right">
            <svg class="hibiscus-svg" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M100 20C90 20 82 28 80 38C78 28 70 20 60 20C45 20 35 30 35 45C35 65 80 95 80 95C80 95 125 65 125 45C125 30 115 20 100 20Z" fill="#FFB6C1" fill-opacity="0.8"/>
                <path d="M85 40C75 40 67 48 65 58C63 48 55 40 45 40C30 40 20 50 20 65C20 85 65 115 65 115C65 115 110 85 110 65C110 50 100 40 85 40Z" fill="#D4B5B0" fill-opacity="0.6"/>
                <path d="M115 40C105 40 97 48 95 58C93 48 85 40 75 40C60 40 50 50 50 65C50 85 95 115 95 115C95 115 140 85 140 65C140 50 130 40 115 40Z" fill="#FFB6C1" fill-opacity="0.7"/>
                <path d="M90 90L100 150L110 90" stroke="#4CAF50" stroke-width="2"/>
                <path d="M85 100C85 100 70 120 75 140" stroke="#4CAF50" stroke-width="2"/>
                <path d="M115 100C115 100 130 120 125 140" stroke="#4CAF50" stroke-width="2"/>
            </svg>
        </div>
        <div class="hibiscus hibiscus-bottom-left">
            <svg class="hibiscus-svg" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M100 20C90 20 82 28 80 38C78 28 70 20 60 20C45 20 35 30 35 45C35 65 80 95 80 95C80 95 125 65 125 45C125 30 115 20 100 20Z" fill="#FFB6C1" fill-opacity="0.8"/>
                <path d="M85 40C75 40 67 48 65 58C63 48 55 40 45 40C30 40 20 50 20 65C20 85 65 115 65 115C65 115 110 85 110 65C110 50 100 40 85 40Z" fill="#D4B5B0" fill-opacity="0.6"/>
                <path d="M115 40C105 40 97 48 95 58C93 48 85 40 75 40C60 40 50 50 50 65C50 85 95 115 95 115C95 115 140 85 140 65C140 50 130 40 115 40Z" fill="#FFB6C1" fill-opacity="0.7"/>
                <path d="M90 90L100 150L110 90" stroke="#4CAF50" stroke-width="2"/>
                <path d="M85 100C85 100 70 120 75 140" stroke="#4CAF50" stroke-width="2"/>
                <path d="M115 100C115 100 130 120 125 140" stroke="#4CAF50" stroke-width="2"/>
            </svg>
        </div>
    </section>

    <section class="features" id="features">
        <div class="features-heading">
            <h2>Create Your Perfect Wedding Website</h2>
            <p style="margin-bottom: 25px;">Everything you need to celebrate your special day, all in one place</p>
        </div>
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
        <div class="hibiscus hibiscus-top-right">
            <svg class="hibiscus-svg" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M100 20C90 20 82 28 80 38C78 28 70 20 60 20C45 20 35 30 35 45C35 65 80 95 80 95C80 95 125 65 125 45C125 30 115 20 100 20Z" fill="#FFB6C1" fill-opacity="0.8"/>
                <path d="M85 40C75 40 67 48 65 58C63 48 55 40 45 40C30 40 20 50 20 65C20 85 65 115 65 115C65 115 110 85 110 65C110 50 100 40 85 40Z" fill="#D4B5B0" fill-opacity="0.6"/>
                <path d="M115 40C105 40 97 48 95 58C93 48 85 40 75 40C60 40 50 50 50 65C50 85 95 115 95 115C95 115 140 85 140 65C140 50 130 40 115 40Z" fill="#FFB6C1" fill-opacity="0.7"/>
                <path d="M90 90L100 150L110 90" stroke="#4CAF50" stroke-width="2"/>
                <path d="M85 100C85 100 70 120 75 140" stroke="#4CAF50" stroke-width="2"/>
                <path d="M115 100C115 100 130 120 125 140" stroke="#4CAF50" stroke-width="2"/>
            </svg>
        </div>
        <div class="hibiscus hibiscus-bottom-left">
            <svg class="hibiscus-svg" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M100 20C90 20 82 28 80 38C78 28 70 20 60 20C45 20 35 30 35 45C35 65 80 95 80 95C80 95 125 65 125 45C125 30 115 20 100 20Z" fill="#FFB6C1" fill-opacity="0.8"/>
                <path d="M85 40C75 40 67 48 65 58C63 48 55 40 45 40C30 40 20 50 20 65C20 85 65 115 65 115C65 115 110 85 110 65C110 50 100 40 85 40Z" fill="#D4B5B0" fill-opacity="0.6"/>
                <path d="M115 40C105 40 97 48 95 58C93 48 85 40 75 40C60 40 50 50 50 65C50 85 95 115 95 115C95 115 140 85 140 65C140 50 130 40 115 40Z" fill="#FFB6C1" fill-opacity="0.7"/>
                <path d="M90 90L100 150L110 90" stroke="#4CAF50" stroke-width="2"/>
                <path d="M85 100C85 100 70 120 75 140" stroke="#4CAF50" stroke-width="2"/>
                <path d="M115 100C115 100 130 120 125 140" stroke="#4CAF50" stroke-width="2"/>
            </svg>
        </div>
    </section>

    <section class="gallery">
        <h2>Inspiring Templates</h2>
        <div class="gallery-grid">
            <router-link v-for="template in templates.slice(0, 4)" :key="template.id"
            :to="{ name: 'TemplatePreview', params: { name: template.name } }" class="template-card-link">
            <div class="gallery-item">
                <img :src="`${BACKEND_BASE}/${template.image_url}`" :alt="`Preview of ${template.name}`" loading="lazy">
                <div class="gallery-item-carousel">
                </div>
                <button class="use-template-buton">Use</button>
            </div>
            </router-link>
            
        </div>
        <div class="explore-more">
            <RouterLink to="/template" class="buton">Explore More Templates</RouterLink>
        </div>
        <div class="hibiscus hibiscus-top-right">
            <svg class="hibiscus-svg" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M100 20C90 20 82 28 80 38C78 28 70 20 60 20C45 20 35 30 35 45C35 65 80 95 80 95C80 95 125 65 125 45C125 30 115 20 10020Z" fill="#FFB6C1" fill-opacity="0.8"/>
                <path d="M85 40C75 40 67 48 65 58C63 48 55 40 45 40C30 40 20 50 20 65C20 85 65 115 65 115C65 115 110 85 110 65C110 50 100 40 85 40Z" fill="#D4B5B0" fill-opacity="0.6"/>
                <path d="M115 40C105 40 97 48 95 58C93 48 85 40 75 40C60 40 50 50 50 65C50 85 95 115 95 115C95 115 140 85 140 65C140 50 130 40 115 40Z" fill="#FFB6C1" fill-opacity="0.7"/>
                <path d="M90 90L100 150L110 90" stroke="#4CAF50" stroke-width="2"/>
                <path d="M85 100C85 100 70 120 75 140" stroke="#4CAF50" stroke-width="2"/>
                <path d="M115 100C115 100 130 120 125 140" stroke="#4CAF50" stroke-width="2"/>
            </svg>
        </div>
        <div class="hibiscus hibiscus-bottom-left">
            <svg class="hibiscus-svg" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M100 20C90 20 82 28 80 38C78 28 70 20 60 20C45 20 35 30 35 45C35 65 80 95 80 95C80 95 125 65 125 45C125 30 115 20 100 20Z" fill="#FFB6C1" fill-opacity="0.8"/>
                <path d="M85 40C75 40 67 48 65 58C63 48 55 40 45 40C30 40 20 50 20 65C20 85 65 115 65 115C65 115 110 85 110 65C110 50 100 40 85 40Z" fill="#D4B5B0" fill-opacity="0.6"/>
                <path d="M115 40C105 40 97 48 95 58C93 48 85 40 75 40C60 40 50 50 50 65C50 85 95 115 95 115C95 115 140 85 140 65C140 50 130 40 115 40Z" fill="#FFB6C1" fill-opacity="0.7"/>
                <path d="M90 90L100 150L110 90" stroke="#4CAF50" stroke-width="2"/>
                <path d="M85 100C85 100 70 120 75 140" stroke="#4CAF50" stroke-width="2"/>
                <path d="M115 100C115 100 130 120 125 140" stroke="#4CAF50" stroke-width="2"/>
            </svg>
        </div>
    </section>

    <div class="decorative-element leaf-1">
        <svg class="decorative-svg" viewBox="0 0 24 24" fill="#D4B5B0">
            <path d="M17.5,12C17.5,13.93 16.93,15.77 15.92,17.31L17.33,18.72C18.5,16.88 19.25,14.72 19.25,12C19.25,9.28 18.5,7.12 17.33,5.28L15.92,6.69C16.93,8.23 17.5,10.07 17.5,12M12,2C6.48,2 2,6.48 2,12C2,17.52 6.48,22 12,22C17.52,22 22,17.52 22,12C22,6.48 17.52,2 12,2M12,20C7.58,20 4,16.42 4,12C4,7.58 7.58,4 12,4C16.42,4 20,7.58 20,12C20,16.42 16.42,20 12,20Z"/>
        </svg>
    </div>
    <div class="decorative-element leaf-2">
        <svg class="decorative-svg" viewBox="0 0 24 24" fill="#D4B5B0">
            <path d="M17,8C8,10 5.9,16.17 3.82,21.34L5.71,22L5.4,21.23C6.84,17.5 9.07,14.41 12,12.35C13.32,11.53 14.93,10.75 16.85,10C16.85,10 15.84,12.23 15.06,13.81C14.28,15.39 13.5,16.97 13.5,16.97L15.21,18.07C15.21,18.07 14.22,20.19 13.74,21.37L14.03,22L14.93,21.75C17.95,20.5 19.85,18.06 20.56,16.33C21.28,14.6 21.28,13.65 21.28,12.62C21.28,11.59 20,9 17,8Z"/>
        </svg>
    </div>
    <div class="decorative-element circle-1">
        <svg class="decorative-svg" viewBox="0 0 24 24" fill="#FFB6C1">
            <circle cx="12" cy="12" r="10"/>
        </svg>
    </div>
    <div class="decorative-element flower-1">
        <svg class="decorative-svg" viewBox="0 0 24 24" fill="#FFB6C1">
            <path d="M12,2C17.52,2 22,6.48 22,12C22,17.52 17.52,22 12,22C6.48,22 2,17.52 2,12C2,6.48 6.48,2 12,2M12,4C7.58,4 4,7.58 4,12C4,16.42 7.58,20 12,20C16.42,20 20,16.42 20,12C20,7.58 16.42,4 12,4M12,10.5C13.38,10.5 14.5,11.62 14.5,13C14.5,14.38 13.38,15.5 12,15.5C10.62,15.5 9.5,14.38 9.5,13C9.5,11.62 10.62,10.5 12,10.5Z"/>
        </svg>
    </div>
    <div class="decorative-element flower-2">
        <svg class="decorative-svg" viewBox="0 0 24 24" fill="#D4B5B0">
            <path d="M12,2C17.52,2 22,6.48 22,12C22,17.52 17.52,22 12,22C6.48,22 2,17.52 2,12C2,6.48 6.48,2 12,2M12,4C7.58,4 4,7.58 4,12C4,16.42 7.58,20 12,20C16.42,20 20,16.42 20,12C20,7.58 16.42,4 12,4M12,10.5C13.38,10.5 14.5,11.62 14.5,13C14.5,14.38 13.38,15.5 12,15.5C10.62,15.5 9.5,14.38 9.5,13C9.5,11.62 10.62,10.5 12,10.5Z"/>
        </svg>
    </div>
    <div class="decorative-element circle-2">
        <svg class="decorative-svg" viewBox="0 0 24 24" fill="#FFB6C1">
            <circle cx="12" cy="12" r="10"/>
        </svg>
    </div>
    <div class="faq-container">
<div class="faq-section">
        <h2 class="faq-title">Frequently Asked Questions</h2>
        <div class="faq-grid">
          <div
            class="faq-item"
            v-for="(faq, index) in faqs"
            :key="index"
            @click="toggleFaq(index)"
          >
            <div class="faq-header">
              <h3 class="faq-question">{{ faq.question }}</h3>
              <component :is="faq.open ? ChevronUp : ChevronDown" class="chevron-icon" />
            </div>
            <p v-if="faq.open" class="faq-answer">{{ faq.answer }}</p>
          </div>
        </div>
      </div>
</div>
</template>

<style scoped>

:root {
    --primary: #D4B5B0;
    --secondary: #F8F1F0;
    --text: #2C2C2C;
    --light-text: #6B6B6B;
}

* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: 'Montserrat', sans-serif;
    color: var(--text);
    line-height: 1.6;
}

.header {
    background-color: white;
    padding: 1rem;
    position: fixed;
    width: 100%;
    top: 0;
    z-index: 100;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.nav {
    max-width: 1200px;
    margin: 0 auto;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.logo {
    font-family: 'Cormorant Garamond', serif;
    font-size: 1.5rem;
    color: var(--text);
    text-decoration: none;
}

.nav-links a {
    color: var(--text);
    text-decoration: none;
    margin-left: 2rem;
    font-size: 0.9rem;
    font-weight: 500;
}

.hero {
    background-color: var(--secondary);
    padding: 8rem 2rem;
    margin-top: 4rem;
    text-align: center;
    position: relative;
    overflow: hidden;
    top: -61px;
    min-height: 80vh;
    display: flex;
    align-items: center;
    justify-content: center;
}

.hero-content {
    position: relative;
    z-index: 2;
    text-align: center;
    padding: 2rem;
    background: rgba(255, 255, 255, 0.85);
    border-radius: 10px;
    backdrop-filter: blur(5px);
    max-width: 800px;
    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    border: 1px solid rgba(212, 181, 176, 0.3);
}

.hero-carousel {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
}

.hero-carousel img {
    position: absolute;
    width: 100%;
    height: 100%;
    object-fit: cover;
    opacity: 0;
    transition: opacity 1s ease-in-out;
}

.hero-carousel img.active {
    opacity: 1;
}

.hero h1 {
    font-family: 'Cormorant Garamond', serif;
    font-size: 3.5rem;
    margin-bottom: 1.5rem;
    color: var(--text);
    text-shadow: 2px 2px 4px rgba(0,0,0,0.1);
}

.hero p {
    font-size: 1.1rem;
    color: var(--light-text);
    max-width: 600px;
    margin: 0 auto 2rem;
}

/* .buton {
    display: inline-block;
    padding: 1rem 2rem;
    background-color: var(--primary);
    color: white;
    text-decoration: none;
    border-radius: 4px;
} */
.buton {
    display: inline-block;
    background-color: #FFB6C1;
    padding: 15px 25px;
    border-radius: 12px;
    color: white;
    font-weight: bold;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    transition: all 0.3s ease;
}


.buton:hover {
    transform: translateY(-5px);
    padding: 14px 23px;
    background-color: #fe8d9e;
}

.features {
    padding: 5rem 2rem;
    max-width: 1200px;
    margin: 0 auto;
}

.features-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 2rem;
    margin-top: 3rem;
}

 /* Features Section */
  .features {
    padding: 80px 0;
    position: relative;
    overflow: hidden;
    text-align: center;
  }
  .features h2 {
    text-align: center;
    margin-bottom: 10px;
  }

  .feature-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 40px;
  }
  .feature-card {
    background-color: var(--white);
    padding: 30px;
    border-radius: 8px;
    box-shadow: 0 5px 15px var(--shadow);
    text-align: center;
    transition: transform 0.3s ease;
  }
  .feature-card:hover {
    transform: translateY(-5px);
  }
  .feature-icon {
    width: 60px;
    height: 60px;
    margin: 0 auto 20px;
    background-size: contain;
    background-repeat: no-repeat;
    background-position: center;
  }
  .heart-icon {
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23d88c8c' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z'%3E%3C/path%3E%3C/svg%3E");
  }
  .checklist-icon {
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23d88c8c' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2'%3E%3C/path%3E%3Crect x='8' y='2' width='8' height='4' rx='1' ry='1'%3E%3C/rect%3E%3Cpath d='M9 14l2 2 4-4'%3E%3C/path%3E%3C/svg%3E");
  }
  .mobile-icon {
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23d88c8c' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Crect x='5' y='2' width='14' height='20' rx='2' ry='2'%3E%3C/rect%3E%3Cline x1='12' y1='18' x2='12.01' y2='18'%3E%3C/line%3E%3C/svg%3E");
  }



.gallery {
    background-color: var(--secondary);
    padding: 5rem 2rem;
}

.gallery h2 {
    text-align: center;
    font-family: 'Cormorant Garamond', serif;
    font-size: 2.5rem;
    margin-bottom: 3rem;
}

.gallery-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1.5rem;
    max-width: 1200px;
    margin: 0 auto;
}

.gallery-item {
    position: relative;
    overflow: hidden;
    border-radius: 8px;
    aspect-ratio: 1;
    cursor: pointer;
    position: relative;
}

.gallery-item img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.3s ease;
}

.gallery-item:hover img {
    transform: scale(1.05);
}

.gallery-item-carousel {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    opacity: 0;
    transition: opacity 0.3s ease;
    background: rgba(0,0,0,0.7);
}

.gallery-item:hover .gallery-item-carousel {
    opacity: 1;
}

.gallery-item-carousel img {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    opacity: 0;
    transition: opacity 0.5s ease;
}

.gallery-item-carousel img.active {
    opacity: 1;
}

.use-template-buton {
    position: absolute;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    background: #e6b3b3;
    color: white;
    padding: 0.8rem 1.5rem;
    border: none;
    border-radius: 12px;
    cursor: pointer;
    opacity: 0;
    transition: opacity 0.3s ease, transform 0.3s ease;
}
.use-template-buton:hover {
  background-color: #ff80ab;
  transition: background-color 0.3s ease;
}
.gallery-item:hover .use-template-buton {
    opacity: 1;
}


.explore-more {
    text-align: center;
    margin-top: 3rem;
}

.decorative-element {
    position: fixed;
    pointer-events: none;
    z-index: 1;
}

.leaf-1 {
    top: 20%;
    left: 5%;
    animation: float 6s infinite ease-in-out;
}

.leaf-2 {
    top: 60%;
    right: 5%;
    animation: float 8s infinite ease-in-out;
}

.circle-1 {
    top: 30%;
    right: 10%;
    animation: float 7s infinite ease-in-out;
}

.circle-2 {
    bottom: 20%;
    left: 8%;
    animation: float 5s infinite ease-in-out;
}

.flower-1 {
    top: 70%;
    left: 15%;
    animation: float 9s infinite ease-in-out;
}

.flower-2 {
    top: 10%;
    right: 20%;
    animation: float 7s infinite ease-in-out;
}


@keyframes float {
    0%, 100% { transform: translateY(0) rotate(0deg); }
    50% { transform: translateY(-30px) rotate(10deg); }
}

.decorative-svg {
    width: 50px;
    height: 50px;
    opacity: 0.2;
}

@media (max-width: 768px) {
    .nav-links {
        display: none;
    }

    .hero h1 {
        font-size: 2.5rem;
    }

    .features {
        padding: 2rem 1rem;
    }
    .features-grid {
        grid-template-columns: 1fr;
    }
    .feature {
        padding: 1rem;
    }

    .gallery {
        padding: 3rem 1rem;
    }
}

.hero, .features, .gallery {
    position: relative;
    overflow: hidden;
}

.hibiscus {
    position: absolute;
    pointer-events: none;
    z-index: 1;
    animation: sway 8s infinite ease-in-out;
}

.hibiscus:nth-child(2) {
    animation-delay: -4s;
}

.hibiscus-top-right {
    top: -50px;
    right: -50px;
    transform: rotate(45deg);
}

.hibiscus-bottom-left {
    bottom: -50px;
    left: -50px;
    transform: rotate(-135deg);
}

.hibiscus-svg {
    width: 200px;
    height: 200px;
    opacity: 0.8;
}

@keyframes sway {
    0%, 100% { transform: rotate(0deg) translateY(0); }
    50% { transform: rotate(5deg) translateY(-10px); }
}

.hero::before,
.features::before,
.gallery::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 80 80'%3E%3Cg fill='%23D4B5B0' fill-opacity='0.1'%3E%3Cpath d='M0 0h40v40H0V0zm40 40h40v40H40V40zm0-40h2l-2 2V0zm0 4l4-4h2l-6 6V4zm0 4l8-8h2L40 10V8zm0 4L52 0h2L40 14v-2zm0 4L56 0h2L40 18v-2zm0 4L60 0h2L40 22v-2zm0 4L64 0h2L40 26v-2zm0 4L68 0h2L40 30v-2zm0 4L72 0h2L40 34v-2zm0 4L76 0h2L40 38v-2zm0 4L80 0v2L42 40h-2zm4 0L80 4v2L46 40h-2zm4 0L80 8v2L50 40h-2zm4 0l28-28v2L54 40h-2zm4 0l24-24v2L58 40h-2zm4 0l20-20v2L62 40h-2zm4 0l16-16v2L66 40h-2zm4 0l12-12v2L70 40h-2zm4 0l8-8v2l-6 6h-2zm4 0l4-4v2l-2 2h-2z'/%3E%3C/g%3E%3C/svg%3E");
    opacity: 0.1;
    pointer-events: none;
}

.faq-container{
    width: 100%;
    padding: 30px 15vw;
    /* margin: 20px; */
}
.faq-section {
  margin-top: 3rem;
  text-align: left;
}

.faq-title {
  font-size: 1.8rem;
  font-weight: bold;
  color: #333;
  margin-bottom: 2rem;
  text-align: center;
}

.faq-grid {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.faq-item {
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  width: 100%;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  cursor: pointer;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.faq-item:hover {
  transform: translateY(-5px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08);
}

.faq-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.faq-question {
  font-size: 1.1rem;
  font-weight: 600;
  color: #222;
  margin-bottom: 0.5rem;
  flex: 1;
}

.chevron-icon {
  width: 20px;
  height: 20px;
  color: #cc3366;
  margin-left: 1rem;
  flex-shrink: 0;
}

.faq-answer {
  font-size: 1rem;
  color: #666;
  margin-top: 0.5rem;
  line-height: 1.5;
}
</style>