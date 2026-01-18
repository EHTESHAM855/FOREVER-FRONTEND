<script setup>
import AdminSidebar from '@/components/AdminSidebar.vue';
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import * as echarts from 'echarts/core';
import VChart from 'vue-echarts';
import {
  GridComponent,
  TooltipComponent,
  LegendComponent,
  DatasetComponent,
  ToolboxComponent,
  DataZoomComponent,
  TitleComponent,
} from 'echarts/components';
import { LineChart, PieChart } from 'echarts/charts';
import { CanvasRenderer } from 'echarts/renderers';

echarts.use([
  GridComponent,
  TooltipComponent,
  LegendComponent,
  DatasetComponent,
  ToolboxComponent,
  DataZoomComponent,
  TitleComponent,
  LineChart,
  PieChart,
  CanvasRenderer,
]);

const orders = ref([]);
const filteredOrders = ref([]);

const timeFilter = ref('all'); // for table filtering
const searchQuery = ref('');

const chartType = ref('line'); // 'line' or 'pie'
const graphTimeRange = ref('week'); // time range for graph: week/month/year/all

const router = useRouter();
const BACKEND_BASE = import.meta.env.VITE_API_URL;

const chartOption = ref({});

const checkAuth = async () => {
  try {
    const res = await fetch(`${BACKEND_BASE}/api/check-admin-session`, { credentials: 'include' });
    if (!res.ok) router.push('/admin/login');
  } catch (err) {
    router.push('/admin/login');
  }
};

const fetchOrders = async () => {
  try {
    const res = await fetch(`${BACKEND_BASE}/api/admin/orders`, { credentials: 'include' });
    if (res.ok) {
      orders.value = await res.json();
      applyFilters();
      generateChart();
    }
  } catch (err) {
    console.error('Failed to fetch orders:', err);
  }
};

const formatDate = (dateStr) => {
  return new Date(dateStr).toLocaleString();
};

const applyFilters = () => {
    currentPage.value = 1;
  const now = new Date();
  let filtered = orders.value;

  // Filter by time for table
  if (timeFilter.value !== 'all') {
    let daysBack;
    if (timeFilter.value === 'week') daysBack = 7;
    else if (timeFilter.value === 'month') daysBack = 30;
    else if (timeFilter.value === 'year') daysBack = 365;

    const cutoff = new Date(now.getTime() - daysBack * 24 * 60 * 60 * 1000);
    filtered = filtered.filter(
      (order) => new Date(order.created_at) >= cutoff
    );
  }

  // Search filter for table (template name or user id)
  const search = searchQuery.value.trim().toLowerCase();
  if (search) {
    filtered = filtered.filter(
      (order) =>
        (order.name && order.name.toLowerCase().includes(search)) ||
        (order.user_id && order.user_id.toString().includes(search))
    );
  }

  filteredOrders.value = filtered;
  generateChart();
};

const totalRevenue = computed(() =>
  filteredOrders.value.reduce((sum, order) => sum + Number(order.total_price), 0)
);

const formattedTotalRevenue = computed(() =>
  totalRevenue.value.toLocaleString('en-IN')
);

const generateChart = () => {
  const now = new Date();
  let daysBack;
  if (graphTimeRange.value === 'week') daysBack = 7;
  else if (graphTimeRange.value === 'month') daysBack = 30;
  else if (graphTimeRange.value === 'year') daysBack = 365;
  else daysBack = null; // all time

  // Filter orders by graphTimeRange
  let graphFilteredOrders = orders.value;
  if (daysBack !== null) {
    const cutoff = new Date(now.getTime() - daysBack * 24 * 60 * 60 * 1000);
    graphFilteredOrders = orders.value.filter(
      (order) => new Date(order.created_at) >= cutoff
    );
  }

  if (chartType.value === 'line') {
    // Group revenue by date (YYYY-MM-DD)
    const revenueByDate = {};
    graphFilteredOrders.forEach((order) => {
      const dateKey = new Date(order.created_at).toISOString().slice(0, 10);
      if (!revenueByDate[dateKey]) revenueByDate[dateKey] = 0;
      revenueByDate[dateKey] += Number(order.total_price);
    });

    const dates = Object.keys(revenueByDate).sort();
    const revenues = dates.map((d) => revenueByDate[d]);

    chartOption.value = {
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'cross' },
      },
      xAxis: {
        type: 'category',
        data: dates,
        boundaryGap: false,
        axisLabel: { rotate: 45, formatter: (val) => val.slice(5) }, // MM-DD
      },
      yAxis: {
        type: 'value',
        name: 'Revenue (₹)',
      },
      series: [
        {
          name: 'Revenue',
          type: 'line',
          smooth: true,
          data: revenues,
          areaStyle: {},
        },
      ],
      grid: { left: '3%', right: '4%', bottom: '15%', containLabel: true },
    };
  } else if (chartType.value === 'pie') {
    // Pie chart: revenue by template id
    const revenueByTemplate = {};
    graphFilteredOrders.forEach((order) => {
      const tid = order.template_id ?? 'Unknown';
      if (!revenueByTemplate[tid]) revenueByTemplate[tid] = 0;
      revenueByTemplate[tid] += Number(order.total_price);
    });

    const pieData = Object.entries(revenueByTemplate).map(([key, value]) => ({
      name: `Template ${key}`,
      value,
    }));

    chartOption.value = {
      tooltip: {
        trigger: 'item',
      },
      legend: {
        orient: 'vertical',
        left: 'left',
      },
      series: [
        {
          name: 'Revenue by Template',
          type: 'pie',
          radius: '60%',
          data: pieData,
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0,0,0,0.5)',
            },
          },
        },
      ],
    };
  }
};





