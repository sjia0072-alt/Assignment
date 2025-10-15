<template>
  <section>
    <h1>Health Recommendations</h1>
    <DataTable v-model:filters="filters" :value="recommendations" :paginator="true" :rows="10" :dataKey="'id'" :loading="loading"
      :sortField="sortField" :sortOrder="sortOrder" filterDisplay="row" @sort="onSort($event)" aria-label="Health recommendations table with sorting and filtering"
      stripedRows responsiveLayout="scroll">
      <template #header>
        <div class="flex justify-content-start align-items-center">
          <h5 class="m-0">Health Advice Management</h5>
        </div>
      </template>

      <template #empty>
        <div class="text-center p-4">
          <i class="pi pi-heart text-4xl text-muted mb-3"></i>
          <p class="text-muted">No health recommendations found.</p>
        </div>
      </template>

      <template #loading>
        <div class="text-center p-4">
          <ProgressSpinner style="width: 50px; height: 50px" strokeWidth="8" />
          <p class="mt-3">Loading recommendations...</p>
        </div>
      </template>

      <Column field="title" header="Title" sortable>
        <template #body="{ data }">
          <div class="flex align-items-center">
            <i class="pi pi-file-text mr-2 text-primary"></i>
            <span class="font-semibold">{{ data.title || 'N/A' }}</span>
          </div>
        </template>
        <template #filter="{ filterModel, filterCallback }">
          <InputText type="text" v-model="filterModel.value" @keydown.enter="filterCallback()" class="p-column-filter"
            placeholder="Search by title" aria-label="Filter by title" />
        </template>
      </Column>

      <Column field="category" header="Category" sortable>
        <template #body="{ data }">
          <Tag :value="data.category || 'General'" :severity="getCategorySeverity(data.category)"
            :icon="getCategoryIcon(data.category)" rounded />
        </template>
        <template #filter="{ filterModel, filterCallback }">
          <Dropdown v-model="filterModel.value" :options="categoryOptions" placeholder="Select a Category"
            class="p-column-filter" showClear @change="filterCallback()" aria-label="Filter by category" />
        </template>
      </Column>

      <Column field="priority" header="Priority" sortable>
        <template #body="{ data }">
          <Tag :value="data.priority || 'Medium'" :severity="getPrioritySeverity(data.priority)" rounded />
        </template>
        <template #filter="{ filterModel, filterCallback }">
          <Dropdown v-model="filterModel.value" :options="priorityOptions" placeholder="Select Priority"
            class="p-column-filter" showClear @change="filterCallback()" aria-label="Filter by priority" />
        </template>
      </Column>

      <Column field="targetAudience" header="Target Audience" sortable>
        <template #body="{ data }">
          <div class="flex align-items-center">
            <i class="pi pi-users mr-2 text-muted"></i>
            <span>{{ data.targetAudience || 'All Users' }}</span>
          </div>
        </template>
        <template #filter="{ filterModel, filterCallback }">
          <InputText type="text" v-model="filterModel.value" @keydown.enter="filterCallback()" class="p-column-filter"
            placeholder="Search audience" aria-label="Filter by audience" />
        </template>
      </Column>

      <Column field="createdDate" header="Created" sortable dataType="date">
        <template #body="{ data }">
          <div class="flex align-items-center">
            <i class="pi pi-calendar mr-2 text-muted"></i>
            <span>{{ formatDate(data.createdDate) }}</span>
          </div>
        </template>
      </Column>

      <Column header="Actions" :exportable="false" style="min-width: 8rem">
        <template #body="{ data }">
          <Button icon="pi pi-eye" class="p-button-rounded p-button-text p-button-info mr-2"
            @click="viewRecommendation(data)" aria-label="View recommendation details" />
          <Button icon="pi pi-share-alt" class="p-button-rounded p-button-text p-button-success mr-2"
            @click="shareRecommendation(data)" aria-label="Share recommendation" />
          <Button icon="pi pi-bookmark" class="p-button-rounded p-button-text p-button-warning"
            @click="saveRecommendation(data)" aria-label="Save recommendation" />
        </template>
      </Column>
    </DataTable>
  </section>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { useToast } from 'primevue/usetoast';

const toast = useToast();
const recommendations = ref([]);
const loading = ref(true);
const sortField = ref('priority');
const sortOrder = ref(-1);

// Filters for DataTable
const filters = ref({
  title: { value: null },
  category: { value: null },
  priority: { value: null },
  targetAudience: { value: null }
});

// Category options for filter dropdown
const categoryOptions = ref(['Nutrition', 'Exercise', 'Mental Health', 'Sleep', 'Prevention', 'General']);

// Priority options for filter dropdown
const priorityOptions = ref(['High', 'Medium', 'Low']);

function getCategorySeverity(category) {
  switch (category?.toLowerCase()) {
    case 'nutrition':
      return 'success';
    case 'exercise':
      return 'info';
    case 'mental health':
      return 'warning';
    case 'sleep':
      return 'primary';
    case 'prevention':
      return 'danger';
    default:
      return 'secondary';
  }
}

