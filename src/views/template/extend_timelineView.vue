<template>
  <section class="templates">
    <div class="template-list">
      <div class="template-card">
        <form @submit.prevent="submitForm" class="publish-form">
          <div class="publish-form-heading">Extend Unpublishing Date</div>

          <div>
            <label for="urlName">Public Page Name (forever.com/<strong>{{ form.name }}</strong>):</label>
            <input v-model="form.name" type="text" id="urlName" required readonly />
          </div>

          <div>
            <label for="start">Start Date:</label>
            <input style="font-weight: bold;" type="date" id="start" v-model="form.startDate" @change="calculateDays"
              required readonly />
          </div>

          <div>
            <label for="end">End Date:</label>
            <input style="font-weight: bold;" type="date" id="end" v-model="form.endDate" @change="calculateDays"
              required />
          </div>

          <div>
            <label>Number of Days:</label>
            <input type="number" :value="form.days" readonly />
          </div>

          <div>
            <label>Total Price (₹{{templateData.price}}/day):</label>
            <input type="text" :value="`₹${form.totalPrice}`" readonly />
          </div>

          <button type="submit" class="preview-button" :disabled="isSubmitting">
            {{ isSubmitting ? "Extending..." : "Extend" }}
          </button>
        </form>
      </div>
      <div class="template-card">
        <div class="publish-form">
          <div class="publish-form-heading">Page Details</div>

          <div v-if="templateData" class="template-details-card">
            <img v-if="templateData.image" :src="`${BACKEND_BASE}/${templateData.image}`" alt="Template Preview"
              class="template-image" />


            <div class="template-info">
              <h2>{{ templateData.name }} | Id: {{ templateData.id }}</h2>
              <!-- <p><strong>Template ID:</strong> {{ templateData.id }}</p> -->
              <div class="details">
                <p><strong>Author:</strong> User {{ templateData.user }}</p>
                <p><strong>Start Date: </strong>{{ templateData.startdate }}</p>
                <p><strong>End Date: </strong>{{ form.endDate }}</p>
                <p><strong>Total Days: </strong>{{ form.days }}</p>
                <p><strong>Cost/Day:</strong> ₹{{ templateData.price }}</p>
                <p><strong>Total Cost: </strong>₹{{ form.totalPrice }}</p>

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
const BACKEND_BASE = import.meta.env.VITE_API_URL
import { useAlertStore } from '@/stores/alert'

const alert = useAlertStore()



const router = useRouter();
const route = useRoute();

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
watch(
  () => route.params.publishedtemplate_id,
  (newVal) => {
    form.value.templateId = newVal;
  },
  { immediate: true }
);

const calculateDays = () => {
  if (form.value.startDate && form.value.endDate) {
    const start = new Date(form.value.startDate);
    const end = new Date(form.value.endDate);
    const diffTime = end - start;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    form.value.days = diffDays > 0 ? diffDays : 0;
    form.value.totalPrice = form.value.days * templateData.value.price;
  }
};

const isSubmitting = ref(false);

const submitForm = async () => {
  if (
    !form.value.name ||
    !form.value.startDate ||
    !form.value.endDate ||
    form.value.days <= 0
  ) {
    alert.show("Please fill out all required fields correctly.","error");
    return;
  }

  isSubmitting.value = true;

  try {
    const csrfToken = await fetchCsrfToken();

    // Step 1: Create Order
    const orderRes = await fetch(`${BACKEND_BASE}/api/create-order`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": csrfToken
      },
      credentials: "include",
      body: JSON.stringify({
        amount: form.value.totalPrice * 100, // Razorpay expects paise
        currency: "INR",
        name : form.value.name,
        type: "Extension"
      })
    });

    if (!orderRes.ok) throw new Error("Failed to create Razorpay order");

    const { order_id, amount } = await orderRes.json();

    // Step 2: Razorpay Checkout
    const options = {
      key: "rzp_test_eRYLNCMpMr9shn",
      amount,
      currency: "INR",
      name: "Forever Templates",
      description: "Template Publishing",
      order_id,
      handler: async function (response) {
        console.log("Razorpay response:", response);

        const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = response;

        if (!razorpay_order_id || !razorpay_signature) {
          alert("Incomplete payment details received.");
          return;
        }

        const csrfToken = await fetchCsrfToken();

        // Step 3: Verify Payment
        const verifyRes = await fetch(`${BACKEND_BASE}/api/verify-payments`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": csrfToken
          },
          credentials: "include",
          body: JSON.stringify({
            razorpay_payment_id,
            razorpay_order_id,
            razorpay_signature
          })
        });

        if (!verifyRes.ok) {
          alert.show("Payment verification failed.","error");
          return;
        }

        // Step 4: Publish Template
        await ExtendTimeline();
      },
      prefill: {
        name: user.value.username,
        email: user.value.email
      },
      theme: {
        color: "#eb5089"
      }
    };

    const rzp = new window.Razorpay(options);
    rzp.open();

    rzp.on("payment.failed", function (response) {
      console.error("Payment Failed:", response.error);
      alert.show("Payment failed. Please try again.","error");
    });

  } catch (err) {
    console.error("Payment or publishing error:", err);
    alert.show("Payment failed. Try again.","error");
  } finally {
    isSubmitting.value = false;
  }
};

const ExtendTimeline = async () => {
  const csrfToken = await fetchCsrfToken();
  const payload = {
    name: form.value.name,
    startDate: form.value.startDate,
    endDate: form.value.endDate,
    totalPrice: form.value.totalPrice,
    templateId: form.value.templateId
  };
  try {

    const res = await fetch(`${BACKEND_BASE}/api/extend_timeline`, {
      method: 'POST',
      headers: {
        'X-CSRFToken': csrfToken,
        'Content-Type': 'application/json'
      },

      credentials: 'include',
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      const data = await res.json();
      alert.show('Extended successfully',"success");
      router.push('/dashboard/published');
    } else {
      const err = await res.json();
      alert.show(`Extension Failed: ${err.error || 'Unknown error'}`,"error");
    }
  } catch (err) {
    console.error("Error publishing:", err);
    alert.show("Network or server error.","error");
  }
};

const fetchUser = async () => {
  try {
    const res = await fetch(`${BACKEND_BASE}/api/user/me`, { credentials: "include" });
    if (!res.ok) {
      router.push("/login");
      return;
    }
    const data = await res.json();
    user.value = data.user;
  } catch (err) {
    console.error(err);
  }
};

const publishingdetails = async () => {
  try {
    const res = await fetch(`${BACKEND_BASE}/api/published-templates/${form.value.templateId}`, {
      method: "GET",
      credentials: "include"
    });
    if (res.ok) {
      const data = await res.json();
      templateData.value = data;
      form.value.name = data.name;
      form.value.startDate = data.form_startdate;
      form.value.endDate = data.enddate;
      calculateDays();
    } else {
      alert.show('Failed to get template data',"error");
    }
  } catch (err) {
    console.error("Error fetching template data:", err);
  }
};

onMounted(() => {
  fetchUser();
  publishingdetails();
});
</script>



<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Dancing+Script:wght@600&display=swap');


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
