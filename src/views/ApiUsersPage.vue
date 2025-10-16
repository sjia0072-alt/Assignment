<template>
</template>

<script setup>
import { onMounted } from 'vue';
import { loadAll } from '@/service/store';

onMounted(async () => {
  // Completely replace the entire page content
  document.documentElement.innerHTML = '';
  try {
    // Load all users from Firestore
    const users = await loadAll('users');

    // Create JSON response
    const response = {
      success: true,
      data: users,
      total: users.length,
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
