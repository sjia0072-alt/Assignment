<!-- src/components/LoginForm.vue -->
<template>
  <div class="container mt-5">
    <div class="row justify-content-center">
      <div class="col-lg-4 col-md-6">
        <div class="card shadow-lg">
          <div class="card-header bg-primary text-white text-center">
            Sign Up/Login
          </div>
          <div class="card-body">
            <form @submit.prevent="handleSubmit">
              <div class="mb-3">
                <label for="email" class="form-label">Email</label>
                <input
                  type="email"
                  class="form-control"
                  id="email"
                  placeholder="name@example.com"
                  required
                  v-model="email"
                />
              </div>
              <div class="mb-3">
                <label for="password" class="form-label">Password</label>
                <input
                  type="password"
                  class="form-control"
                  id="password"
                  required
                  v-model="password"
                />
              </div>
              <div class="d-grid gap-2">
                <button type="submit" class="btn btn-primary">Login</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
</script>

<style scoped></style>
