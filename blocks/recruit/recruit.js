/* eslint-disable no-undef */
/* eslint-disable no-new */
import ExcelDataLoader from '../../scripts/excel-to-json-helper.js';
import MapLoader from '../../scripts/map-helper.js';
import ChartLoader from '../../scripts/chart-helper.js';
import { printTitleTemplate, printFilterTabsTemplate, printSectionTemplate } from '../../scripts/dashboard-template.js';

let chart1 = {};
let excelJson = {};
let excelColumn = [];
let mapLoaderInstance = {};
const parentClass = 'recruit';
const authorData = {};

function updateChart(chartInstance, data) {
  chartInstance.data.datasets = data.datasets;
  chartInstance.data.labels = data.labels;
  chartInstance.update();
}

function getChartConfig(dataObj, chartType = 'line', chartAxis = 'x', legendPos = 'bottom') {
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
        minRotation: 90,
        y: {
          beginAtZero: true,
        },
      },
    },
  };

  return chartConfig;
}

function getChartData(data) {
  const limitResult = data.slice(0, 6);
  const labels = limitResult.map((v) => v.Location);
  const columnLabel = authorData['chart-industry-trend'];
  const chartTypes = authorData['chart-industry-trend-types'];
  const datasets = [];
  const colors = ['#0FB5AE', '#4046CA', '#F68512'];

  columnLabel.forEach((l, i) => {
    const dataValue = limitResult.map((v) => {
      let res = v[l];
      if (i === (columnLabel.length - 1)) {
        res += v[columnLabel[1]];
      }
      return res;
    });

    datasets.push({
      type: chartTypes[i],
      label: columnLabel[i],
      data: dataValue,
      borderColor: colors[i],
      backgroundColor: colors[i],
      barThickness: 10,
      borderWidth: 2,
    });
  });

  return { labels, datasets };
}

function getRecruitChart(data, tabValue, chartType, chartAxis) {
  const chartData = getChartData(data, tabValue);
  const chartConfig = getChartConfig(chartData, chartType, chartAxis);

  return chartConfig;
}

function getFilterActiveTabs() {
  const leftFilterValue = document.querySelector('.dashboard-filter-left button.active')?.innerText || '';
  const rightFilterValue = document.querySelector('.dashboard-filter-right button.active')?.innerText || '';

  return { leftFilterValue, rightFilterValue };
}

function addFilterListener(block) {
  const filterClass = 'dashboard-filter';
  const filterList = block.querySelectorAll(`.${parentClass} .${filterClass} button`);
  filterList.forEach((filterItem) => {
    filterItem.addEventListener('click', () => {
      const { leftFilterValue, rightFilterValue } = getFilterActiveTabs();
      const data = excelJson[`${leftFilterValue} ${rightFilterValue}`];
      const cities = data.map((v) => v.Location);
      // update chart
      updateChart(chart1.chartInstance, getChartData(data));
      // update map
      mapLoaderInstance.updateCities(cities);
      // .then(() => {
      //   console.log('Map updated successfully!');
      //   // Any further actions after map is updated
      // })
      // .catch((error) => {
      //   console.error('Error updating map:', error);
      // });
    });
  });
}

export default async function decorate(block) {
  // iterate over children and get all authoring data
  block.childNodes.forEach((child) => {
    if (child.nodeType === 1) {
      const objText = 'obj';
      let firstDivText = child.children[0].textContent.trim();
      let secondDivText = child.children[1].textContent.trim();

      if (firstDivText.indexOf(objText) >= 0) {
        firstDivText = firstDivText.replace(objText, '').trim();
        secondDivText = secondDivText.split(',');
      }

      authorData[firstDivText] = secondDivText;
    }
  });

  block.innerHTML = '';
  // print title
  printTitleTemplate(authorData, block);
  // print section FilterTabs
  printFilterTabsTemplate(authorData['filter-left'], authorData['filter-right'], block);
  // print section one
  printSectionTemplate({ title: authorData['title-trends'] }, block, true);
  // print section two
  printSectionTemplate({ title: authorData['title-demographics'] }, block, false);
  // filter listerners like click
  addFilterListener(block);

  try {
    excelJson = await ExcelDataLoader('/scripts/TI-Dashboard-Template.xlsx');
    mapLoaderInstance = new MapLoader(authorData['map-api-key']);
    const chartLoader = new ChartLoader();
    const sectionOneEle = document.querySelector(`.${parentClass} .dashboard-section-one`);
    const sectionTwoEle = document.querySelector(`.${parentClass} .dashboard-section-two`);
    let cities = [];
    const { leftFilterValue, rightFilterValue } = getFilterActiveTabs();

    excelColumn = excelJson[`${leftFilterValue} ${rightFilterValue}`];
    cities = excelColumn.map((v) => v.Location);
    chart1 = await chartLoader.loadChart(getRecruitChart(excelColumn));
    sectionOneEle.append(chart1.chart);

    // load google map
    mapLoaderInstance.loadMap(sectionTwoEle, 'recruitMap', cities);
    // .then(() => {
    //   console.log('Map loaded successfully!');
    //   // Any further actions after map is loaded
    // })
    // .catch((error) => {
    //   console.error('Error loading map:', error);
    // });
  } catch (error) {
    // error
  }
}
