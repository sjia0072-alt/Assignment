<script setup>
import BHeader from './components/BHeader.vue';
</script>

<template>
  <div class="d-flex flex-column min-vh-100">
    <header>
      <b-header />
    </header>
    <main class="container flex-grow-1">
      <router-view />
    </main>
    <footer class="bg-light text-center py-3 mt-auto">
      <div class="container">
        <p class="mb-0 text-muted small">&copy; 2025 Health Advice Platform. All rights reserved.</p>
      </div>
    </footer>
  </div>
</template>

<style scoped></style>
