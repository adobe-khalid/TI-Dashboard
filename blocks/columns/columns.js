/* eslint-disable no-undef */
/* eslint-disable no-new */
import {
  loadScript,
} from '../../scripts/aem.js';

async function loadChart() {
  if (!window.Chart) {
    await loadScript('https://cdn.jsdelivr.net/npm/chart.js');
  }
  const container = document.createElement('div');
  container.classList.add('chart-container');
  const canvas = document.createElement('canvas');
  new Chart(canvas, {
    type: 'scatter',
    data: {
      labels: ['Île-de-France', 'London', 'Bergen Region', 'Randstad', 'Republic of Ireland', 'Zürich'],
      datasets: [{
        type: 'bar',
        label: 'Professionals',
        data: [569, 467, 207, 195, 145, 143],
        borderColor: '#0FB5AE',
        backgroundColor: '#4046CA',
      }, {
        type: 'bar',
        label: 'Related Job posts',
        data: [6374, 6413, 2918, 4118, 1966],
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 32, 45, 0.2)',
      }, {
        type: 'line',
        label: '1y growth',
        data: [6374, 6413, 2918, 4118, 1966],
        fill: false,
        borderColor: 'rgb(54, 162, 235)',
      }],
    },
    options: {
      plugins: {
        legend: {
          position: 'bottom',
        },
      },
      scales: {
        minRotation: 90,
        y: {
          beginAtZero: true,
        },
      },
    },
  });
  container.append(canvas);
  return container;
}

// Initialize and add the map
function initMap() {
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
          location
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

async function loapMap(col) {
  if (typeof google === 'undefined') {
    await loadScript('https://maps.googleapis.com/maps/api/js?key=AIzaSyBz3r5qBJ3f7UiT28LKYJT4sjcORCVIQiw');
  }
  const container = document.createElement('div');
  container.setAttribute('id', 'map');
  container.style.height = '420px';
  col.innerHTML = '';
  col.append(container);
  initMap();
}

export default function decorate(block) {
  const cols = [...block.firstElementChild.children];
  let res = {};
  block.classList.add(`columns-${cols.length}-cols`);
  // setup image columns
  [...block.children].forEach((row, rindex) => {
    [...row.children].forEach(async (col, cindex) => {
      const pic = col.querySelector('picture');
      if (pic) {
        const picWrapper = pic.closest('div');
        if (picWrapper && picWrapper.children.length === 1) {
          // picture is only content in column
          picWrapper.classList.add('columns-img-col');
        }
      }

      if (rindex === 0 && cindex === 0) {
        res = await loadChart();
      } else if (rindex === 0 && cindex === 1) {
        res = '';
      } else if (rindex === 0 && cindex === 2) {
        res = '';
      } else if (rindex === 1 && cindex === 0) {
        await loapMap(col);
        return;
      } else if (rindex === 1 && cindex === 1) {
        res = '';
        return;
      } else if (rindex === 1 && cindex === 2) {
        res = '';
      }
      col.innerHTML = '';
      col.append(res);
    });
  });
}
