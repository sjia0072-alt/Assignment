<script setup>
import { ref } from 'vue'
import LoginForm from './components/LoginForm.vue'
const loggedInUser = ref(null)
try {
  loggedInUser.value = JSON.parse(localStorage.getItem("user"));
} catch (e) {
  // remove mal-formed data
  localStorage.removeItem("user")
}
function logout() {
  localStorage.removeItem("user")
  loggedInUser.value = null
}

function login(user) {
  loggedInUser.value = user
}
</script>

<template>
  <main class='container mt-5'>
    <div v-if="loggedInUser" class="row justify-content-center">
      <div class="card shadow-lg col-lg-4 col-md-6">
        <div class="card-body text-center">
          <p class="card-text fs-5 mb-3">
            Welcome back, <strong>{{ loggedInUser.name }}</strong>!
          </p>
          <ul class="list-group list-group-flush mb-4">
            <li class="list-group-item d-flex justify-content-between align-items-center">
              <span>Email:</span>
              <span class="fw-bold">{{ loggedInUser.email }}</span>
            </li>
            <li class="list-group-item d-flex justify-content-between align-items-center">
              <span>Role:</span>
              <span class="badge bg-info text-dark fw-bold">{{ loggedInUser.role }}</span>
            </li>
          </ul>
          <button class="btn btn-danger" @click="logout">
            Log out
          </button>
        </div>
      </div>
    </div>
    <div v-else>
      <LoginForm @login-success="login" />
    </div>
  </main>
</template>

<style scoped></style>
