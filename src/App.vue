<script setup>
import { ref } from 'vue'
import BHeader from './components/BHeader.vue';
</script>

<template>
  <main class='container mt-5'>
    <b-header />
    <div>
      <router-view />
    </div>
  </main>
</template>

<style scoped></style>
