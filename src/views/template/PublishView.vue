<template>
  <section class="templates">
    <div class="template-list">
      <!-- Form Card -->
      <div class="template-card">
        <form @submit.prevent="submitForm" class="publish-form">
          <div class="publish-form-heading">Publish Your Template</div>

          <div class="form-group">
            <label for="urlName">Public Page Name:</label>
            <div class="url-preview">
              forever.com/p/{{ user.username }}/<strong>{{ form.name }}</strong>
            </div>
            <input v-model="form.name" type="text" id="urlName" required />
          </div>

          <div class="form-group">
            <label for="start">Start Date:</label>
            <input type="date" id="start" v-model="form.startDate" @change="calculateDays" required />
          </div>

          <div class="form-group">
            <label for="end">End Date:</label>
            <input type="date" id="end" v-model="form.endDate" @change="calculateDays" required />
          </div>

          <div class="form-group">
            <label>Number of Days:</label>
            <input type="number" :value="form.days" readonly />
          </div>

          <div class="form-group">
            <label>Total Price (₹{{templateData.price}}/day):</label>
            <input type="text" :value="`₹${form.totalPrice}`" readonly />
          </div>

          <button type="submit" class="preview-button" :disabled="isSubmitting">
            {{ isSubmitting ? "Publishing..." : "Publish" }}
          </button>
        </form>
      </div>

      <!-- Details Card -->
      <div class="template-card">
        <div class="publish-form">
          <h2 class="details-heading">Page Details</h2>
          <div v-if="templateData" class="template-details-card">
            <img :src="`${BACKEND_BASE}/${templateData.image}`" alt="Template Preview" class="template-image" />

            <div class="template-info">
              <h3>{{ templateData.template_name }} | ID: {{ templateData.id }}</h3>
              <div class="details">
                <p><strong>Author:</strong> {{ templateData.username }}</p>
                <p><strong>Start Date:</strong> {{ form.startDate }}</p>
                <p><strong>End Date:</strong> {{ form.endDate }}</p>
                <p><strong>Total Days:</strong> {{ form.days }}</p>
                <p><strong>Cost/Day:</strong> ₹{{ templateData.price }}</p>
                <p><strong>Total Cost:</strong> ₹{{ form.totalPrice }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>





<script setup>
import { ref, onMounted, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { fetchCsrfToken } from '@/utils/csrf';
import { useAlertStore } from '@/stores/alert';
import { useConfirmStore } from '@/stores/confirm'

const confirm = useConfirmStore()


const router = useRouter();
const route = useRoute();
const alert = useAlertStore();

const BACKEND_BASE = import.meta.env.VITE_API_URL;

const user = ref({});
const templateData = ref({});

const form = ref({
  name: '',
  startDate: '',
  endDate: '',
  days: 0,
  totalPrice: 0,
  templateId: ''
});

const isSubmitting = ref(false);

watch(
  () => route.params.editedtemplate_id,
  (newVal) => {
    form.value.templateId = newVal;
  },
  { immediate: true }
);

const calculateDays = () => {
  const { startDate, endDate } = form.value;
  if (startDate && endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
    form.value.days = diffDays > 0 ? diffDays : 0;
    form.value.totalPrice = form.value.days * (templateData.value.price || 0);
  }
};

const fetchUser = async () => {
  try {
    const res = await fetch(`${BACKEND_BASE}/api/user/me`, { credentials: 'include' });
    if (!res.ok) return router.push('/login');
    const data = await res.json();
    user.value = data.user;
  } catch (err) {
    console.error('Error fetching user:', err);
  }
};

const fetchTemplateDetails = async () => {
  try {
    const res = await fetch(`${BACKEND_BASE}/api/edited_template_data/${form.value.templateId}`, {
      credentials: 'include'
    });

    const data = await res.json();

    if (!res.ok) {
      alert.show(data.message || 'Failed to fetch template data.', 'error');
      return;
    }

    templateData.value = data;
  } catch (err) {
    alert.show('Unexpected error while fetching template data.', 'error');
  }
};

const submitForm = async () => {
  const confirmed = await confirm.show("Are you sure you want to publish?")
  if (!confirmed){
    return;
  }
  if (confirmed){
  const { name, startDate, endDate, days } = form.value;

  if (!name || !startDate || !endDate || days <= 0) {
    alert.show('Please fill all fields correctly.', 'error');
    return;
  }

  isSubmitting.value = true;

  try {
    const csrfToken = await fetchCsrfToken();

    const orderRes = await fetch(`${BACKEND_BASE}/api/create-order`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': csrfToken
      },
      credentials: 'include',
      body: JSON.stringify({
        amount: form.value.totalPrice * 100,
        currency: 'INR',
        name
      })
    });

    const orderData = await orderRes.json();

    if (!orderRes.ok) {
      alert.show(orderData.message || 'Failed to create order.', 'error');
      return;
    }

    const { order_id, amount } = orderData;

    const options = {
      key: 'rzp_test_eRYLNCMpMr9shn',
      amount,
      currency: 'INR',
      name: 'Forever Templates',
      description: 'Template Publishing',
      order_id,
      handler: async (response) => {
        const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = response;

        if (!razorpay_order_id || !razorpay_signature) {
          alert.show('Incomplete payment details received.', 'error');
          return;
        }

        const verifyRes = await fetch(`${BACKEND_BASE}/api/verify-payments`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': await fetchCsrfToken()
          },
          credentials: 'include',
          body: JSON.stringify({ razorpay_payment_id, razorpay_order_id, razorpay_signature })
        });

        const verifyData = await verifyRes.json();

        if (!verifyRes.ok) {
          alert.show(verifyData.message || 'Payment verification failed.', 'error');
          return;
        }

        await publishTemplate();
      },
      prefill: {
        name: user.value.username,
        email: user.value.email || 'user@example.com'
      },
      theme: {
        color: '#eb5089'
      }
    };

    const rzp = new window.Razorpay(options);
    rzp.open();

    rzp.on('payment.failed', (response) => {
      const msg = response.error?.description || 'Payment failed. Please try again.';
      alert.show(msg, 'error');
    });
  } catch (err) {
    console.error('Error in submission:', err);
    alert.show('Something went wrong. Please try again.', 'error');
  } finally {
    isSubmitting.value = false;
  }}
};

