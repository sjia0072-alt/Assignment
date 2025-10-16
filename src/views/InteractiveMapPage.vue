<template>
  <div class="container-fluid py-4">
    <div class="row">
      <!-- Search Panel -->
      <div class="col-lg-3 col-md-4 mb-4">
        <div class="card">
          <div class="card-header bg-primary text-white">
            <h2 class="h5 mb-0">Health Facilities Map</h2>
          </div>
          <div class="card-body">
            <!-- Location controls -->
            <div class="mb-3">
              <button class="btn btn-success w-100" @click="getCurrentLocation" :disabled="locationLoading">
                <span v-if="!locationLoading">📍 Get My Location</span>
                <span v-else>Getting location...</span>
              </button>
              <div v-if="userLocation" class="mt-2 p-2 bg-light rounded small">
                <strong>Your location:</strong><br>
                Lat: {{ userLocation.lat.toFixed(4) }}, Lng: {{ userLocation.lng.toFixed(4) }}
              </div>
            </div>

            <form @submit.prevent="searchPlaces">
              <div class="mb-3">
                <label for="search-input" class="form-label">Search Places</label>
                <div class="input-group">
                  <input type="text" id="search-input" class="form-control" v-model="searchQuery"
                    placeholder="e.g., hospital, clinic, pharmacy">
                  <button class="btn btn-primary" type="submit" :disabled="loading">
                    <span v-if="!loading">Search</span>
                    <span v-else>Loading...</span>
                  </button>
                </div>
                <div class="form-text">
                  <small v-if="userLocation" class="text-success">
                    📍 Searching near your location
                  </small>
                  <small v-else class="text-muted">
                    Get your location to search nearby places
                  </small>
                </div>
              </div>
            </form>

            <!-- Search Results -->
            <div v-if="places.length > 0">
              <div class="d-flex justify-content-between align-items-center mb-3">
                <h3 class="h6 text-muted mb-0">Found {{ places.length }} places</h3>
                <button class="btn btn-sm btn-outline-primary" @click="showAllPlacesOnMap">
                  Show All on Map
                </button>
              </div>
              <div class="list-group">
                <div v-for="place in places" :key="place.id" class="list-group-item list-group-item-action">
                  <div class="d-flex justify-content-between align-items-start">
                    <div class="flex-grow-1" @click="showPlaceOnMap(place)">
                      <h6 class="mb-1">{{ place.text }}</h6>
                      <p class="mb-1 small text-muted">{{ place.place_name }}</p>
                      <small class="text-primary">Click to focus on map</small>
                    </div>
                    <div class="text-end">
                      <div v-if="place.distance !== null" class="mb-2">
                        <span class="badge bg-primary rounded-pill">{{ parseFloat(place.distance).toFixed(1) }}
                          km</span>
                      </div>
                      <button class="btn btn-sm btn-success" @click="getDirections(place)" :disabled="routeLoading">
                        <span v-if="!routeLoading">Navigate</span>
                        <span v-else>⏳</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div v-if="errorMessage" class="alert alert-danger mt-3">
              {{ errorMessage }}
            </div>
          </div>
        </div>
      </div>

      <!-- Map Area -->
      <div class="col-lg-9 col-md-8">
        <div class="card">
          <div class="card-body p-0">
            <div id="map" style="height: 500px; width: 100%;"></div>

            <!-- Route Information Panel Below Map -->
            <div v-if="routeInfo" class="p-3 bg-success bg-opacity-10 border-top">
              <div class="d-flex justify-content-between align-items-center mb-3">
                <h5 class="h6 text-success mb-0">
                  <i class="pi pi-directions"></i> Navigation Information
                </h5>
                <button class="btn btn-sm btn-outline-danger" @click="clearRoute">
                  ✕ Clear Route
                </button>
              </div>

              <div class="row mb-3">
                <div class="col-md-3 col-6 text-center">
                  <div class="bg-white rounded p-2">
                    <div class="text-muted small">Distance</div>
                    <div class="fw-bold text-primary">📏 {{ routeInfo.distance }} km</div>
                  </div>
                </div>
                <div class="col-md-3 col-6 text-center">
                  <div class="bg-white rounded p-2">
                    <div class="text-muted small">Duration</div>
                    <div class="fw-bold text-info">⏱️ {{ routeInfo.duration }}</div>
                  </div>
                </div>
                <div class="col-md-6 col-12">
                  <div class="bg-white rounded p-2">
                    <div class="text-muted small">Route</div>
                    <div class="fw-bold">📍 Your location → {{ routeInfo.destination }}</div>
                  </div>
                </div>
              </div>

              <!-- Turn-by-turn directions -->
              <div v-if="routeInfo.steps && routeInfo.steps.length > 0">
                <h6 class="small text-muted mb-2">🗺️ Step-by-step Directions:</h6>
                <div v-for="(step, index) in routeInfo.steps" :key="index"
                  class="mb-2 p-2 bg-white rounded border-start border-3 border-primary">
                  <div class="d-flex align-items-start">
                    <span class="badge bg-primary me-2 mt-1" style="font-size: 0.7rem; min-width: 20px;">
                      {{ index + 1 }}
                    </span>
                    <div class="flex-grow-1">
                      <div class="fw-medium">{{ step.maneuver.instruction }}</div>
                      <small class="text-muted">{{ step.distance }} m - {{ formatDuration(step.duration) }}</small>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'

