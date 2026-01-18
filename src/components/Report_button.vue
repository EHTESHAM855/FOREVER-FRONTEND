<template>
  <div class="report-container">
    <button class="report-button" @click="showModal = true">📢 Report</button>

    <div v-if="showModal" class="modal-overlay">
      <transition name="fade-scale">
        <div class="modal-box animate-pop" v-if="showModal" role="dialog" aria-modal="true">
          <button class="close-btn" @click="closeModal" aria-label="Close">✖</button>
          <h2 class="modal-title">Report an Issue</h2>

          <div v-if="!submitted">
            <form @submit.prevent="submitReport" class="report-form" novalidate>
              <label for="subject">Subject</label>
              <input
                id="subject"
                v-model="report.subject"
                type="text"
                :class="{ 'input-error': report.subject === '' && triedSubmit }"
                placeholder="E.g. Bug on Publish Page"
                required
              />

              <label for="description">Description</label>
              <textarea
                id="description"
                v-model="report.description"
                :class="{ 'input-error': report.description === '' && triedSubmit }"
                placeholder="Describe the issue in detail..."
                rows="4"
                required
              ></textarea>

              <div class="form-actions">
                <button type="submit" class="submit-btn" :disabled="loading">
                  {{ loading ? 'Submitting...' : '🚀 Submit Report' }}
                </button>
              </div>
            </form>
          </div>

          <div v-else class="success-msg">
            ✅ Report submitted successfully!
          </div>
        </div>
      </transition>
    </div>
  </div>
</template>


<script setup>
import { ref } from 'vue';
import { fetchCsrfToken } from '@/utils/csrf';
import { useAlertStore } from '@/stores/alert';

const BACKEND_BASE = import.meta.env.VITE_API_URL;
const alert = useAlertStore();

const showModal = ref(false);
const submitted = ref(false);
const loading = ref(false);
const triedSubmit = ref(false);

const report = ref({
  subject: '',
  description: ''
});

const closeModal = () => {
  showModal.value = false;
  submitted.value = false;
  triedSubmit.value = false;
  loading.value = false;
  report.value = { subject: '', description: '' };
};

const submitReport = async () => {
  triedSubmit.value = true;

  if (!report.value.subject.trim() || !report.value.description.trim()) return;

  loading.value = true;

  try {
    const csrfToken = await fetchCsrfToken();

    const response = await fetch(`${BACKEND_BASE}/api/report`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': csrfToken
      },
      body: JSON.stringify(report.value)
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to submit report.');
    }

    submitted.value = true;
    alert.show(data.message || 'Report submitted successfully.', 'success');
    setTimeout(closeModal, 3000);
  } catch (error) {
    alert.show(error.message || 'Failed to submit report. Try again later.', 'error');
  } finally {
    loading.value = false;
  }
};
</script>



<style scoped>
.report-button {
  position: fixed;
  bottom: 24px;
  right: 24px;
  background: linear-gradient(to left, #f12711, #f5af19);
  color: white;
  padding: 14px 24px;
  border-radius: 9999px;
  font-weight: 600;
  font-size: 16px;
  border: none;
  cursor: pointer;
  z-index: 1000;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.25);
  transition: transform 0.2s ease, box-shadow 0.3s ease;
}
.report-button:hover {
  transform: scale(1.05);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 999;
  backdrop-filter: blur(5px);
  padding: 1rem;
}

.modal-box {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
  padding: 24px;
  width: 100%;
  max-width: 420px;
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.2);
  position: relative;
  animation: fadeInUp 0.3s ease forwards;
}

@keyframes fadeInUp {
  0% {
    opacity: 0;
    transform: translateY(20px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

.close-btn {
  position: absolute;
  top: 14px;
  right: 14px;
  font-size: 18px;
  color: #888;
  background: none;
  border: none;
  cursor: pointer;
  transition: color 0.2s ease;
}
.close-btn:hover {
  color: #222;
}

.modal-title {
  font-size: 1.4rem;
  margin-bottom: 16px;
  font-weight: 600;
  color: #333;
}

.report-form label {
  display: block;
  margin: 12px 0 4px;
  font-weight: 500;
  color: #444;
}
.report-form input,
.report-form textarea {
  width: 100%;
  padding: 10px 14px;
  border: 1px solid #ccc;
  border-radius: 10px;
  background: #fefefe;
  font-size: 14px;
  transition: border 0.2s ease;
}
.report-form input:focus,
.report-form textarea:focus {
  outline: none;
  border-color: #f12711;
}

.form-actions {
  margin-top: 16px;
  text-align: right;
}
.submit-btn {
  background-color: #1976d2;
  color: white;
  padding: 10px 18px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: bold;
  transition: background 0.2s ease;
}
.submit-btn:hover {
  background-color: #0d47a1;
}

.success-msg {
  font-size: 1rem;
  font-weight: 600;
  text-align: center;
  color: #2e7d32;
  padding: 20px 0;
}

/* Responsive */
@media (max-width: 480px) {
  .modal-box {
    padding: 20px 16px;
  }
  .report-button {
    padding: 12px 18px;
    font-size: 14px;
  }
}


.input-error {
  border-color: red;
  background-color: #fff6f6;
}

.fade-scale-enter-active,
.fade-scale-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}
.fade-scale-enter-from,
.fade-scale-leave-to {
  opacity: 0;
  transform: scale(0.9);
}
.fade-scale-enter-to,
.fade-scale-leave-from {
  opacity: 1;
  transform: scale(1);
}

.report-form input::placeholder,
.report-form textarea::placeholder {
  color: #999;
}

</style>
