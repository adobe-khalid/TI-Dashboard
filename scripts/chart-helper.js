/* eslint-disable class-methods-use-this */
/* eslint-disable no-undef */
import { loadScript } from './aem.js';

export default class ChartLoader {
  async loadChart(chartConfig) {
    if (!window.Chart) {
      await loadScript('https://cdn.jsdelivr.net/npm/chart.js');
    }
    const container = document.createElement('div');
    container.classList.add('chart-container');
    const canvas = document.createElement('canvas');
    const chartInstance = new Chart(canvas, chartConfig);
    container.append(canvas);
    return { chart: container, chartInstance };
  }
}
