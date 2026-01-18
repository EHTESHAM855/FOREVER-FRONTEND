<template>

      <!-- Welcome Section -->
      <section class="user-summary">
        <div class="user-info">
          <lucide-icon name="user" class="icon" />
          <div>
            <h2>{{ user.first_name }} {{ user.last_name }}</h2>
            <p><Mail class="icon-inline" /> {{ user.email }}</p>
            <p><CalendarArrowDown class="icon-inline" /> Member since: {{ formattedDate }}</p>

          </div>
        </div>
      </section>

      <!-- Stats Cards -->
      <section class="stats-cards">
        <div class="card" v-for="(stat, index) in stats" :key="stat.label">
          <component :is="iconMap[stat.icon] || BarChart2" class="card-icon" />
          <h3 class="label">{{ stat.label }}</h3>
          <hr class="divider" />
          <p class="value">
            {{ typeof animatedValues[index] === 'number' ? animatedValues[index] : stat.value }}
          </p>
        </div>
      </section>

      <!-- Visitor Analytics -->
      <section class="analytics">
        <div class="analytics-header">
          <Activity class="analytics-icon" />
          <h2>Visitor Analytics</h2>
        </div>
          <hr class="divider" />


        <div class="controls">
          <label class="control-item">
            <span>Template</span>
            <select v-model="selectedTemplateId">
              <option v-for="tpl in Templates" :key="tpl.id" :value="tpl.id">
                {{ tpl.name }}
              </option>
            </select>
          </label>

          <label class="control-item">
            <span>Range</span>
            <select v-model="selectedRange">
              <option value="day">Daily</option>
              <option value="month">Monthly</option>
              <option value="year">Yearly</option>
            </select>
          </label>
        </div>

        <div ref="chartEl" class="chart-container">
  <p v-if="chartData.length === 0" style="text-align:center; color:#999;">No data available</p>
</div>
      </section>

</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue';
const BACKEND_BASE = import.meta.env.VITE_API_URL
import * as echarts from 'echarts';
import {useRouter} from 'vue-router';
import { Eye, IndianRupee, ChevronsLeftRightEllipsis, Pencil,Activity,CalendarArrowDown,Mail } from 'lucide-vue-next'
const router = useRouter(); 
const iconMap = {
  eye: Eye,
  rupee: IndianRupee,
  published: ChevronsLeftRightEllipsis,
  pencil: Pencil,
}

const verified = ref(false);
const user = ref({});
const fetchUser = async () => {
  try {
    const res = await fetch(`${BACKEND_BASE}/api/user/me`, {
      credentials: "include"
    });

    if (!res.ok) {
      if (res.status === 401) {
        router.push("/login");
      } else {
        throw new Error("Unexpected error");
      }
    }

    const data = await res.json();
    user.value = data.user;
    verified.value = data.user.verified;
    if(!verified.value){
    router.push('/verify-email');
  }
  } catch (err) {
    console.error("Error fetching user:", err);
  }
};

const formattedDate = computed(() => {
  if (!user.value.registered_on) return '';
  return new Date(user.value.registered_on).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric'
  });
});


const stats = computed(() => [
  { label: "Templates Edited", value: user.value.templates_edit_count || 0, icon: 'pencil' },
  { label: "Total Visitors", value: user.value.visitors_count || 0, icon: 'eye' },
  { label: "Pages Published", value: user.value.templates_published_count || 0, icon: 'published' },
  { label: "Total Spend (₹)", value: user.value.total_spent || 0, icon: 'rupee' }
]);



const Templates = ref([])
const selectedTemplateId = ref()
const selectedRange = ref('day')
const chartData = ref([])
const lineChartInstance = ref(null);
const chartEl = ref(null);

// Fetch list of templates (from /api/page)
async function fetchTemplates() {
  try {
    const res = await fetch(`${BACKEND_BASE}/api/page`, { credentials: "include" })
    const data = await res.json()
    Templates.value = data
    if (data.length > 0) {
      selectedTemplateId.value = data[0].id
      await fetchChart()
    }
  } catch (err) {
    console.error('Error fetching templates:', err)
  }
}

// Fetch analytics data
async function fetchChart() {
  if (!selectedTemplateId.value) return
  try {
    const res = await fetch(
      `${BACKEND_BASE}/api/visit-analytics?template_id=${selectedTemplateId.value}&range=${selectedRange.value}`, { credentials: "include" }
    )
    const json = await res.json()
    chartData.value = json.data
    renderChart()
  } catch (err) {
    console.error('Error fetching chart data:', err)
  }
}
function getFormattedXLabels(data, range) {
  return data.map(entry => {
    const date = new Date(entry.period);
    if (range === 'year') {
      // Show month name like "Jan", "Feb", etc.
      return date.toLocaleString('default', { month: 'short' });
    } else if (range === 'day') {
      // Show weekday like "Mon", "Tue", etc.
      return date.toLocaleDateString('en-US', { weekday: 'short' });
    } else {
      // Default: full date or custom format
      return entry.period;
    }
  });
}

