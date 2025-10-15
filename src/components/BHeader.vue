<template>
  <!-- Using Bootstrap's Header template (starter code) -->
  <!-- https://getbootstrap.com/docs/5.0/examples/headers/ -->
  <header class="d-flex justify-content-center py-3">
    <nav role="navigation" aria-label="Main navigation">
      <ul class="nav nav-pills gap-3 text-primary-emphasis">
        <li class="nav-item bg-primary bg-opacity-25 rounded">
          <router-link to="/" class="nav-link" active-class="active" aria-current="page">
            Home
          </router-link>
        </li>
        <li v-if="userInfo.role === 'guest'" class="nav-item bg-primary bg-opacity-25 rounded">
          <router-link to="/auth" class="nav-link" active-class="active">
            Sign In
          </router-link>
        </li>
        <li v-else class="nav-item bg-primary bg-opacity-25 rounded">
          <router-link to="/user-info" class="nav-link" active-class="active">
            User Info
          </router-link>
        </li>
        <li v-if="userInfo.role !== 'guest'" class="nav-item bg-primary bg-opacity-25 rounded">
          <router-link to="/recommend" class="nav-link" active-class="active">
            Recommend
          </router-link>
        </li>
        <li v-if="userInfo.role !== 'guest'" class="nav-item bg-primary bg-opacity-25 rounded">
          <router-link to="/recommendations" class="nav-link" active-class="active">
            Health Data
          </router-link>
        </li>
        <li v-if="userInfo.role == 'admin'" class="nav-item bg-primary bg-opacity-25 rounded">
          <router-link to="/users" class="nav-link" active-class="active">
            Users
          </router-link>
        </li>
      </ul>
    </nav>
  </header>
</template>
<script setup>
import { userInfo } from '@/service/auth';

</script>
