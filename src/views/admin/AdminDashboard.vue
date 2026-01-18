<template>
  <AdminSidebar />
  <div class="admin-dashboard">
    <main class="admin-main-content">
      <section class="dashboard-header">
        <h1><fa-icon icon="tachometer-alt" /> Overview</h1>
      </section>

      <!-- Stat Cards -->
      <section class="stat-cards">
        <div class="stat-card users">
          <div class="icon-wrapper"><fa-icon icon="users" /></div>
          <h3>Total Users</h3>
          <p>{{ dashboardData?.total_users ?? '—' }}</p>
        </div>
        <div class="stat-card templates">
          <div class="icon-wrapper"><fa-icon icon="file-alt" /></div>
          <h3>Templates</h3>
          <p>{{ dashboardData?.total_templates ?? '—' }}</p>
        </div>
        <div class="stat-card visits">
          <div class="icon-wrapper"><fa-icon icon="chart-line" /></div>
          <h3>Site Visits</h3>
          <p>{{ dashboardData?.total_visits ?? '—' }}</p>
        </div>
        <div class="stat-card feedback">
          <div class="icon-wrapper"><fa-icon icon="comments" /></div>
          <h3>Feedback</h3>
          <p>{{ dashboardData?.total_feedback ?? '—' }}</p>
        </div>
        <div class="stat-card users">
          <div class="icon-wrapper"><fa-icon icon="phone" /></div>
          <h3>Connections</h3>
          <p style="font-size: large; margin: 0;">Contacts - {{ dashboardData?.contact_count ?? '—' }}</p>
          <p style="font-size: large; margin: 0;">Reports - {{ dashboardData?.report_count ?? '—' }}</p>
        </div>
      </section>

      <!-- Recent Activity -->
      <section class="recent-activity">
        <h2><fa-icon icon="history" /> Recent Activity</h2>
        <ul>
          <li v-for="(item, index) in dashboardData?.recent_activity || []" :key="index">
            <fa-icon icon="angle-right" /> {{ item }}
          </li>
        </ul>
      </section>

      <section class="charts-section">
        <h2><fa-icon icon="chart-bar" /> Analytics</h2>
        <div class="charts-grid">
          <div class="chart-box">
            <div class="chart-header">
              <h3><fa-icon icon="clipboard-check" /> Templates Published</h3>
              <select v-model="selectedPublishedRange" @change="updateCharts">
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
                <option value="lifetime">Lifetime</option>
              </select>
            </div>
            <div ref="barChartRef" class="chart"></div>
          </div>

          <div class="chart-box">
            <div class="chart-header">
              <h3><fa-icon icon="eye" /> Site Visits</h3>
              <select v-model="selectedVisitType" @change="fetchSiteVisitData">
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
                <option value="lifetime">Lifetime</option>
              </select>
            </div>
            <div ref="lineChartRef" class="chart"></div>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup>
import AdminSidebar from '@/components/AdminSidebar.vue';
import { useRouter } from 'vue-router';
import * as echarts from 'echarts';
import { ref, onMounted } from 'vue';
import { useAlertStore } from '@/stores/alert'; 

const BACKEND_BASE = import.meta.env.VITE_API_URL

// FontAwesome icons
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faUsers, faFileAlt, faChartLine, faComments, faHistory, faAngleRight, faTachometerAlt, faClipboardCheck, faEye, faChartBar, faPhone } from '@fortawesome/free-solid-svg-icons'
import { library } from '@fortawesome/fontawesome-svg-core'
library.add(faUsers, faFileAlt, faChartLine, faComments, faHistory, faAngleRight, faTachometerAlt, faClipboardCheck, faEye, faChartBar, faPhone)

const faIcon = FontAwesomeIcon

const router = useRouter();
const alert = useAlertStore();

const barChartRef = ref(null);
const lineChartRef = ref(null);
const barChartInstance = ref(null);
const lineChartInstance = ref(null);
const selectedPublishedRange = ref('monthly');
const dashboardData = ref(null);

