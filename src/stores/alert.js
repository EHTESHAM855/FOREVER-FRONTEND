import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAlertStore = defineStore('alert', () => {
  const message = ref('')
  const type = ref('') // 'success' or 'error'
  const visible = ref(false)

  function show(msg, msgType = 'success',duration = 4000) {
    message.value = msg
    type.value = msgType
    visible.value = true
    if (duration > 0) {
    setTimeout(() => {
      hide()
    }, duration)
  }
  }

  function hide() {
    visible.value = false
    message.value = ''
  }
  

  return { message, type, visible, show, hide }
})
