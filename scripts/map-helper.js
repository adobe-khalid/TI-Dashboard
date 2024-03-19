/* eslint-disable class-methods-use-this */
/* eslint-disable no-new */
/* eslint-disable no-undef */
import { loadScript } from './aem.js';

export default class MapLoader {
  constructor(apiKey) {
    this.apiKey = apiKey;
  }

  async initMap() {
    // Create an array of city names
    const cities = ['\xcele-de-France', 'Bergen Region', 'Randstad', 'Republic of Ireland', 'Z\xfcrich', 'Madrid', '\xc0rea Metropolitana de Barcelona', 'Warsaw', 'Copenhagen metropolitan area', 'Frankfurt Rhine-Main', 'Stockholm', 'Stuttgart', 'Milan', 'Toulouse M\xe9tropole', 'Brussels', 'Cambridge', 'Lausanne', 'Brabantine City', 'Rhine-Neckar', 'Lyon', 'Cologne', 'Romania', 'Alexandria metropolitan area, Louisiana', 'T\xfcbingen', 'Edinburgh', 'Cracow, Queensland', 'Aachen', 'Oxford', 'Manchester', 'Bristol', 'Ruhr Region', 'Hamburg', 'Leeds', 'Geneva', 'Valencia', 'Bordeaux', 'G\xf6ttingen', 'D\xfcsseldorf', 'Saarland', 'Lille', 'Armenia', 'Basel', 'Kaiserslautern', 'Marseille\xcele-de-France', 'London'];
    // The map, centered at the first city
    const map = new google.maps.Map(document.getElementById('map'), {
      zoom: 4,
      center: {
        lat: 37.0902,
        lng: -95.7129,
      }, // Center of USA
      styles: [{
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
      }],
    });
    // Loop through city names array and geocode them to get coordinates
    cities.forEach((cityName) => {
      const geocoder = new google.maps.Geocoder();
      geocoder.geocode({
        address: cityName,
      }, (results, status) => {
        if (status === google.maps.GeocoderStatus.OK) {
          const {
            location,
          } = results[0].geometry;
          new google.maps.Marker({
            position: location,
            map,
            title: cityName,
          });
        } else {
          console.error(`Geocode was not successful for the following reason: ${status}`);
        }
      });
    });
  }

  async loadMap(col) {
    if (typeof google === 'undefined') {
      await loadScript(`https://maps.googleapis.com/maps/api/js?key=${this.apiKey}`);
    }
    const container = document.createElement('div');
    container.setAttribute('id', 'map');
    container.style.height = '420px';
    col.appendChild(container);
    this.initMap();
  }
}