const selectedVisitType = ref('weekly');
const siteVisitLabels = ref([]);
const siteVisitData = ref([]);

const checkAuth = async () => {
  try {
    const res = await fetch(`${BACKEND_BASE}/api/check-admin-session`, { credentials: "include" });
    if (!res.ok) {
      alert.show('Authentication failed. Please login.', 'error');
      router.push('/admin/login');
    }
  } catch (err) {
    alert.show('Network error during authentication check.', 'error');
    router.push('/admin/login');
  }
};

const fetchDashboardData = async () => {
  try {
    const res = await fetch(`${BACKEND_BASE}/api/admin/dashboard-data`, { credentials: "include" });
    if (res.ok) {
      const data = await res.json();
      dashboardData.value = data;
      updateCharts();
    } else {
      const data = await res.json().catch(() => null);
      alert.show(data?.message || 'Failed to load dashboard data.', 'error');
    }
  } catch (err) {
    console.error(err);
    alert.show('Error fetching dashboard data.', 'error');
  }
};

const fetchSiteVisitData = async () => {
  try {
    const res = await fetch(`${BACKEND_BASE}/api/admin/site-visits?range=${selectedVisitType.value}`, { credentials: 'include' });
    if (res.ok) {
      const data = await res.json();
      siteVisitLabels.value = data.labels;
      siteVisitData.value = data.data;
      lineChartInstance.value?.clear();
      updateCharts();
    } else {
      const data = await res.json().catch(() => null);
      alert.show(data?.message || 'Failed to load site visit data.', 'error');
    }
  } catch (err) {
    console.error(err);
    alert.show('Error fetching site visit data.', 'error');
  }
};

const updateCharts = () => {
  if (!dashboardData.value) return;

  // Bar chart setup
  const barChart = echarts.init(barChartRef.value);
  barChartInstance.value = barChart;
  const barData = dashboardData.value?.published_stats?.[selectedPublishedRange.value] || [];

  let barLabels = [];
  if (selectedPublishedRange.value === 'monthly') {
    barLabels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  } else if (selectedPublishedRange.value === 'yearly') {
    const currentYear = new Date().getFullYear();
    barLabels = Array.from({ length: 5 }, (_, i) => (currentYear - 4 + i).toString());
  } else if (selectedPublishedRange.value === 'weekly') {
    const today = new Date();
    barLabels = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(today);
      date.setDate(today.getDate() - 6 + i);
      return date.toLocaleDateString('en-IN', { weekday: 'short' });
    });
  } else if (selectedPublishedRange.value === 'lifetime') {
    barLabels = ['Total Published'];
  }

  barChart.setOption({
    tooltip: {},
    xAxis: { data: barLabels, axisLine: { lineStyle: { color: '#495057' } }, axisTick: { show: false } },
    yAxis: { axisLine: { lineStyle: { color: '#495057' } }, splitLine: { lineStyle: { color: '#e9ecef' } } },
    series: [{
      name: 'Templates',
      type: 'bar',
      data: selectedPublishedRange.value === 'lifetime' ? [barData] : barData,
      itemStyle: {
        color: '#4a90e2',
        borderRadius: [6, 6, 0, 0],
        shadowColor: '#4a90e233',
        shadowBlur: 12,
      },
      emphasis: {
        itemStyle: { color: '#357ABD' },
      },
    }],
  });

  // Line chart setup
  const lineChart = echarts.init(lineChartRef.value);
  lineChartInstance.value = lineChart;
  lineChart.setOption({
    tooltip: { trigger: 'axis' },
    xAxis: {
      type: 'category',
      data: siteVisitLabels.value,
      axisLine: { lineStyle: { color: '#495057' } },
      axisTick: { show: false },
    },
    yAxis: {
      type: 'value',
      axisLine: { lineStyle: { color: '#495057' } },
      splitLine: { lineStyle: { color: '#e9ecef' } },
    },
    series: [{
      data: siteVisitData.value,
      type: 'line',
      smooth: true,
      lineStyle: {
        color: '#10b981',
        width: 3,
        shadowColor: '#10b98166',
        shadowBlur: 10,
      },
      areaStyle: {
        color: '#10b98133',
      },
      emphasis: {
        focus: 'series',
      },
    }],
  });
};