function renderChart() {
  if (!chartEl.value) return;

  // Dispose existing chart instance if already created
  if (lineChartInstance.value) {
    lineChartInstance.value.dispose();
  }

  const xData = getFormattedXLabels(chartData.value, selectedRange.value);
  const yData = chartData.value.map(entry => entry.count);

  const chart = echarts.init(chartEl.value);
  lineChartInstance.value = chart;

  chart.setOption({
    tooltip: { trigger: 'axis' },
    xAxis: {
      type: 'category',
      data: xData,
      axisLine: { lineStyle: { color: '#ccc' } },
    },
    yAxis: {
      type: 'value',
      axisLine: { lineStyle: { color: '#ccc' } },
    },
    series: [{
      data: yData,
      type: 'line',
      smooth: true,
      lineStyle: {
        color: '#cc3366',
        width: 4,
        shadowColor: '#19875466',
        shadowBlur: 15,
      },
      itemStyle: {
        color: '#198754',
      },
      areaStyle: {
        color: '#19875433',
      },
    }],
  });
}



// Re-fetch chart if either input changes
watch([selectedTemplateId, selectedRange], fetchChart)


const animatedValues = ref(stats.value.map(() => 0))



const animation = () => {
  stats.value.forEach((stat, index) => {
    let current = 0
    const target = parseInt(stat.value)
    if (!isNaN(target)) {
      const step = Math.ceil(target / 50)
      const interval = setInterval(() => {
        current += step
        if (current >= target) {
          current = target
          clearInterval(interval)
        }
        animatedValues.value[index] = current
      }, 30)
    } else {
      animatedValues.value[index] = stat.value
    }
  })
  
}


onMounted(async ()  => {
  await fetchUser();
  fetchTemplates();
  animation();
  
});
</script>

<style scoped>



.user-summary {
  background: #ffffff;
  /* padding: 1.5rem; */
  
  border-radius: 16px;
  margin-bottom: 2rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);
}

.user-info h2{

  text-transform: capitalize;

}

.user-info {
  display: flex;
  /* gap: 1.5rem; */
  align-items: center;
}

.user-info .icon {
  width: 48px;
  height: 48px;
  color: #7b7b7b;
}

.icon-inline {
  width: 16px;
  height: 16px;
  vertical-align: middle;
  margin-right: 6px;
  color: #d63384;
}


.stats-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 24px;
  padding: 0 0px;
  margin: 30px 0;
}

.card {
  background: #ffffff;
  border-radius: 20px;
  padding: 1.5rem 1.0rem;
  text-align: center;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.05);
  border: 1px solid #e5e7eb;
  transition: transform 0.25s ease;
}

.card:hover {
  transform: translateY(-4px);
}

.card-icon {
  width: 40px;
  height: 40px;
  color: #d63384;
  margin-bottom: 0.6rem;
}

.label {
  font-size: 1rem;
  color: #555;
  margin-bottom: 0.6rem;
  font-weight: 600;
}

.divider {
  width: 100%;
  height: 2px;
  margin: 0.5rem auto;
  border: none;
  background: #e0e0e0;
}

.value {
  font-size: 2rem;
  font-weight: 800;
  color: #d63384;
}


.analytics {
  background: #ffffff;
  padding: 2rem;
  border-radius: 20px;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.05);
  margin-top: 2rem;
}

.analytics-header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin-bottom: 1.5rem;
}

.analytics-header h2 {
  font-size: 2.4rem;
  font-weight: 700;
  color: #333;
}

.analytics-icon {
  width: 50px;
  height: 50px;
  color: #d63384;
}

.controls {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  margin-bottom: 1.5rem;
}

.control-item {
  display: flex;
  flex-direction: column;
  font-weight: 600;
  color: #444;
  font-size: 0.95rem;
}

.control-item select {
  margin-top: 6px;
  padding: 8px 12px;
  border-radius: 10px;
  border: 1px solid #ccc;
  background-color: #fff;
  font-size: 0.95rem;
  box-shadow: 0 2px 6px rgba(0,0,0,0.03);
}

.chart-container {
  width: 100%;
  height: 500px;
  padding: 1rem 0;
  background: #fff;
  border-radius: 16px;
  box-shadow: inset 0 0 0 1px #ececec;
}




@media (max-width: 768px) {
  .user-info {
    flex-direction: column;
    text-align: center;
  }

  .card {
    padding: 1rem;
  }
  
  .controls {
    flex-direction: column;
  }
}
</style>