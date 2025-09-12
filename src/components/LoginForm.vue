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
import { getUserInfo, login } from '@/service/auth';
import router from '@/router';

const email = ref('');
const password = ref('');
const errorMsg = ref('');

const emit = defineEmits(['login-success']);

async function handleLogin() {
  try {
    const userCred = await login(email.value, password.value);
    await getUserInfo(userCred.user)
    console.log("Login Successful.");
    router.push({ name: "user-info" })
  } catch (error) {
    errorMsg.value = "Password mismatch";
    console.error(error);
  }
}
</script>

<style scoped></style>
