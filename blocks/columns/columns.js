/* eslint-disable no-undef */
/* eslint-disable no-new */
import {
  loadScript,
} from '../../scripts/aem.js';

export default function decorate(block) {
  const cols = [...block.firstElementChild.children];
  block.classList.add(`columns-${cols.length}-cols`);

  const loadChart = async () => {
    if (!window.Chart) {
      // delay by 3 seconds to ensure a good lighthouse score
      // eslint-disable-next-line no-promise-executor-return
      await new Promise((resolve) => setTimeout(resolve, 3000));
      await loadScript('https://cdn.jsdelivr.net/npm/chart.js');
    }
    // setup image columns
    [...block.children].forEach((row) => {
      [...row.children].forEach((col) => {
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
        col.innerHTML = '';
        container.append(canvas);
        col.append(container);
      });
    });
  };

  loadChart();
}
