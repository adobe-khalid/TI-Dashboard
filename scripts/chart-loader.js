/* eslint-disable class-methods-use-this */
/* eslint-disable no-undef */
/* eslint-disable no-new */
import { loadScript } from './aem.js';

class ChartLoader {
  async loadChart() {
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
}

export default ChartLoader;
