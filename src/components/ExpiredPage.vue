<template>
  <div class="expired-page">
    <div class="warning-card">
      <h1>⏳ This Page Has Expired</h1>
      <p class="explanation">It looks like this wedding page is no longer available.</p>
      <p>If you're the owner, you can extend its availability to keep it live.</p>

      <div class="instructions">
        Go to <strong>Login → Published Pages</strong>, locate your template, and click
        <strong>“Extend Timeline”</strong>.
      </div>

      <router-link to="/login" class="action-button">🔐 Go to Login</router-link>
    </div>
  </div>
</template>


<script setup>
import { onMounted, defineEmits } from 'vue'

const emit = defineEmits(['load'])

onMounted(() => {
  emit('load') 
})
</script>


<style scoped>
.expired-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #fff0f6, #ffe0e6);
  padding: 2rem;
  font-family: 'Segoe UI', sans-serif;
}

.warning-card {
  background: #fff;
  border: 2px solid #ff8080;
  padding: 2.5rem 2rem;
  border-radius: 1.25rem;
  box-shadow: 0 12px 30px rgba(255, 0, 0, 0.15);
  text-align: center;
  max-width: 550px;
  width: 100%;
  color: #800020;
  animation: fadeSlideIn 0.6s ease-out;
}

.warning-card h1 {
  font-size: 2.2rem;
  margin-bottom: 1rem;
  color: #b30000;
}

.warning-card .explanation {
  font-size: 1.1rem;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.warning-card p {
  font-size: 1rem;
  margin-bottom: 0.5rem;
  color: #4d0000;
}

.instructions {
  margin-top: 1rem;
  font-size: 0.95rem;
  color: #333;
  background: #fff4f4;
  padding: 0.75rem 1rem;
  border-left: 4px solid #ff4d4d;
  border-radius: 0.5rem;
}

.action-button {
  display: inline-block;
  margin-top: 1.5rem;
  padding: 0.85rem 1.75rem;
  background-color: #ff4d4d;
  color: white;
  border-radius: 0.6rem;
  text-decoration: none;
  font-weight: 600;
  transition: background-color 0.3s ease, transform 0.2s ease;
}

.action-button:hover {
  background-color: #cc0000;
  transform: scale(1.05);
}

@keyframes fadeSlideIn {
  from {
    opacity: 0;
    transform: translateY(15px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 480px) {
  .warning-card h1 {
    font-size: 1.7rem;
  }

  .action-button {
    width: 100%;
    padding: 1rem;
  }
}

</style>
