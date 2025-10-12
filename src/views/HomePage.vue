<template>
  <div class="container py-5">
    <div class="row justify-content-center">
      <div class="col-lg-8">
        <div class="text-center mb-5">
          <h1 class="display-4 fw-bold text-primary">Welcome to Health Advice Platform</h1>
          <p class="lead mt-3 text-muted">Get personalized health recommendations and improve your well-being</p>

          <!-- Call to Action Buttons -->
          <div class="mt-4">
            <router-link to="/auth" class="btn btn-primary btn-lg me-3" v-if="userInfo.role === 'guest'">
              Get Started
            </router-link>
            <router-link to="/recommend" class="btn btn-success btn-lg" v-else>
              View My Recommendations
            </router-link>
          </div>
        </div>

        <div class="row g-4">
          <div class="col-md-4">
            <div class="card h-100 border-primary border-2">
              <div class="card-body text-center">
                <h5 class="card-title text-primary">Personalized Health Plans</h5>
                <p class="card-text">Customized health recommendations based on your profile</p>
              </div>
            </div>
          </div>
          <div class="col-md-4">
            <div class="card h-100 border-success border-2">
              <div class="card-body text-center">
                <h5 class="card-title text-success">Nutrition Guidance</h5>
                <p class="card-text">Expert advice on diet and nutrition for better health</p>
              </div>
            </div>
          </div>
          <div class="col-md-4">
            <div class="card h-100 border-info border-2">
              <div class="card-body text-center">
                <h5 class="card-title text-info">Wellness Tracking</h5>
                <p class="card-text">Monitor your progress and achieve your health goals</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { userInfo } from '@/service/auth';
</script>
