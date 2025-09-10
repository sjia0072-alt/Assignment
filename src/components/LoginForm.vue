<!-- src/components/LoginForm.vue -->
<template>
  <form @submit.prevent="handleLogin">
    <div class="mb-3">
      <label for="email" class="form-label">Email</label>
      <input type="email" class="form-control" id="email" placeholder="name@example.com" required v-model="email" />
    </div>
    <div class="mb-3">
      <label for="password" class="form-label">Password</label>
      <input type="password" class="form-control" id="password" required v-model="password" />
    </div>
    <div v-if="errorMsg" class="mb-3 text-danger">
      {{ errorMsg }}
    </div>
    <div class="hstack mb-3">
      <div class="ms-auto">
        <router-link :to="{ name: 'register' }" active-class="active-link">Sign up</router-link>
      </div>
    </div>
    <div class="d-grid gap-2">
      <button type="submit" class="btn btn-primary">Login</button>
    </div>
  </form>
</template>

<script setup>

import { ref } from 'vue';
import users from '@/data/users.json';

const email = ref('');
const password = ref('');
const errorMsg = ref('');

const emit = defineEmits(['login-success']);

function handleLogin() {
  for (const user of users) {
    if (user.email == email.value && user.password == password.value) {
      const loggedInUser = {
        name: user.name,
        email: user.email,
        role: user.role
      };
      localStorage['user'] = JSON.stringify(loggedInUser);
      emit('login-success', loggedInUser)
      errorMsg.value = '';
      return;
    }
  }
  errorMsg.value = "Password mismatch"
}
</script>

<style scoped></style>
