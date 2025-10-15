<template>
  <main class="row justify-content-center mt-5" role="main">
    <section class="col-lg-4 col-md-6" aria-labelledby="auth-heading">
      <div class="card shadow-lg">
        <header class="card-header bg-primary text-white text-center">
          <h1 id="auth-heading" class="h5 mb-0">
            Sign Up/Login
          </h1>
        </header>
        <div class="card-body">
          <router-view />
        </div>
      </div>
    </section>
  </main>
</template>

<script setup>
</script>