const publishTemplate = async () => {
  try {
    const csrfToken = await fetchCsrfToken();

    const res = await fetch(`${BACKEND_BASE}/api/publish`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': csrfToken
      },
      credentials: 'include',
      body: JSON.stringify(form.value)
    });

    const data = await res.json();

    if (!res.ok) {
      alert.show(data.message || 'Publishing failed.', 'error');
      return;
    }

    alert.show(`Published successfully at forever.com/p/${user.value.username}/${form.value.name}`, 'success');

    form.value = {
      name: '',
      startDate: '',
      endDate: '',
      days: 0,
      totalPrice: 0,
      templateId: form.value.templateId
    };

    router.push('/dashboard/published');
  } catch (err) {
    alert.show('Unexpected error while publishing template.', 'error');
  }
};

onMounted(() => {
  fetchUser();
  fetchTemplateDetails();
});
</script>




<style scoped>


.templates {
  padding: 20px;
  background-color: #ffffff;
}

.template-list {
  display: flex;
  flex-wrap: wrap;
  gap: 32px;
  justify-content: center;
}

.template-card {
  background: #fff;
  border-radius: 16px;
  width: 100%;
  max-width: 520px;
  padding: 28px;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.06);
  transition: transform 0.3s ease;
}

.template-card:hover {
  transform: translateY(-4px);
}

.publish-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.publish-form-heading {
  font-family: 'Dancing Script', cursive;
  font-size: 32px;
  color: #c9184a;
  text-align: center;
  margin-bottom: 20px;
}

.details-heading {
  font-family: 'Dancing Script', cursive;
  font-size: 28px;
  color: #d6336c;
  text-align: center;
  margin-bottom: 16px;
}

.form-group label {
  font-weight: 600;
  color: #a61e4d;
  margin-bottom: 6px;
  display: block;
  font-size: 15px;
}

input,
textarea {
  width: 100%;
  padding: 12px 16px;
  border: 1.8px solid #ffc8dd;
  border-radius: 12px;
  background-color: #fff7fb;
  font-size: 15px;
  font-family: 'Segoe UI', sans-serif;
  color: #5a0036;
}

input:focus,
textarea:focus {
  border-color: #ffafcc;
  outline: none;
  box-shadow: 0 0 10px rgba(255, 143, 191, 0.3);
}

.preview-button {
  background-color: #eb5089;
  color: #fff;
  padding: 10px 20px;
  border: none;
  border-radius: 10px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.preview-button:hover {
  background-color: #c9184a;
}

.template-details-card {
  display: flex;
  flex-direction: column;
  gap: 16px;
  align-items: center;
}

.template-image {
  width: 100%;
  border-radius: 12px;
  border: 2px solid #db5589;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
  max-height: 320px;
  object-fit: cover;
}

.template-info {
  width: 100%;
  text-align: left;
}

.template-info h3 {
  color: #c9184a;
  font-size: 20px;
  margin-bottom: 10px;
}

.template-info .details p {
  font-size: 14px;
  margin: 4px 0;
}

.url-preview {
  font-size: 13px;
  color: #777;
  margin-bottom: 6px;
}

@media (max-width: 768px) {
  .template-list {
    flex-direction: column;
    align-items: center;
  }

  .template-card {
    max-width: 100%;
  }

  .publish-form {
    padding: 0;
  }
}
</style>