const currentPage = ref(1);
const pageSize = 10;


const totalPages = computed(() => Math.ceil(filteredOrders.value.length / pageSize));

const paginatedOrders = computed(() => {
  const start = (currentPage.value - 1) * pageSize;
  return filteredOrders.value.slice(start, start + pageSize);
});

function nextPage() {
  if (currentPage.value < totalPages.value) currentPage.value++;
}

function prevPage() {
  if (currentPage.value > 1) currentPage.value--;
}

// Reset page when filters change



onMounted(() => {
  checkAuth();
  fetchOrders();
});
</script>


<template>
  <AdminSidebar />
  <div class="admin-transactions">

    <main class="content-container">

      <!-- Total Revenue Section -->
      <section class="total-revenue-section">
        <div class="card revenue-summary">
          <h2 class="section-title">Total Revenue</h2>
          <p class="revenue-amount">₹ {{ formattedTotalRevenue }}</p>
          <p class="transactions-count">{{ filteredOrders.length }} Transactions</p>
        </div>

        <div class="card revenue-chart-container">
          <div class="chart-controls">
            <div class="control-group">
              <label for="chartType">Chart Type</label>
              <select id="chartType" v-model="chartType" @change="generateChart">
                <option value="line">Line Chart</option>
                <option value="pie">Pie Chart</option>
              </select>
            </div>

            <div class="control-group">
              <label for="graphTimeRange">Time Range</label>
              <select id="graphTimeRange" v-model="graphTimeRange" @change="generateChart">
                <option value="week">Last 7 Days</option>
                <option value="month">Last 30 Days</option>
                <option value="year">Last 365 Days</option>
                <option value="all">All Time</option>
              </select>
            </div>
          </div>

          <v-chart :option="chartOption" autoresize style="height: 350px;"></v-chart>
        </div>
      </section>

      <!-- Filters Section -->
      <section class="filters-section">
        <div class="filter-group">
          <label for="timeFilter">Filter by Time</label>
          <select id="timeFilter" v-model="timeFilter" @change="applyFilters">
            <option value="all">All Time</option>
            <option value="week">Last 7 Days</option>
            <option value="month">Last 30 Days</option>
            <option value="year">Last 365 Days</option>
          </select>
        </div>

        <div class="filter-group search-group">
          <label for="searchInput">Search</label>
          <input
            id="searchInput"
            type="text"
            placeholder="Template Name or User ID"
            v-model="searchQuery"
            @input="applyFilters"
          />
        </div>
      </section>

      <!-- Transactions Table Section -->
       <section class="transactions-table-section">
    <table class="transactions-table">
      <thead>
        <tr>
          <th>ID</th>
          <th>Template Name</th>
          <th>Start Date</th>
          <th>End Date</th>
          <th>Days</th>
          <th>Total Price (₹)</th>
          <th>User ID</th>
          <th>Template ID</th>
          <th>Created At</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="order in paginatedOrders" :key="order.id" tabindex="0">
          <td>{{ order.id }}</td>
          <td>{{ order.name }}</td>
          <td>{{ order.start_date }}</td>
          <td>{{ order.end_date }}</td>
          <td>{{ order.days }}</td>
          <td>{{ order.total_price }}</td>
          <td>{{ order.user_id }}</td>
          <td>{{ order.template_id }}</td>
          <td>{{ formatDate(order.created_at) }}</td>
        </tr>
      </tbody>
    </table>

    <p v-if="paginatedOrders.length === 0" class="no-data">No transactions found.</p>

    <!-- Pagination controls -->
    <div class="pagination-controls">
      <button
        @click="prevPage"
        :disabled="currentPage === 1"
        aria-label="Previous Page"
        class="pagination-btn"
      >
        Previous
      </button>

      <span class="page-info">
        Page {{ currentPage }} of {{ totalPages }}
      </span>

      <button
        @click="nextPage"
        :disabled="currentPage === totalPages || totalPages === 0"
        aria-label="Next Page"
        class="pagination-btn"
      >
        Next
      </button>
    </div>
  </section>

    </main>
  </div>
