
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useConfirmStore = defineStore('confirm', () => {
  const visible = ref(false)
  const message = ref('')
  let resolver = null

  function show(msg) {
    message.value = msg
    visible.value = true
    return new Promise((resolve) => {
      resolver = resolve
    })
  }

  function confirm() {
    visible.value = false
    resolver?.(true)
  }

  function cancel() {
    visible.value = false
    resolver?.(false)
  }

  return {
    visible,
    message,
    show,
    confirm,
    cancel
  }
})
