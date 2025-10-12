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
  // Clear previous error messages
  errorMsg.value = '';

  // Basic validation
  if (!email.value || !password.value) {
    errorMsg.value = "Please fill in all required fields";
    return;
  }

  try {
    const userCred = await login(email.value, password.value);
    await getUserInfo(userCred.user)
    console.log("Login Successful.");
    router.push({ name: "user-info" })
  } catch (error) {
    console.error(error);
    // Provide user-friendly error messages based on Firebase error codes
    switch (error.code) {
      case 'auth/invalid-email':
        errorMsg.value = "Please enter a valid email address";
        break;
      case 'auth/user-disabled':
        errorMsg.value = "This account has been disabled. Please contact administrator";
        break;
      case 'auth/user-not-found':
        errorMsg.value = "User does not exist. Please check your email or register first";
        break;
      case 'auth/wrong-password':
        errorMsg.value = "Incorrect password. Please try again";
        break;
      case 'auth/too-many-requests':
        errorMsg.value = "Too many login attempts. Please try again later";
        break;
      case 'auth/network-request-failed':
        errorMsg.value = "Network connection failed. Please check your network and try again";
        break;
      case 'auth/internal-error':
        errorMsg.value = "Internal system error. Please try again later";
        break;
      default:
        errorMsg.value = "Login failed. Please try again later";
        break;
    }
  }
}
</script>

<style scoped></style>
