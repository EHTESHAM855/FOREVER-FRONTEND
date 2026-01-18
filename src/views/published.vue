<template>
  <div class="preview-page">
    <div v-if="loading" class="loader-container">
      <loader />
    </div>
    <iframe 
      v-show="!loading"
      @load="onIframeLoad"
      id="preview-frame"
      :src="iframeSrc"
      class="preview-iframe"
      :style="{ width: iframeWidth, height: iframeHeight }"
      v-if="dataa.status==='active'"
    ></iframe>
    <ExpiredPage @load="onIframeLoad" v-else/>
  </div>
</template>



<script setup>
import { ref, computed, onMounted ,watch} from 'vue'
import loader from '@/components/loader.vue'
import {useRoute, useRouter} from 'vue-router';
import ExpiredPage from '@/components/ExpiredPage.vue';
const BACKEND_BASE = import.meta.env.VITE_API_URL



const dataa = ref({
    username : '',
    name : '',
    path : '',
    status : ''
});
const route = useRoute();
const router = useRouter();
watch(
    ()=> route.params.username,
    (newVal) => {
        dataa.value.username = newVal
    },
    {immediate: true}
);
watch(
    ()=> route.params.name,
    (newVal) => {
        dataa.value.name = newVal
    },
    {immediate: true}
);


const loading = ref(true)
const iframeWidth = '100vw'
const iframeHeight = '100vh'

const iframeSrc = computed(() => dataa.value.path);


const fetchpath = async () => {
    try {
        const res = await fetch(`${BACKEND_BASE}/api/page_feed/${dataa.value.username}/${dataa.value.name}`, {credentials:"include"});
        if(!res.ok){
            alert("Page Expired or not found");
            router.push("/expired");
            return;
        }
        const data = await res.json();
        dataa.value.path = data.path;
        dataa.value.status = data.status;
        console.log(data.status);
        console.log(dataa.value.status)
    } catch (err){
        console.error(err);
    }
};

const onIframeLoad = () => {
  loading.value = false;
};
onMounted(() => {
    fetchpath();
});

</script>


<style scoped>

.preview-page {
  height: 100vh;
  width: 100vw;
  background: linear-gradient(to right, #fff0f6, #ffe0f0);
  display: flex;
  align-items: center;
  justify-content: center;
  /* padding: 40px; */
  box-sizing: border-box;
  position: relative;
}

.preview-iframe {
  border: none;
  /* border-radius: 16px; */
  /* box-shadow: 0 12px 30px rgba(0, 0, 0, 0.2); */
  transition: opacity 0.3s ease-in-out;
  background-color: white;
}

.loader-container {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

</style>
