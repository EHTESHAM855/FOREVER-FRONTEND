<script setup>
import { ref } from 'vue'
import {
  Pencil,
  Smartphone,
  Rocket,
  User2,
  Eye,
  Lock,
  ChevronDown,
  ChevronUp
} from 'lucide-vue-next'

const features = [
  {
    title: "Customizable Templates",
    description: "Easily personalize your wedding templates with text, colors, and images.",
    icon: Pencil
  },
  {
    title: "Mobile Responsive",
    description: "All templates are designed to look stunning on any device.",
    icon: Smartphone
  },
  {
    title: "One-Click Publishing",
    description: "Instantly publish your customized template with a unique link.",
    icon: Rocket
  },
  {
    title: "User Dashboard",
    description: "Manage your saved templates and settings with ease.",
    icon: User2
  },
  {
    title: "Live Preview",
    description: "See real-time changes while customizing your template.",
    icon: Eye
  },
  {
    title: "Secure and Private",
    description: "We prioritize your data and privacy with secure systems.",
    icon: Lock
  },
];
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
</script>

<template>
  <section class="features-page">
    <div class="container">
      <h1 class="page-title">Features</h1>
      <p class="page-subtitle">Everything you need to create your dream wedding website</p>

      <div class="features-grid">
        <div class="feature-card" v-for="(feature, index) in features" :key="index">
          <div class="feature-icon">
            <component :is="feature.icon" class="lucide-icon" />
          </div>
          <h3 class="feature-title">{{ feature.title }}</h3>
          <p class="feature-description">{{ feature.description }}</p>
        </div>
      </div>
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
  </section>
</template>

<style scoped>
.features-page {
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
  margin-bottom: 0.5rem;
}

.page-subtitle {
  font-size: 1.2rem;
  color: #444;
  margin-bottom: 3rem;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 2rem;
}

.feature-card {
  background: white;
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.05);
  transition: transform 0.3s ease;
}

.feature-card:hover {
  transform: translateY(-5px);
}

.feature-icon {
  font-size: 2.5rem;
  margin-bottom: 1rem;
}

.lucide-icon {
  width: 40px;
  height: 40px;
  color: #cc3366;
}

.feature-title {
  font-size: 1.2rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 0.5rem;
}

.feature-description {
  font-size: 1rem;
  color: #666;
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
