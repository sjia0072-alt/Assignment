<script setup>
import BHeader from './components/BHeader.vue';
import Toast from 'primevue/toast';
</script>

<template>
  <Toast />
  <div class="d-flex flex-column min-vh-100">
    <a href="#main-content" class="skip-link visually-hidden-focusable">Skip to main content</a>
    <header role="banner">
      <b-header />
    </header>
    <main id="main-content" class="container flex-grow-1" role="main" tabindex="-1">
      <router-view />
    </main>
    <footer class="bg-light text-center py-3 mt-auto" role="contentinfo">
      <div class="container">
        <p class="mb-0 text-muted small">&copy; 2025 Health Advice Platform. All rights reserved.</p>
      </div>
    </footer>
  </div>
</template>

<style scoped>
.skip-link {
  position: absolute;
  top: -40px;
  left: 6px;
  background: #000;
  color: #fff;
  padding: 8px;
  text-decoration: none;
  z-index: 1000;
  border-radius: 4px;
}

.skip-link:focus {
  top: 6px;
}
</style>
