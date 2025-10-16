<template>
</template>

<script setup>
import { onMounted } from 'vue';
import { loadAll } from '@/service/store';

onMounted(async () => {
  // Completely replace the entire page content
  document.documentElement.innerHTML = '';
  try {
    // Load all health recommendations from Firestore
    const recommendations = await loadAll('healthRecommendations');

    // Create JSON response
    const response = {
      success: true,
      data: recommendations,
      total: recommendations.length,
      timestamp: new Date().toISOString()
    };

    // Replace entire body content with JSON
    document.body.innerHTML = `<pre>${JSON.stringify(response, null, 2)}</pre>`;

  } catch (error) {
    // Return error response
    const errorResponse = {
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    };

    document.body.innerHTML = `<pre>${JSON.stringify(errorResponse, null, 2)}</pre>`;
  }
});
</script>
