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

  isNumber(value) {
    // Remove commas from the value
    const valueWithoutCommas = value.replace(/,/g, '');
    // Check if the value is a valid number
    return !Number.isNaN(parseFloat(valueWithoutCommas))
            && Number.isFinite(parseFloat(valueWithoutCommas));
  }

  formatNumber(value) {
    const numberValue = value.replace(/,/g, '');
    if (numberValue >= 1000000000) {
      return `${(numberValue / 1000000000).toFixed(1)}b`;
    } if (numberValue >= 1000000) {
      return `${(numberValue / 1000000).toFixed(1)}m`;
    } if (numberValue >= 1000) {
      return `${(numberValue / 1000).toFixed(1)}k`;
    }
    return numberValue;
  }

  getChartConfig(dataObj, chartType = 'line', chartAxis = 'x', legendPos = 'bottom', xLabelRotation = 90) {
    const chartClass = this;
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
              callback(value) {
                const valueLegend = this.getLabelForValue(value);
                let finalLegendValue = valueLegend;

                if (chartClass.isNumber(finalLegendValue)) {
                  finalLegendValue = chartClass.formatNumber(finalLegendValue);
                } else {
                  if (finalLegendValue.length > 10) {
                    finalLegendValue = `${finalLegendValue.substr(0, 10)}....`;
                  }
                  console.log('call back value ', finalLegendValue);
                }
                return finalLegendValue;
              },
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