function getCategoryIcon(category) {
  switch (category?.toLowerCase()) {
    case 'nutrition':
      return 'pi pi-apple';
    case 'exercise':
      return 'pi pi-forward';
    case 'mental health':
      return 'pi pi-heart';
    case 'sleep':
      return 'pi pi-moon';
    case 'prevention':
      return 'pi pi-shield';
    default:
      return 'pi pi-info-circle';
  }
}

function getPrioritySeverity(priority) {
  switch (priority?.toLowerCase()) {
    case 'high':
      return 'danger';
    case 'medium':
      return 'warning';
    case 'low':
      return 'success';
    default:
      return 'secondary';
  }
}

function formatDate(dateString) {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

function onSort(event) {
  sortField.value = event.sortField;
  sortOrder.value = event.sortOrder;
}

function viewRecommendation(recommendation) {
  toast.add({
    severity: 'info',
    summary: 'View Recommendation',
    detail: `Opening: ${recommendation.title}`,
    life: 3000
  });
}

function shareRecommendation(recommendation) {
  toast.add({
    severity: 'success',
    summary: 'Share Recommendation',
    detail: `${recommendation.title} shared successfully!`,
    life: 3000
  });
}

function saveRecommendation(recommendation) {
  toast.add({
    severity: 'warn',
    summary: 'Save Recommendation',
    detail: `${recommendation.title} saved to your collection!`,
    life: 3000
  });
}

onMounted(async () => {
  try {
    loading.value = true;

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Sample health recommendations data
    recommendations.value = [
      {
        id: '1',
        title: 'Daily Water Intake Guidelines',
        category: 'Nutrition',
        priority: 'High',
        targetAudience: 'All Users',
        createdDate: '2024-01-15',
        description: 'Stay hydrated with 8-10 glasses of water daily.'
      },
      {
        id: '2',
        title: '30-Minute Morning Workout',
        category: 'Exercise',
        priority: 'Medium',
        targetAudience: 'Adults',
        createdDate: '2024-01-20',
        description: 'Start your day with energizing exercises.'
      },
      {
        id: '3',
        title: 'Stress Management Techniques',
        category: 'Mental Health',
        priority: 'High',
        targetAudience: 'Working Professionals',
        createdDate: '2024-02-01',
        description: 'Learn effective stress reduction methods.'
      },
      {
        id: '4',
        title: 'Quality Sleep Tips',
        category: 'Sleep',
        priority: 'High',
        targetAudience: 'All Users',
        createdDate: '2024-02-10',
        description: 'Improve your sleep quality with these tips.'
      },
      {
        id: '5',
        title: 'Seasonal Flu Prevention',
        category: 'Prevention',
        priority: 'Medium',
        targetAudience: 'Elderly',
        createdDate: '2024-02-15',
        description: 'Protect yourself during flu season.'
      },
      {
        id: '6',
        title: 'Mediterranean Diet Benefits',
        category: 'Nutrition',
        priority: 'Medium',
        targetAudience: 'Adults',
        createdDate: '2024-02-20',
        description: 'Discover heart-healthy eating patterns.'
      },
      {
        id: '7',
        title: 'Strength Training Basics',
        category: 'Exercise',
        priority: 'Low',
        targetAudience: 'Beginners',
        createdDate: '2024-03-01',
        description: 'Get started with strength training exercises.'
      },
      {
        id: '8',
        title: 'Mindfulness Meditation',
        category: 'Mental Health',
        priority: 'Medium',
        targetAudience: 'All Users',
        createdDate: '2024-03-05',
        description: 'Practice mindfulness for better mental health.'
      },
      {
        id: '9',
        title: 'Healthy Breakfast Ideas',
        category: 'Nutrition',
        priority: 'Low',
        targetAudience: 'All Users',
        createdDate: '2024-03-10',
        description: 'Start your day with nutritious breakfast options.'
      },
      {
        id: '10',
        title: 'Yoga for Flexibility',
        category: 'Exercise',
        priority: 'Low',
        targetAudience: 'Seniors',
        createdDate: '2024-03-15',
        description: 'Gentle yoga poses to improve flexibility.'
      },
      {
        id: '11',
        title: 'Digital Detox Strategies',
        category: 'Mental Health',
        priority: 'Medium',
        targetAudience: 'Young Adults',
        createdDate: '2024-03-20',
        description: 'Reduce screen time and improve well-being.'
      },
      {
        id: '12',
        title: 'Immune System Boosters',
        category: 'Prevention',
        priority: 'High',
        targetAudience: 'All Users',
        createdDate: '2024-03-25',
        description: 'Natural ways to strengthen your immune system.'
      }
    ];

  } catch (error) {
    console.error('Failed to load recommendations:', error);
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to load recommendations data',
      life: 3000
    });
    recommendations.value = [];
  } finally {
    loading.value = false;
  }
});
</script>
