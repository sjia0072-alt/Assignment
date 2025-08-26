<script setup>
import LoginForm from './components/LoginForm.vue'
const loggedInUser = localStorage.getItem("user");
function logout() {
  localStorage.removeItem("user")
}
</script>

<template>
  <div v-if="loggedInUser">
    <div>
      You are currently logged in as {{ loggedInUser }}
    </div>
    <button @click="logout">Logout</button>
  </div>
  <div v-else>
    <LoginForm />
  </div>
</template>

<style scoped></style>
