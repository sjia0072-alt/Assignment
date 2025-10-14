<template>
	<h1>Health Recommendation</h1>
	<form @submit.prevent="handleAdd" v-if="userInfo.role === 'admin'">
		<div class="input-group mb-3">
			<input type="text" class="form-control" v-model="recommendation" placeholder="Add a recommendation">
			<button class="btn btn-outline-secondary" type="submit">Add</button>
		</div>
	</form>
	<table class="table">
		<thead>
			<tr>
				<th scope="col">#</th>
				<th scope="col">Recommendation</th>
				<th scope="col" class="text-center">
					<span v-if="userInfo.role === 'admin'">Average</span>
					Rating
				</th>
				<th scope="col">Action</th>
			</tr>
		</thead>
		<tbody>
			<tr v-for="(rec, index) in recommendations" :key="index" class="align-middle">
				<th scope="row">{{ index + 1 }}</th>
				<td>{{ rec.content }}</td>
				<td>
					<div v-if="userInfo.role === 'admin'" class="text-center">
						{{rec.ratings.reduce((acc, current) => acc + current.rating, 0) / rec.ratings.length}}
					</div>
					<div v-else-if="userInfo.role === 'user'" class="text-center">
						<Rating v-model="rec.rating" class="gap-2 large-stars" />
					</div>
					<div v-else> (Hidden) </div>
				</td>
				<td>
					<button v-if="userInfo.role === 'admin'" class="btn btn-danger btn-sm"
						@click="deleteRec(rec.id)">Delete</button>
					<button v-else-if="userInfo.role === 'user'" class="btn btn-primary btn-sm"
						@click="handleRating(rec)">Rate</button>
					<div v-else> (Hidden) </div>
				</td>
			</tr>
		</tbody>
	</table>
</template>
<script setup>
import { onMounted, ref } from 'vue';
import { auth } from '@/service/firebase';
import { userInfo } from '@/service/auth';
import { save, loadAll, updateOne, deleteOne } from '@/service/store';
import Rating from 'primevue/rating';

const recommendations = ref([])
const recommendation = ref('')
const rating = ref(0)

onMounted(async () => {
	const data = await loadAll('recommend');
	console.log(data)
	console.log(userInfo)
	recommendations.value = data.map((item) => ({
		...item,
		rating: item.ratings.find(item => item.uid == auth.currentUser.uid)?.rating ?? 0
	}))
})


function handleAdd() {
	const newItem = {
		content: recommendation.value,
		ratings: []
	}
	save('recommend', newItem).then(() => {
		recommendations.value.push(newItem);
		recommendation.value = '';
	})
}

function handleRating(rec) {
	const index = rec.ratings.findIndex(rating => rating.uid === auth.currentUser.uid);
	if (index === -1) {
		rec.ratings.push({
				uid: auth.currentUser.uid,
				rating: rec.rating
		})
	} else {
		rec.ratings[index].rating = rec.rating;
	}
	updateOne('recommend', rec.id, {
		ratings: rec.ratings
	}).then(() => alert("Rate success"))
}

function deleteRec(id) {
	deleteOne('recommend', id).then(() =>
		recommendations.value = recommendations.value.filter(item => item.id !== id)
	)
}
</script>
<style scoped>
.large-stars :deep(.p-rating-icon) {
	font-size: 1.5rem;
	width: 1.5rem;
	height: 1.5rem;
}
</style>
