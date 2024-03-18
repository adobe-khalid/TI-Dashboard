/* eslint-disable no-undef */
/* eslint-disable no-new */
import { loadScript } from '../../scripts/aem.js';
import ExcelDataLoader from '../../scripts/excel-to-json-helper.js';
import MapLoader from '../../scripts/map-helper.js';

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
    const mapLoader = new MapLoader('AIzaSyBz3r5qBJ3f7UiT28LKYJT4sjcORCVIQiw');

    excelDataLoader.loadExcelData()
      .then(async (data) => {
        let res = {};
        console.log('Results are already available:', data);
        res = await loadChart(data['Tab_EMEA_5-10years'].slice(0, 6));
        block.innerHTML = '';
        block.appendChild(res);
        mapLoader.loadMap(block);
      })
      .catch((error) => console.error('Error fetching or converting Excel file:', error));
  } else if (retain) {
    // retain container code here
  } else if (reskill) {
    // retain container code here
  }
}
