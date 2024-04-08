/* eslint-disable class-methods-use-this */
/* eslint-disable no-undef */
import { loadScript } from './aem.js';

export default class ChartLoader {
  async loadChart(chartConfig) {
    if (!window.Chart) {
      await loadScript('https://cdn.jsdelivr.net/npm/chart.js', { async: true, defer: true });
    }
    const container = document.createElement('div');
    container.classList.add('chart-container');
    const canvas = document.createElement('canvas');
    const chartInstance = new Chart(canvas, chartConfig);
    container.append(canvas);
    return { chart: container, chartInstance };
  }

  getChartConfig(dataObj, chartType = 'line', chartAxis = 'x', legendPos = 'bottom', xLabelRotation = 90) {
    const displayLegend = !!legendPos;
    const chartConfig = {
      type: chartType,
      data: {
        labels: dataObj.labels,
        datasets: dataObj.datasets,
      },
      options: {
        maintainAspectRatio: false,
        indexAxis: chartAxis,
        plugins: {
          legend: {
            display: displayLegend,
            position: legendPos,
            align: 'start',
            labels: {
              boxWidth: 10,
              boxHeight: 10,
              font: {
                size: 12,
              },
            },
          },
        },
        scales: {
          x: {
            ticks: {
              minRotation: xLabelRotation,
            },
          },
          y: {
            beginAtZero: true,
          },
        },
      },
    };

    return chartConfig;
  }
}
