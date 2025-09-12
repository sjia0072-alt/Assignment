<template>
	<div class="row justify-content-center mt-5">
		<div class="card shadow-lg col-lg-4 col-md-6">
			<div class="card-body text-center">
				<p class="card-text fs-5 mb-3">
					Welcome back, <strong>{{ userInfo.name }}</strong>!
				</p>
				<ul class="list-group list-group-flush mb-4">
					<li class="list-group-item d-flex justify-content-between align-items-center">
						<span>Email:</span>
						<span class="fw-bold">{{ userInfo.email }}</span>
					</li>
					<li class="list-group-item d-flex justify-content-between align-items-center">
						<span>Role:</span>
						<span class="badge bg-info text-dark fw-bold">{{ userInfo.role }}</span>
					</li>
				</ul>
				<button class="btn btn-danger" @click="logoutUser">
					Log out
				</button>
			</div>
		</div>
	</div>
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