// Reactive data
const searchQuery = ref('')
const places = ref([])
const loading = ref(false)
const errorMessage = ref('')
const map = ref(null)
const markers = ref([])
const userLocation = ref({
  lat: -37.91,
  lng: 145.137,
})
const locationLoading = ref(false)
const routeInfo = ref(null)
const selectedDestination = ref(null)
const routeLoading = ref(false)

// MapBox token
const MAPBOX_TOKEN = 'pk.eyJ1IjoiamlhbmcwMDciLCJhIjoiY21ncWl0dGI5MmcybjJrcTlkcDN6aDJrYyJ9.Zl5An22DIH5qs-xkxKI_wQ'

// Map initialization and setup
const initMap = () => {
  try {
    mapboxgl.accessToken = MAPBOX_TOKEN

    map.value = new mapboxgl.Map({
      container: 'map',
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [userLocation.value.lng, userLocation.value.lat], // Melbourne
      zoom: 12
    })

    // Add zoom controls
    map.value.addControl(new mapboxgl.NavigationControl())

  } catch (error) {
    console.error('Map error:', error)
    errorMessage.value = 'Failed to load map. Please check your internet connection.'
  }
}

// ====== Geolocation Functions ======

// Get user current location
const getCurrentLocation = () => {
  locationLoading.value = true
  errorMessage.value = ''

  if (!navigator.geolocation) {
    errorMessage.value = 'Geolocation is not supported by your browser'
    locationLoading.value = false
    return
  }

  navigator.geolocation.getCurrentPosition(
    (position) => {
      // Success - store user location
      userLocation.value = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      }

      // Add user location marker to map
      addUserLocationMarker()

      // Center map on user location
      if (map.value) {
        map.value.flyTo({
          center: [userLocation.value.lng, userLocation.value.lat],
          zoom: 14
        })
      }

      locationLoading.value = false
    },
    (error) => {
      // Error handling
      console.error('Geolocation error:', error)
      switch (error.code) {
        case error.PERMISSION_DENIED:
          errorMessage.value = 'Location access denied. Please enable location services.'
          break
        case error.POSITION_UNAVAILABLE:
          errorMessage.value = 'Location information unavailable.'
          break
        case error.TIMEOUT:
          errorMessage.value = 'Location request timed out.'
          break
        default:
          errorMessage.value = 'An unknown error occurred.'
          break
      }
      locationLoading.value = false
    }
  )
}

// Add user location marker to map
const addUserLocationMarker = () => {
  if (!map.value || !userLocation.value) return

  // Create a custom marker for user location
  const userMarker = new mapboxgl.Marker({
    color: '#FF0000'
  })
    .setLngLat([userLocation.value.lng, userLocation.value.lat])
    .setPopup(
      new mapboxgl.Popup().setHTML(`
        <div style="padding: 10px;">
          <h6 style="margin: 0 0 5px 0;">📍 Your Location</h6>
          <p style="margin: 0; color: #666; font-size: 12px;">This is where you are</p>
        </div>
      `)
    )
    .addTo(map.value)

  markers.value.push(userMarker)
}

// ====== Search Functions ======