onMounted(() => {
  checkAuth();
  fetchDashboardData();
  fetchSiteVisitData();
});
</script>


<style scoped>
.admin-dashboard {
  margin-left: 65px;
  display: flex;
  height: 100vh;
  background: linear-gradient(135deg, #f8fafc 0%, #e9f0f7 100%);
}

.admin-main-content {
  flex: 1;
  padding: 30px 40px;
  overflow-y: auto;
  background: #fff;
  border-top-left-radius: 20px;
  box-shadow: 0 8px 24px rgb(0 0 0 / 0.10);
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.dashboard-header h1 {
  font-size: 2.4rem;
  font-weight: 700;
  color: #222;
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 1px solid rgb(184, 177, 177);
}


.stat-cards {
  display: flex;
  gap: 25px;
  flex-wrap: wrap;
  margin-bottom: 45px;
}

.stat-card {
  flex: 1 1 220px;
  background: #f9fafb;
  height: auto;
  padding: 30px 20px 25px;
  border-radius: 15px;
  text-align: center;
  box-shadow: 0 4px 20px rgb(34 34 34 / 0.06);
  transition: all 0.25s ease-in-out;
  border-left: 6px solid transparent;
  cursor: default;
  position: relative;
}

.stat-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 10px 30px rgb(34 34 34 / 0.1);
}

.stat-card h3 {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 15px;
  color: #374151;
}

.stat-card p {
  font-size: 2.2rem;
  font-weight: 700;
  color: #1e40af;
  letter-spacing: 1px;
}

.stat-card .icon-wrapper {
  position: absolute;
  top: 22px;
  left: 22px;
  font-size: 2.4rem;
  color: #2563eb;
  opacity: 0.2;
}

.stat-card.users {
  border-left-color: #10b981;
}

.stat-card.users .icon-wrapper {
  color: #10b981;
}

.stat-card.templates {
  border-left-color: #f97316;
}

.stat-card.templates .icon-wrapper {
  color: #f97316;
}

.stat-card.visits {
  border-left-color: #0ea5e9;
}

.stat-card.visits .icon-wrapper {
  color: #0ea5e9;
}

.stat-card.feedback {
  border-left-color: #8b5cf6;
}

.stat-card.feedback .icon-wrapper {
  color: #8b5cf6;
}

.recent-activity {
  margin-bottom: 40px;
  color: #374151;
}

.recent-activity h2 {
  font-weight: 700;
  font-size: 1.8rem;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.recent-activity ul {
  list-style: none;
  padding: 0;
  max-height: 140px;
  overflow-y: auto;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  background: #f3f4f6;
}

.recent-activity li {
  padding: 10px 20px;
  border-bottom: 1px solid #d1d5db;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 1rem;
}

.recent-activity li:last-child {
  border-bottom: none;
}

.charts-section {
  margin-bottom: 50px;
}

.charts-section h2 {
  font-weight: 700;
  font-size: 1.9rem;
  margin-bottom: 25px;
  display: flex;
  align-items: center;
  gap: 10px;
  color: #111827;
}

.charts-grid {
  display: flex;
  gap: 35px;
  flex-wrap: wrap;
}

.chart-box {
  flex: 1 1 480px;
  background: #fff;
  padding: 25px 30px;
  border-radius: 18px;
  box-shadow: 0 8px 30px rgb(0 0 0 / 0.06);
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.chart-header h3 {
  font-weight: 600;
  font-size: 1.3rem;
  display: flex;
  align-items: center;
  gap: 8px;
  color: #374151;
}

.chart-header select {
  background: #f3f4f6;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  padding: 6px 14px;
  font-weight: 500;
  color: #4b5563;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.chart-header select:hover {
  background: #e5e7eb;
}

.chart {
  height: 280px;
  width: 100%;
}
</style>
