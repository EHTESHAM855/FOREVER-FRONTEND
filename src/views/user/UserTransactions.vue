<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
const BACKEND_BASE = import.meta.env.VITE_API_URL;

const orders = ref([]);
const groupedOrders = ref({});
const expandedGroups = ref({});

const router = useRouter();

const fetchOrders = async () => {
  try {
    const res = await fetch(`${BACKEND_BASE}/api/orders/me`, {
      credentials: "include"
    });

    if (!res.ok) {
      if (res.status === 401) {
        router.push("/login");
      } else {
        throw new Error("Failed to fetch orders");
      }
    }

    const data = await res.json();
    orders.value = data;

    // Grouping by name
    const grouped = {};
    data.forEach(order => {
      if (!grouped[order.name]) grouped[order.name] = [];
      grouped[order.name].push(order);
    });

    // Ensure publish order is first in each group
    for (const name in grouped) {
      grouped[name].sort((a, b) => a.order_type === 'Publish' ? -1 : 1);
    }

    groupedOrders.value = grouped;
  } catch (err) {
    console.error("Error fetching orders:", err);
  }
};

const toggleGroup = (name) => {
  expandedGroups.value[name] = !expandedGroups.value[name];
};

const formatDate = (dateStr) => {
  return new Date(dateStr).toLocaleDateString();
};

onMounted(fetchOrders);
</script>

<template>
  <section class="transactions">
    <div class="header">
      <h1>My Transactions</h1>
    </div>

    <div v-for="(orders, name) in groupedOrders" :key="name" class="order-group">
      <div class="main-order" @click="toggleGroup(name)">
        <strong>{{ name }}</strong>
        <span class="toggle">{{ expandedGroups[name] ? '▲' : '▼' }}</span>
      </div>

      <table v-if="expandedGroups[name]" class="order-table">
        <thead>
          <tr>
            <th>S.N.</th>
            <th>Order Type</th>
            <th>Start Date</th>
            <th>End Date</th>
            <th>Days</th>
            <th>Total Price</th>
            <th>Order ID</th>
            <th>Ordered On</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(order, index) in orders" :key="order.id">
            <td>{{ index + 1 }}</td>
            <td>{{ order.order_type }}</td>
            <td>{{ formatDate(order.start_date) }}</td>
            <td>{{ formatDate(order.end_date) }}</td>
            <td>{{ order.days }}</td>
            <td>₹{{ order.total_price }}</td>
            <td>{{ order.id }}</td>
            <td>{{ formatDate(order.created_at) }}</td>
          </tr>
        </tbody>
      </table>

      <!-- Responsive Card View for Mobile -->
      <div
        v-if="expandedGroups[name]"
        class="order-card"
        v-for="(order, index) in orders"
        :key="'mobile-' + order.id"
      >
        <p><strong>S.N.:</strong> {{ index + 1 }}</p>
        <p><strong>Order Type:</strong> {{ order.order_type }}</p>
        <p><strong>Start Date:</strong> {{ formatDate(order.start_date) }}</p>
        <p><strong>End Date:</strong> {{ formatDate(order.end_date) }}</p>
        <p><strong>Days:</strong> {{ order.days }}</p>
        <p><strong>Total Price:</strong> ₹{{ order.total_price }}</p>
        <p><strong>Order ID:</strong> {{ order.id }}</p>
        <p><strong>Ordered On:</strong> {{ formatDate(order.created_at) }}</p>
      </div>
    </div>
  </section>
</template>

<style scoped>
.transactions {
  /* padding: 20px; */
}

.header h1 {
  font-family: 'Cormorant Garamond', serif;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
  font-size: 3rem;
  color: var(--text, #000);
  border-bottom: 1px solid #ccc;
  padding-bottom: 20px;
  margin-bottom: 20px;
}

.order-group {
  margin-bottom: 20px;
  border: 1px solid #ddd;
  border-radius: 10px;
  padding: 15px;
  background: #fff0f6;
}

.main-order {
  font-size: 1.2rem;
  font-weight: bold;
  color: #a83264;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.toggle {
  font-size: 1.1rem;
  color: #777;
}

.order-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 10px;
}

.order-table th,
.order-table td {
  padding: 12px 14px;
  border-bottom: 1px solid #ddd;
  text-align: left;
}

.order-table th {
  background-color: #ffe6ef;
  color: #6a0f3c;
}

.order-card {
  display: none;
}

/* Responsive Styles */
@media (max-width: 768px) {
  .order-table {
    display: none;
  }
 

  .order-card {
    display: block;
    background-color: #fff7fa;
    border: 1px solid #ddd;
    border-radius: 8px;
    padding: 10px 15px;
    margin-top: 10px;
    font-size: 0.95rem;
  }

  .order-card p {
    margin: 6px 0;
    line-height: 1.4;
  }

  .main-order {
    font-size: 1rem;
    flex-direction: column;
    align-items: flex-start;
    gap: 5px;
  }
}
</style>
