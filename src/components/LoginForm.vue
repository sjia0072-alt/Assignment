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

import { ref, onMounted } from 'vue';
import { login } from '@/service/auth';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/service/firebase';

const email = ref('');
const password = ref('');
const errorMsg = ref('');

const emit = defineEmits(['login-success']);
const currentUser = ref(null)

onMounted(() => {
  onAuthStateChanged(auth, (user) => {
    currentUser.value = user
    console.log(user)
  })
})

async function handleLogin() {
  try {
    await login(email.value, password.value);
    console.log("Login Successful.");
  } catch (error) {
    errorMsg.value = "Password mismatch";
    console.error(error);
  }
}
</script>

<style scoped></style>
