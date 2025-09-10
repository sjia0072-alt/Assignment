<!-- src/components/LoginForm.vue -->
<template>
  <form @submit.prevent="handleRegister">
    <div class="mb-3">
      <label for="name" class="form-label">Name</label>
      <input type="text" class="form-control" id="name" placeholder="Your name" required v-model="name" />
    </div>
    <div class="mb-3">
      <label for="email" class="form-label">Email</label>
      <input type="email" class="form-control" id="email" placeholder="name@example.com" required v-model="email" />
    </div>
    <div class="mb-3">
      <label for="password" class="form-label">Password</label>
      <input type="password" class="form-control" id="password" required v-model="password" />
    </div>
    <div class="mb-3">
      <label for="confirm" class="form-label">Confirm Password</label>
      <input type="password" class="form-control" id="confirm" required v-model="confirm" />
    </div>
    <div v-if="errorMsg" class="mb-3 text-danger">
      {{ errorMsg }}
    </div>
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
import { ref } from 'vue';
const errorMsg = ref('');
const emit = defineEmits(['login-success']);
const formData = ref({
  name: '',
  email: '',
  password: '',
  confirm: ''
});
function handleRegister() {
  if (formData.password !== formData.confirm) {
    errorMsg.value = 'Password mismatch';
    return;
  }



}
</script>

<style scoped></style>
