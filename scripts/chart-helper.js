/* eslint-disable class-methods-use-this */
/* eslint-disable no-undef */
/* eslint-disable no-new */
import { loadScript } from './aem.js';

export default class ChartLoader {
  async loadChart(chartConfig) {
    if (!window.Chart) {
      await loadScript('https://cdn.jsdelivr.net/npm/chart.js');
    }
    const container = document.createElement('div');
    container.classList.add('chart-container');
    const canvas = document.createElement('canvas');
    new Chart(canvas, chartConfig);
    container.append(canvas);
    return container;
  }
}
