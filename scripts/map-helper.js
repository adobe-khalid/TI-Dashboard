/* eslint-disable class-methods-use-this */
/* eslint-disable no-new */
/* eslint-disable no-undef */
import { loadScript } from './aem.js';

const silverTheme = [{
  elementType: 'geometry',
  stylers: [{
    color: '#f5f5f5',
  }],
}, {
  elementType: 'labels.icon',
  stylers: [{
    visibility: 'off',
  }],
}, {
  elementType: 'labels.text.fill',
  stylers: [{
    color: '#616161',
  }],
}, {
  elementType: 'labels.text.stroke',
  stylers: [{
    color: '#f5f5f5',
  }],
}, {
  featureType: 'administrative.land_parcel',
  elementType: 'labels.text.fill',
  stylers: [{
    color: '#bdbdbd',
  }],
}, {
  featureType: 'poi',
  elementType: 'geometry',
  stylers: [{
    color: '#eeeeee',
  }],
}, {
  featureType: 'poi',
  elementType: 'labels.text.fill',
  stylers: [{
    color: '#757575',
  }],
}, {
  featureType: 'poi.park',
  elementType: 'geometry',
  stylers: [{
    color: '#e5e5e5',
  }],
}, {
  featureType: 'poi.park',
  elementType: 'labels.text.fill',
  stylers: [{
    color: '#9e9e9e',
  }],
}, {
  featureType: 'road',
  elementType: 'geometry',
  stylers: [{
    color: '#ffffff',
  }],
}, {
  featureType: 'road.arterial',
  elementType: 'labels.text.fill',
  stylers: [{
    color: '#757575',
  }],
}, {
  featureType: 'road.highway',
  elementType: 'geometry',
  stylers: [{
    color: '#dadada',
  }],
}, {
  featureType: 'road.highway',
  elementType: 'labels.text.fill',
  stylers: [{
    color: '#616161',
  }],
}, {
  featureType: 'road.local',
  elementType: 'labels.text.fill',
  stylers: [{
    color: '#9e9e9e',
  }],
}, {
  featureType: 'transit.line',
  elementType: 'geometry',
  stylers: [{
    color: '#e5e5e5',
  }],
}, {
  featureType: 'transit.station',
  elementType: 'geometry',
  stylers: [{
    color: '#eeeeee',
  }],
}, {
  featureType: 'water',
  elementType: 'geometry',
  stylers: [{
    color: '#c9c9c9',
  }],
}, {
  featureType: 'water',
  elementType: 'labels.text.fill',
  stylers: [{
    color: '#9e9e9e',
  }],
}];

export default class MapLoader {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.mapLoadedPromise = null;
    this.map = null;
    this.markers = [];
  }

  async initMap(mapELeId, cities) {
    // Calculate the midpoint coordinates
    const midpoint = this.calculateMidpoint(cities);

    // Create the map
    this.map = new google.maps.Map(document.getElementById(mapELeId), {
      zoom: 4,
      center: midpoint,
      styles: silverTheme,
    });

    // Clear existing markers
    this.markers.forEach((marker) => {
      marker.setMap(null);
    });

    // Add markers for each city
    cities.forEach((cityName) => {
      const geocoder = new google.maps.Geocoder();
      geocoder.geocode({
        address: cityName,
      }, (results, status) => {
        if (status === google.maps.GeocoderStatus.OK) {
          const { location } = results[0].geometry;
          const marker = new google.maps.Marker({
            position: location,
            map: this.map,
            title: cityName,
            icon: {
              url: 'http://maps.google.com/mapfiles/ms/icons/green-dot.png', // Green dot icon
            },
          });
          this.markers.push(marker);
        } else {
          // console.error(`Geocode was not successful for the following reason: ${status}`);
        }
      });
    });

    // Return the MapLoader instance
    return this;
  }

  calculateMidpoint(cities) {
    let totalLat = 0;
    let totalLng = 0;

    cities.forEach((cityName) => {
      const geocoder = new google.maps.Geocoder();
      geocoder.geocode({
        address: cityName,
      }, (results, status) => {
        if (status === google.maps.GeocoderStatus.OK) {
          const { location } = results[0].geometry;
          totalLat += location.lat();
          totalLng += location.lng();
        } else {
          // console.error(`Geocode was not successful for the following reason: ${status}`);
        }
      });
    });

    const averageLat = totalLat / cities.length;
    const averageLng = totalLng / cities.length;

    return { lat: averageLat, lng: averageLng };
  }

  async loadMap(col, mapELeId, cities) {
    if (!this.mapLoadedPromise) {
      // Load the Google Maps API script only once
      this.mapLoadedPromise = loadScript(`https://maps.googleapis.com/maps/api/js?key=${this.apiKey}`, { async: true, defer: true });
    }

    try {
      // Ensure that subsequent calls wait for the script to be loaded
      await this.mapLoadedPromise;
    } catch (error) {
      // console.error('Error loading Google Maps API:', error);
      // throw error; // Re-throw the error to propagate it further
    }

    // Once the script is loaded, initialize the map
    const container = document.createElement('div');
    container.setAttribute('id', mapELeId);
    container.setAttribute('class', 'map-container');
    container.style.height = '380px';
    col.appendChild(container);

    // Initialize the map asynchronously
    await this.initMap(mapELeId, cities);
  }

  async updateCities(newCities) {
    // Update the map with new cities
    if (this.map) {
      await this.initMap(this.map.getDiv().id, newCities);
    }
  }
}