</template>

<style scoped>
.admin-transactions {
  display: flex;
  margin-left: 65px;
  min-height: 100vh;
  background: #ffffff;
  color: #2c3e50;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.content-container {
  flex-grow: 1;
  padding: 30px 40px;
  max-width: 100%;
  margin: 0 auto;
}

.section-title {
  font-size: 1.75rem;
  font-weight: 700;
  margin-bottom: 15px;
  color: #1e293b;
}

.total-revenue-section {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 30px;
  margin-bottom: 40px;
}

.card {
  background: #ffffff;
  padding: 30px 25px;
  border-radius: 12px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.07);
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.revenue-summary {
  text-align: center;
  color: #0f172a;
}

.revenue-amount {
  font-size: 3rem;
  font-weight: 800;
  margin: 10px 0 5px;
  color: #16a34a; /* green */
  letter-spacing: 1.2px;
}

.transactions-count {
  font-weight: 600;
  font-size: 1.1rem;
  color: #475569;
}

.revenue-chart-container {
  position: relative;
  display: flex;
  flex-direction: column;
}

.chart-controls {
  display: flex;
  gap: 24px;
  margin-bottom: 18px;
  justify-content: flex-end;
  flex-wrap: wrap;
}

.control-group {
  display: flex;
  flex-direction: column;
  font-weight: 600;
  color: #334155;
  font-size: 0.9rem;
  min-width: 150px;
}

.control-group label {
  margin-bottom: 6px;
}

.control-group select {
  padding: 8px 12px;
  font-size: 1rem;
  border-radius: 8px;
  border: 1.8px solid #cbd5e1;
  background-color: #f8fafc;
  transition: border-color 0.2s ease-in-out;
}

.control-group select:focus {
  outline: none;
  border-color: #2563eb;
  box-shadow: 0 0 6px rgba(37, 99, 235, 0.4);
}

.filters-section {
  display: flex;
  gap: 24px;
  margin-bottom: 30px;
  flex-wrap: wrap;
  justify-content: center;
}

.filter-group {
  display: flex;
  flex-direction: column;
  min-width: 200px;
  font-weight: 600;
  color: #334155;
}

.filter-group label {
  margin-bottom: 6px;
  font-size: 0.9rem;
}

.filter-group select,
.filter-group input {
  padding: 10px 14px;
  border-radius: 8px;
  border: 1.8px solid #cbd5e1;
  font-size: 1rem;
  background-color: #fff;
  transition: border-color 0.2s ease-in-out;
}

.filter-group select:focus,
.filter-group input:focus {
  outline: none;
  border-color: #2563eb;
  box-shadow: 0 0 6px rgba(37, 99, 235, 0.4);
}

.search-group {
  flex-grow: 1;
  max-width: 450px;
}

.transactions-table-section {
  overflow-x: auto;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.06);
  padding: 15px 20px;
}

.transactions-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.95rem;
  color: #334155;
  min-width: 900px;
}

.transactions-table thead tr {
  background: #2563eb;
  color: white;
  text-transform: uppercase;
  font-weight: 700;
}

.transactions-table th,
.transactions-table td {
  padding: 14px 18px;
  border-bottom: 1px solid #e2e8f0;
  text-align: left;
  white-space: nowrap;
}

.transactions-table tbody tr:hover,
.transactions-table tbody tr:focus {
  background-color: #e0f2fe;
  outline: none;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.no-data {
  margin-top: 20px;
  color: #64748b;
  font-style: italic;
  text-align: center;
}

/* Responsive */
@media (max-width: 900px) {
  .total-revenue-section {
    grid-template-columns: 1fr;
    gap: 20px;
  }

  .chart-controls {
    justify-content: center;
  }

  .filters-section {
    justify-content: flex-start;
  }

  .search-group {
    max-width: 100%;
    flex-grow: unset;
  }
}

.pagination-controls {
  margin-top: 18px;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
}

.pagination-btn {
  background-color: #2563eb;
  color: white;
  border: none;
  padding: 10px 18px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  user-select: none;
  transition: background-color 0.3s ease;
}

.pagination-btn:disabled {
  background-color: #94a3b8;
  cursor: not-allowed;
}

.pagination-btn:not(:disabled):hover {
  background-color: #1e40af;
}

.page-info {
  font-weight: 600;
  font-size: 1rem;
  color: #475569;
  user-select: none;
}
</style>
