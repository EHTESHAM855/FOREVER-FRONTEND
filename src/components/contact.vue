<script setup>
import { ref } from 'vue';
import { fetchCsrfToken } from '@/utils/csrf';
import { useAlertStore } from '@/stores/alert';

const BACKEND_BASE = import.meta.env.VITE_API_URL;

const contactForm = ref({
  name: '',
  email: '',
  message: ''
});

const submitted = ref(false);
const loading = ref(false);

const alert = useAlertStore();

const isFormValid = () => {
  return contactForm.value.name && contactForm.value.email && contactForm.value.message;
};

const submitForm = async () => {
  if (!isFormValid()) {
    alert.show('Please fill in all fields.', 'error');
    return;
  }

  loading.value = true;

  try {
    const csrfToken = await fetchCsrfToken();

    const response = await fetch(`${BACKEND_BASE}/api/contact`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': csrfToken
      },
      body: JSON.stringify(contactForm.value)
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to submit form.');
    }

    submitted.value = true;
    contactForm.value = { name: '', email: '', message: '' };
    alert.show(data.message || 'Message sent successfully.', 'success');
  } catch (error) {
    alert.show(error.message || 'Something went wrong. Please try again later.', 'error');
  } finally {
    loading.value = false;
  }
};
</script>



<template>
  <div class="form-container">
    <div class="form-wrapper" v-if="!submitted">
      <form @submit.prevent="submitForm" class="contact-form">
        <h2>Contact Us</h2>
        <input type="text" v-model="contactForm.name" placeholder="Your Name" required />
        <input type="email" v-model="contactForm.email" placeholder="Your Email" required />
        <textarea v-model="contactForm.message" rows="5" placeholder="Your Message" required></textarea>
        <button type="submit">Send Message</button>
      </form>
    </div>
    <p v-else class="success-message">✅ Thank you! We’ll get back to you soon.</p>
  </div>
</template>

<style scoped>
.form-container {
  /* padding: 2rem 1rem; */
  display: flex;
  justify-content: center;
  align-items: center;
  height: auto;
  margin:50px 0;
  background: inherit;
}

.form-wrapper {
  width: 100%;
  max-width: 550px;
  background: white;
  padding: 2rem;
  border-radius: 16px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease-in-out;
}

.contact-form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.contact-form h2 {
  text-align: center;
  font-size: 1.75rem;
  color: #333;
  margin-bottom: 1rem;
}

.contact-form input,
.contact-form textarea {
  padding: 1rem;
  border: 1px solid #ccc;
  border-radius: 10px;
  font-size: 1rem;
  transition: border 0.3s, box-shadow 0.3s;
  width: 100%;
  resize: none;
}

.contact-form input:focus,
.contact-form textarea:focus {
  border-color: #cc3366;
  outline: none;
  box-shadow: 0 0 0 3px rgba(204, 51, 102, 0.1);
}

.contact-form button {
  background: #cc3366;
  color: white;
  padding: 0.85rem;
  border: none;
  border-radius: 10px;
  font-size: 1.05rem;
  font-weight: bold;
  cursor: pointer;
  transition: background 0.3s;
}

.contact-form button:hover {
  background: #aa2e59;
}

.success-message {
  text-align: center;
  font-size: 1.2rem;
  color: #28a745;
  animation: fadeIn 0.6s ease-in-out;
  padding: 1rem;
  background: #e9fbe9;
  border-radius: 12px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
  max-width: 500px;
  margin: auto;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
.error-message {
  color: #d93025;
  font-size: 0.95rem;
  margin-top: -10px;
  margin-bottom: 10px;
  text-align: center;
}

.contact-form button:disabled {
  background: #ccc;
  cursor: not-allowed;
}


/* Responsive Design */
@media (max-width: 600px) {
  .form-wrapper {
    padding: 1.5rem 1rem;
    border-radius: 12px;
  }

  .contact-form h2 {
    font-size: 1.5rem;
  }

  .contact-form button {
    font-size: 1rem;
  }
}
</style>
