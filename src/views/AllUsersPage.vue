<template>
	<h1>All Users</h1>
	<table class="table">
		<thead>
			<tr>
				<th scope="col">#</th>
				<th scope="col">Name</th>
				<th scope="col">Email</th>
				<th scope="col">Role</th>
			</tr>
		</thead>
		<tbody>
			<tr v-for="(user, index) in users" :key="index">
				<th scope="row">{{ index + 1 }}</th>
				<td>{{ user.name }}</td>
				<td>{{ user.email }}</td>
				<td>{{ user.role }}</td>
			</tr>
		</tbody>
	</table>
</template>
<script setup>
import { onMounted, ref } from 'vue';
import { loadAll } from '@/service/store';

const users = ref([{
	name: "loading",
	email: "loading",
	role: "loading",
}])

onMounted(async () => {
	users.value = await loadAll('users');
})
</script>
