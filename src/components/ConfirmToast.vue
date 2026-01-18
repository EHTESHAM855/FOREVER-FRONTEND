<template>
  <Transition name="fade">
    <div v-if="confirm.visible" class="confirm-overlay" @click.self="confirm.cancel">
      <div class="confirm-toast">
        <div class="message">{{ confirm.message }}</div>
        <div class="actions">
          <button class="btn confirm" @click="confirm.confirm">Yes</button>
          <button class="btn cancel" @click="confirm.cancel">No</button>
        </div>
      </div>
    </div>
  </Transition>
</template>


<script setup>
import { useConfirmStore } from '@/stores/confirm'
const confirm = useConfirmStore()
</script>

<style scoped>
.confirm-toast {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(0, 0, 0, 0.06);
  border-radius: 16px;
  padding: 24px;
  z-index: 9999;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  max-width: 90vw;
  width: 100%;
  max-width: 380px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 18px;
  font-size: 15px;
  color: #333;
  animation: slideFadeIn 0.3s ease-out;
  text-align: center;
}

.message {
  font-weight: 500;
  line-height: 1.5;
  word-wrap: break-word;
}

.actions {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  justify-content: center;
}

.btn {
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  flex: 1 1 40%;
  min-width: 100px;
}

.confirm {
  background: linear-gradient(to right, #4ade80, #22c55e);
  color: white;
}

.cancel {
  background: linear-gradient(to right, #f87171, #ef4444);
  color: white;
}

.btn:hover {
  transform: scale(1.05);
  box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.05);
}

/* Fade + Slide Animation */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

.confirm-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(2px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9998;
  animation: fadeIn 0.2s ease;
}


@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}


@keyframes slideFadeIn {
  from {
    opacity: 0;
    transform: translate(-50%, -60%);
  }
  to {
    opacity: 1;
    transform: translate(-50%, -50%);
  }
}

/* Responsive Tweaks */
@media (max-width: 480px) {
  .confirm-toast {
    padding: 20px 16px;
    gap: 14px;
  }

  .btn {
    font-size: 13px;
    padding: 8px 16px;
  }
}
</style>
