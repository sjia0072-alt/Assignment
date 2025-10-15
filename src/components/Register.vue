<!-- src/components/LoginForm.vue -->
<template>
  <form @submit.prevent="handleRegister" novalidate>
    <fieldset>
      <legend class="visually-hidden">Registration Form</legend>
      <div class="mb-3">
        <label for="name" class="form-label">Name <span class="text-danger">*</span></label>
        <input type="text" class="form-control" id="name" placeholder="Your name" required v-model="formData.name"
          autocomplete="name" aria-describedby="name-error" />
        <div id="name-error" class="invalid-feedback d-none" v-if="errorMsg && errorMsg.includes('name')">
          {{ errorMsg }}
        </div>
      </div>
      <div class="mb-3">
        <label for="email" class="form-label">Email <span class="text-danger">*</span></label>
        <input type="email" class="form-control" id="email" placeholder="name@example.com" required
          v-model="formData.email" autocomplete="email" aria-describedby="email-error" />
        <div id="email-error" class="invalid-feedback d-none" v-if="errorMsg && errorMsg.includes('email')">
          {{ errorMsg }}
        </div>
      </div>
      <div class="mb-3">
        <label for="password" class="form-label">Password <span class="text-danger">*</span></label>
        <input type="password" class="form-control" id="password" required v-model="formData.password"
          autocomplete="new-password" aria-describedby="password-error password-requirements"
          aria-invalid="errorMsg && errorMsg.includes('password') ? 'true' : 'false'" />
        <div id="password-requirements" class="form-text">
          Password must be at least 6 characters long
        </div>
        <div id="password-error" class="invalid-feedback d-none" v-if="errorMsg && errorMsg.includes('password')">
          {{ errorMsg }}
        </div>
      </div>
      <div class="mb-3">
        <label for="confirm" class="form-label">Confirm Password <span class="text-danger">*</span></label>
        <input type="password" class="form-control" id="confirm" required v-model="formData.confirm"
          autocomplete="new-password" aria-describedby="confirm-error" />
        <div id="confirm-error" class="invalid-feedback d-none" v-if="errorMsg && errorMsg.includes('match')">
          {{ errorMsg }}
        </div>
      </div>
      <div
        v-if="errorMsg && !errorMsg.includes('name') && !errorMsg.includes('email') && !errorMsg.includes('password') && !errorMsg.includes('match')"
        class="mb-3 alert alert-danger" role="alert">
        {{ errorMsg }}
      </div>
      <div class="hstack mb-3">
        <div class="ms-auto">
          Already have an account? <router-link :to="{ name: 'login' }" class="link-primary">Sign in</router-link>
        </div>
      </div>
      <div class="d-grid gap-2">
        <button type="submit" class="btn btn-primary" aria-label="Submit registration form">Sign Up</button>
      </div>
    </fieldset>
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