// Search places using MapBox API
const searchPlaces = async () => {
  if (!searchQuery.value.trim()) {
    errorMessage.value = 'Please enter a search term'
    return
  }

  loading.value = true
  errorMessage.value = ''
  places.value = []
  try {
    let searchUrl = `https://api.mapbox.com/search/searchbox/v1/forward?q=${encodeURIComponent(searchQuery.value)}&` +
      `access_token=${MAPBOX_TOKEN}&` +
      `country=AU&` +
      `types=poi,address,place&` +
      `limit=10`

    // Search near map center
    if (map.value) {
      const center = map.value.getCenter()
      searchUrl += `&proximity=${center.lng.toFixed(6)},${center.lat.toFixed(6)}`
    }

    const response = await fetch(searchUrl)
    const data = await response.json()

    if (data.features && data.features.length > 0) {
      places.value = data.features.map((feature, index) => ({
        id: index,
        text: feature.properties.name,
        place_name: feature.properties.full_address,
        center: feature.geometry.coordinates,
        properties: feature.properties,
        // Use distance from API if available, otherwise calculate
        distance: feature.properties.distance ?
          (feature.properties.distance / 1000).toFixed(1) : // Convert meters to km
          (userLocation.value ? calculateDistance(userLocation.value, {
            lng: feature.geometry.coordinates[0],
            lat: feature.geometry.coordinates[1]
          }).toFixed(1) : null)
      }))

      // Sort by distance if user location is available
      if (userLocation.value) {
        places.value.sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance))
      }
    } else {
      errorMessage.value = 'No places found. Try a different search term.'
    }

    showAllPlacesOnMap()
  } catch (error) {
    console.error('Search error:', error)
    errorMessage.value = 'Search failed. Please try again.'
  } finally {
    loading.value = false
  }
}

