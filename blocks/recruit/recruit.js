/* eslint-disable no-undef */
/* eslint-disable no-new */
import ExcelDataLoader from '../../scripts/excel-to-json-helper.js';
import MapLoader from '../../scripts/map-helper.js';
import ChartLoader from '../../scripts/chart-helper.js';
import { printTitleTemplate, printFilterTabsTemplate, printSectionTemplate } from '../../scripts/dashboard-template.js';

let chart1 = {};
let excelJson = {};
let excelColumn = [];
const parentClass = 'recruit';
const authorData = {};

function updateChart(chartInstance, data) {
  chartInstance.data.datasets = data.datasets;
  chartInstance.data.labels = data.labels;
  chartInstance.update();
}

function getChartConfig(dataObj, chartType = 'line', chartAxis = 'x') {
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
    });
  });

  console.log('{ labels, datasets } ', { labels, datasets });

  return { labels, datasets };
}

function getRecruitChart(data, tabValue, chartType, chartAxis) {
  const chartData = getChartData(data, tabValue);
  const chartConfig = getChartConfig(chartData, chartType, chartAxis);

  return chartConfig;
}

function addFilterListener(block) {
  const filterClass = 'dashboard__filter';
  const filterList = block.querySelectorAll(`.${parentClass} .${filterClass} button`);
  filterList.forEach((filterItem) => {
    filterItem.addEventListener('click', () => {
      const leftFilterValue = document.querySelector('.dashboard__filter-left button.active').innerText;
      const rightFilterValue = document.querySelector('.dashboard__filter-right button.active').innerText;
      const data = excelJson[`${leftFilterValue} ${rightFilterValue}`];
      updateChart(chart1.chartInstance, getChartData(data));
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

  console.log('authorData', authorData);

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
    const mapLoader = new MapLoader('AIzaSyBz3r5qBJ3f7UiT28LKYJT4sjcORCVIQiw');
    const chartLoader = new ChartLoader();
    const sectionOneEle = document.querySelector(`.${parentClass} .dashboard__section-one`);
    const sectionTwoEle = document.querySelector(`.${parentClass} .dashboard__section-two`);
    let cities = [];

    console.log('Excel Data from script1:', excelJson);

    excelColumn = excelJson['EMEA 5-10years'];
    cities = excelColumn.map((v) => v.Location);
    chart1 = await chartLoader.loadChart(getRecruitChart(excelColumn));
    sectionOneEle.append(chart1.chart);
    await mapLoader.loadMap(sectionTwoEle, 'recruitMap', cities);
  } catch (error) {
    console.error('Error fetching Excel data in script1:', error);
  }
}

// {
//   type: 'scatter',
//   data: {
//     labels: filterResults.map((v) => v.Location),
//     datasets: [{
//       type: 'bar',
//       label: 'Professionals',
//       data: filterResults.map((v) => v.Professionals),
//       borderColor: '#0FB5AE',
//       backgroundColor: '#4046CA',
//     }, {
//       type: 'bar',
//       label: 'Related Job posts',
//       data: filterResults.map((v) => v['Related Job posts']),
//       borderColor: 'rgb(255, 99, 132)',
//       backgroundColor: 'rgba(255, 32, 45, 0.2)',
//     }, {
//       type: 'line',
//       label: '1y growth',
//       data: filterResults.map((v) => v['1y growth'] + v['Related Job posts']),
//       fill: false,
//       borderColor: 'rgb(54, 162, 235)',
//     }],
//   },
//   options: {
//     maintainAspectRatio: false,
//     plugins: {
//       legend: {
//         position: 'bottom',
//       },
//     },
//     scales: {
//       minRotation: 90,
//       y: {
//         beginAtZero: true,
//       },
//     },
//   },
// }
