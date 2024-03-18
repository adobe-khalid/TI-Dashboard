/* eslint-disable no-undef */
/* eslint-disable no-new */
import { loadScript } from '../../scripts/aem.js';
import ExcelDataLoader from '../../scripts/excel-to-json-helper.js';

async function loadChart(data) {
  if (!window.Chart) {
    await loadScript('https://cdn.jsdelivr.net/npm/chart.js');
  }
  const container = document.createElement('div');
  container.classList.add('chart-container');
  const canvas = document.createElement('canvas');
  console.log('6 result ', data);
  new Chart(canvas, {
    type: 'scatter',
    data: {
      labels: data.map((v) => v.Location),
      datasets: [{
        type: 'bar',
        label: 'Professionals',
        data: data.map((v) => v.Professionals),
        borderColor: '#0FB5AE',
        backgroundColor: '#4046CA',
      }, {
        type: 'bar',
        label: 'Related Job posts',
        data: data.map((v) => v['Related Job posts']),
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 32, 45, 0.2)',
      }, {
        type: 'line',
        label: '1y growth',
        data: data.map((v) => v['1y growth'] * 1000),
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
  col.appendChild(container);
  initMap();
}

export default function decorate(block) {
  const authorData = {};
  const recruit = block.classList.contains('recruit');
  const retain = block.classList.contains('retain');
  const reskill = block.classList.contains('reskill');

  // iterate over children and get all authoring data
  block.childNodes.forEach((child) => {
    if (child.nodeType === 1) {
      const firstDivText = child.children[0].textContent.trim();
      let secondDivText = child.children[1].textContent.trim();

      if (firstDivText.indexOf('filter') >= 0) {
        secondDivText = secondDivText.split(',');
      }

      authorData[firstDivText] = secondDivText;
    }
  });

  console.log('authorData', authorData);

  if (recruit) {
    const excelDataLoader = new ExcelDataLoader('/scripts/TI-Dashboard-Template.xlsx');

    excelDataLoader.loadExcelData()
      .then(async (data) => {
        let res = {};
        console.log('Results are already available:', data);
        res = await loadChart(data['Tab_EMEA_5-10years'].slice(0, 6));
        block.innerHTML = '';
        block.appendChild(res);
        await loapMap(block);
      })
      .catch((error) => console.error('Error fetching or converting Excel file:', error));

    // const converter = new ExcelSheetConverter('/scripts/TI-Dashboard-Template.xlsx');
    // converter.convertToJSON()
    //   .then(() => {
    //     let res = {};

    //     console.log('Results are already available:', converter.results);
    //     res = loadChart(converter.results['Tab_EMEA_5-10years'].slice(0, 6));
    //     loapMap(block);
    //     block.innerHTML = '';
    //     block.append(res);
    //   });
  } else if (retain) {
    // retain container code here
  } else if (reskill) {
    // retain container code here
  }
}
