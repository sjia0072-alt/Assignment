<!-- src/components/LoginForm.vue -->
<template>
  <form @submit.prevent="handleRegister">
    <div class="mb-3">
      <label for="name" class="form-label">Name</label>
      <input type="text" class="form-control" id="name" placeholder="Your name" required v-model="formData.name" />
    </div>
    <div class="mb-3">
      <label for="email" class="form-label">Email</label>
      <input type="email" class="form-control" id="email" placeholder="name@example.com" required
        v-model="formData.email" />
    </div>
    <div class="mb-3">
      <label for="password" class="form-label">Password</label>
      <input type="password" class="form-control" id="password" required v-model="formData.password" />
    </div>
    <div class="mb-3">
      <label for="confirm" class="form-label">Confirm Password</label>
      <input type="password" class="form-control" id="confirm" required v-model="formData.confirm" />
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
import { register } from '@/service/auth';
import { ref } from 'vue';
const errorMsg = ref('');
const emit = defineEmits(['login-success']);
const formData = ref({
  name: '',
  email: '',
  password: '',
  confirm: '',
});
async function handleRegister() {
  const form = formData.value;

  // Clear previous error messages
  errorMsg.value = '';

  // Basic validation
  if (!form.name || !form.email || !form.password || !form.confirm) {
    errorMsg.value = 'Please fill in all required fields';
    return;
  }

  // Password validation
  if (form.password !== form.confirm) {
    errorMsg.value = 'Passwords do not match';
    return;
  }

  // Password strength validation (minimum 6 characters)
  if (form.password.length < 6) {
    errorMsg.value = 'Password must be at least 6 characters long';
    return;
  }

  try {
    await register(form.name, form.email, form.password);
    console.log("Register Successful.")
    // Optionally, you can redirect to login page or show success message
    // router.push({ name: 'login' });
  } catch (error) {
    console.error(error);
    // Provide user-friendly error messages based on Firebase error codes
    switch (error.code) {
      case 'auth/invalid-email':
        errorMsg.value = "Please enter a valid email address";
        break;
      case 'auth/email-already-in-use':
        errorMsg.value = "This email is already registered. Please use a different email or login";
        break;
      case 'auth/weak-password':
        errorMsg.value = "Password is too weak. Please use a stronger password";
        break;
      case 'auth/network-request-failed':
        errorMsg.value = "Network connection failed. Please check your network and try again";
        break;
      case 'auth/internal-error':
        errorMsg.value = "Internal system error. Please try again later";
        break;
      default:
        errorMsg.value = "Registration failed. Please try again later";
        break;
    }
  }
}
</script>

<style scoped></style>
