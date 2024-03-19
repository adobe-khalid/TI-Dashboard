/* eslint-disable class-methods-use-this */
/* eslint-disable no-undef */
/* eslint-disable no-new */
import { loadScript } from './aem.js';

export default class ChartLoader {
  async loadChart(data) {
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
}