// Calculate distance between two points (in km)
const calculateDistance = (point1, point2) => {
  const R = 6371 // Earth's radius in km
  const dLat = (point2.lat - point1.lat) * Math.PI / 180
  const dLng = (point2.lng - point1.lng) * Math.PI / 180
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(point1.lat * Math.PI / 180) * Math.cos(point2.lat * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

// ====== Map Marker Functions ======

// Create popup content for a place
const createPopupContent = (place, isCompact = false) => {
  const popupStyle = isCompact ?
    'padding: 10px; min-width: 180px;' :
    'padding: 10px; min-width: 200px;'

  const textStyle = isCompact ?
    'font-size: 11px; color: #666;' :
    'margin: 0 0 8px 0; color: #666; font-size: 12px;'

  const buttonStyle = isCompact ?
    'background-color: #198754; border-color: #198754; color: white; font-size: 0.75rem;' :
    'background-color: #198754; border-color: #198754; color: white;'

  let popupContent = `
    <div style="${popupStyle}">
      <h6 style="margin: 0 0 5px 0;">${place.text}</h6>
      <p style="${textStyle}">${place.place_name}</p>
  `

  // Add phone if available
  if (place.properties.metadata && place.properties.metadata.phone) {
    const prefix = isCompact ? '' : '<strong>'
    const suffix = isCompact ? '' : '</strong>'
    popupContent += `
      <div style="margin-bottom: ${isCompact ? '3px' : '5px'};">
        ${prefix}📞 Phone: ${suffix}<a href="tel:${place.properties.metadata.phone}">${place.properties.metadata.phone}</a>
      </div>
    `
  }

  // Add website if available
  if (place.properties.metadata && place.properties.metadata.website) {
    const prefix = isCompact ? '' : '<strong>'
    const suffix = isCompact ? '' : '</strong>'
    const linkText = isCompact ? 'Website' : 'Visit'
    popupContent += `
      <div style="margin-bottom: ${isCompact ? '3px' : '5px'};">
        ${prefix}🌐 Website: ${suffix}<a href="${place.properties.metadata.website}" target="_blank">${linkText}</a>
      </div>
    `
  }

  // Add opening hours (only for detailed popup)
  if (!isCompact && place.properties.metadata && place.properties.metadata.open_hours && place.properties.metadata.open_hours.weekday_text) {
    popupContent += `
      <div style="margin-bottom: 5px;">
        <strong>🕒 Hours:</strong><br>
        <span style="font-size: 11px; color: #666;">
          ${place.properties.metadata.open_hours.weekday_text[0] || 'Hours not available'}
        </span>
      </div>
    `
  }

  // Add distance if available
  if (place.distance !== null) {
    const prefix = isCompact ? '' : '<strong>'
    const suffix = isCompact ? '' : '</strong>'
    const distanceText = isCompact ? `${place.distance} km away` : `${place.distance} km`
    popupContent += `
      <div style="margin-bottom: ${isCompact ? '0' : '5px'};">
        ${prefix}📍 Distance: ${suffix}${distanceText}
      </div>
    `
  }

  // Add navigation button
  popupContent += `
    <div style="margin-top: 10px; text-align: center;">
      <button
        onclick="window.navigateFromPopup(${place.id})"
        class="btn btn-sm btn-success w-100"
        style="${buttonStyle}"
      >
        Navigate
      </button>
    </div>
  `

  popupContent += `</div>`
  return popupContent
}

// Create marker for a place
const createPlaceMarker = (place, openPopup = false, isCompact = false) => {
  const popup = new mapboxgl.Popup()
    .setHTML(createPopupContent(place, isCompact))

  const marker = new mapboxgl.Marker()
    .setLngLat(place.center)
    .setPopup(popup)
    .addTo(map.value)

  markers.value.push(marker)

  if (openPopup) {
    popup.addTo(map.value)
  }

  return marker
}

// Show place on map
const showPlaceOnMap = (place) => {
  if (!map.value) return

  // Close all existing popups before opening new one
  markers.value.forEach(marker => {
    if (marker.getPopup()) {
      marker.getPopup().remove()
    }
  })

  // Create marker and show popup (detailed style)
  createPlaceMarker(place, true, false)

  // Center map on the place
  map.value.flyTo({
    center: place.center,
    zoom: 15,
    essential: true
  })
}

// Show all places on map
const showAllPlacesOnMap = () => {
  if (!map.value) return

  // Clear existing markers
  markers.value.forEach(marker => marker.remove())
  markers.value = []

  // Add marker for each place (using compact style for better performance)
  places.value.forEach(place => {
    createPlaceMarker(place, false, true)
  })

  // Adjust map to show all markers
  if (places.value.length > 0) {
    const bounds = new mapboxgl.LngLatBounds()
    places.value.forEach(place => {
      bounds.extend(place.center)
    })
    map.value.fitBounds(bounds, { padding: 50 })
  }
}

// ====== Navigation Functions ======

// Format duration from seconds to readable format
const formatDuration = (seconds) => {
  const minutes = Math.round(seconds / 60)
  if (seconds < 60) {
    return seconds.toFixed(1) + ' s'
  }
  if (minutes < 60) {
    return minutes + ' min ' + (seconds % 60).toFixed(0) + ' s'
  } else {
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`
  }
}

// Get directions from user location to destination
const getDirections = async (place) => {
  if (!userLocation.value) {
    errorMessage.value = 'Please get your location first'
    return
  }

  routeLoading.value = true
  selectedDestination.value = place

  try {
    const response = await fetch(
      `https://api.mapbox.com/directions/v5/mapbox/driving/` +
      `${userLocation.value.lng},${userLocation.value.lat};` +
      `${place.center[0]},${place.center[1]}?` +
      `access_token=${MAPBOX_TOKEN}&` +
      `geometries=geojson&` +
      `steps=true&` +
      `overview=full`
    )

    const data = await response.json()

    if (data.routes && data.routes.length > 0) {
      const route = data.routes[0]

      // Update route information
      routeInfo.value = {
        distance: (route.distance / 1000).toFixed(1), // Convert to km
        duration: formatDuration(route.duration),
        destination: place.text,
        steps: route.legs[0].steps
      }

      // Draw route on map
      drawRoute(route.geometry)

      // Center map to show entire route
      const bounds = new mapboxgl.LngLatBounds()
      bounds.extend([userLocation.value.lng, userLocation.value.lat])
      bounds.extend(place.center)
      map.value.fitBounds(bounds, { padding: 50 })

    } else {
      errorMessage.value = 'Could not calculate route'
    }

  } catch (error) {
    console.error('Directions error:', error)
    errorMessage.value = 'Failed to get directions'
  } finally {
    routeLoading.value = false
  }
}

// Draw route on map
const drawRoute = (geometry) => {
  if (!map.value) return

  // Remove existing route layer if it exists
  if (map.value.getLayer('route')) {
    map.value.removeLayer('route')
    map.value.removeSource('route')
  }

  // Add route source
  map.value.addSource('route', {
    type: 'geojson',
    data: {
      type: 'Feature',
      properties: {},
      geometry: geometry
    }
  })

  // Add route layer
  map.value.addLayer({
    id: 'route',
    type: 'line',
    source: 'route',
    layout: {
      'line-join': 'round',
      'line-cap': 'round'
    },
    paint: {
      'line-color': '#0066cc',
      'line-width': 4,
      'line-opacity': 0.8
    }
  })
}

// Clear route from map
const clearRoute = () => {
  routeInfo.value = null
  selectedDestination.value = null

  if (map.value && map.value.getLayer('route')) {
    map.value.removeLayer('route')
    map.value.removeSource('route')
  }
}

// ====== Lifecycle ======

// Initialize on component mount
onMounted(() => {
  initMap()
  // Global function for popup navigation button
  window.navigateFromPopup = (placeId) => {
    const place = places.value.find(p => p.id === placeId)
    if (place) {
      getDirections(place)
    }
  }
})

// Cleanup on unmount
onUnmounted(() => {
  if (map.value) {
    map.value.remove()
  }
  // Clean up global function
  delete window.navigateFromPopup
})
</script>

<style scoped>
.list-group-item {
  cursor: pointer;
}

.list-group-item:hover {
  background-color: #f8f9fa;
}
</style>
