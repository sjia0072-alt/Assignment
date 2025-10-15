<template>
	<section class="row justify-content-center mt-5" aria-labelledby="user-info-heading">
		<div class="card shadow-lg col-lg-4 col-md-6">
			<div class="card-body text-center">
				<h1 id="user-info-heading" class="h3 card-title mb-3">
					User Information
				</h1>
				<p class="card-text fs-5 mb-3">
					Welcome back, <strong>{{ userInfo.name }}</strong>!
				</p>
				<dl class="list-group list-group-flush mb-4">
					<div class="list-group-item d-flex justify-content-between align-items-center">
						<dt class="visually-hidden">Email Address</dt>
						<dd>
							<span class="fw-bold">Email:</span>
						</dd>
						<dd class="mb-0 fw-bold">{{ userInfo.email }}</dd>
					</div>
					<div class="list-group-item d-flex justify-content-between align-items-center">
						<dt class="visually-hidden">User Role</dt>
						<dd>
							<span class="fw-bold">Role:</span>
						</dd>
						<dd class="mb-0">
							<span class="badge bg-info text-dark fw-bold" :aria-label="`User role: ${userInfo.role}`">
								{{ userInfo.role }}
							</span>
						</dd>
					</div>
				</dl>
				<button class="btn btn-danger" @click="logoutUser" aria-label="Log out of your account">
					Log out
				</button>
			</div>
		</div>
	</section>
</template>
<script setup>
import router from '@/router';
import { logout, userInfo } from '@/service/auth';

function logoutUser() {
	logout().then(() => {
		router.push({ name: 'home' });
	})
}

</script>
