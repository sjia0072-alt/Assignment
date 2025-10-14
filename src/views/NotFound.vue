<template>
  <div class="text-center mt-5">
    <h1 class="display-1">404</h1>
    <h2 class="mb-3">Page Not Found</h2>
    <p class="text-muted mb-4">
      The page you're looking for doesn't exist.
    </p>

    <p class="text-muted mb-4">
      Redirecting in {{ countdown }} seconds...
    </p>

    <div class="gap-2 d-flex justify-content-center">
      <button @click="goBack" class="btn btn-primary">
        Go Back
      </button>
      <button @click="goHome" class="btn btn-secondary">
        Home
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const countdown = ref(3)
let timer = null

onMounted(() => {
  startCountdown()
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})

function startCountdown() {
  timer = setInterval(() => {
    countdown.value--
    if (countdown.value <= 0) {
      clearInterval(timer)
      goHome()
    }
  }, 1000)
}

function goBack() {
  if (window.history.length > 1) {
    router.go(-1)
  } else {
    router.push('/')
  }
}

function goHome() {
  router.push('/')
}
</script>
