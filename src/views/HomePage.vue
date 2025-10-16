<template>
  <section class="container py-5" aria-labelledby="homepage-heading">
    <div class="row justify-content-center">
      <div class="col-lg-8">
        <header class="text-center mb-5">
          <h1 id="homepage-heading" class="display-4 fw-bold text-primary">
            Welcome to Wellness360
          </h1>
          <p class="lead mt-3 text-muted">
            Get personalized health recommendations and improve your well-being
          </p>

          <!-- Call to Action Buttons -->
          <div class="mt-4">
            <router-link to="/auth" class="btn btn-primary btn-lg me-3" v-if="userInfo.role === 'guest'"
              aria-label="Get started with health advice">
              Get Started
            </router-link>
            <router-link to="/recommendations" class="btn btn-success btn-lg" v-else
              aria-label="View your personalized health recommendations">
              View My Recommendations
            </router-link>
          </div>
        </header>

        <section aria-labelledby="features-heading">
          <h2 id="features-heading" class="visually-hidden">Platform Features</h2>
          <div class="row g-4">
            <article class="col-md-4">
              <div class="card h-100 border-primary border-2">
                <div class="card-body text-center">
                  <h3 class="card-title h5 text-primary">Personalized Health Plans</h3>
                  <p class="card-text">Customized health recommendations based on your profile</p>
                </div>
              </div>
            </article>
            <article class="col-md-4">
              <div class="card h-100 border-success border-2">
                <div class="card-body text-center">
                  <h3 class="card-title h5 text-success">Nutrition Guidance</h3>
                  <p class="card-text">Expert advice on diet and nutrition for better health</p>
                </div>
              </div>
            </article>
            <article class="col-md-4">
              <div class="card h-100 border-info border-2">
                <div class="card-body text-center">
                  <h3 class="card-title h5 text-info">Wellness Tracking</h3>
                  <p class="card-text">Monitor your progress and achieve your health goals</p>
                </div>
              </div>
            </article>
          </div>
        </section>
      </div>
    </div>
  </section>
</template>

<script setup>
import { userInfo } from '@/service/auth';
</script>
