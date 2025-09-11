<template>
  <!-- Using Bootstrap's Header template (starter code) -->
  <!-- https://getbootstrap.com/docs/5.0/examples/headers/ -->
  <header class="d-flex justify-content-center py-3">
    <ul class="nav nav-pills gap-3 text-primary-emphasis">
      <li class="nav-item bg-primary bg-opacity-25 rounded">
        <router-link to="/" class="nav-link" active-class="active" aria-current="page">
          Home
        </router-link>
      </li>
      <li class="nav-item bg-primary bg-opacity-25 rounded">
        <router-link to="/auth" class="nav-link" active-class="active text-light">
          Sign In
        </router-link>
      </li>
      <li class="nav-item bg-primary bg-opacity-25 rounded">
        <router-link to="/users" class="nav-link" active-class="active text-light">
          Users
        </router-link>
      </li>
    </ul>
  </header>
</template>
