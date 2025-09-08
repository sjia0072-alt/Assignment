<!-- src/components/LoginForm.vue -->
<template>
  <form>
    <div class="hstack mb-3">
      <div class="ms-auto">
        Already have an account? <router-link :to="{ name: 'login' }" active-class="active-link">Sign in</router-link>
      </div>
    </div>
    <div class="d-grid gap-2">
      <button type="submit" class="btn btn-primary">Sign Up</button>
    </div>
  </form>
</template>

<script setup>
</script>

<style scoped></style>
