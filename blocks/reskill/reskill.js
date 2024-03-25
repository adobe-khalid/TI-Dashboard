/* eslint-disable no-undef */
/* eslint-disable no-new */
import ExcelDataLoader from '../../scripts/excel-to-json-helper.js';
import ChartLoader from '../../scripts/chart-helper.js';
import { printTitleTemplate, printFilterTabsTemplate, printSectionTemplate } from '../../scripts/dashboard-template.js';

const authorData = {};
let chart1 = {};
let chart2 = {};
let excelData = {};

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
    },
  };

  return chartConfig;
}

function getChartData(data, tabValue, keyToPrint) {
  const config = {
    years: authorData['chart-skill-year'],
    tabValue,
    topics: authorData['chart-skill-github'],
    data: data.filter((v) => v['Adobe Geo'] === tabValue),
  };

  const labels = config.years.map((v) => (v.length ? (v.slice(0, -4) + v.slice(-2)) : ''));
  const datasets = [];

  config.topics.forEach((t) => {
    const topicsValues = [];
    config.years.forEach((y) => {
      const filterVal = config.data.filter((vv) => {
        const checkQuarterYear = (y === `Q${vv.Quarter} ${vv.Year}`);
        const checkTopics = t.toLowerCase() === vv.Topics.toLowerCase();
        return checkQuarterYear && checkTopics;
      });
      topicsValues.push(
        filterVal.length
          ? filterVal.reduce((sum, item) => sum + item[keyToPrint], 0)
          : 0,
      );
    });

    datasets.push({
      label: t,
      data: topicsValues,
      fill: false,
      tension: 0.1,
    });
  });

  return { labels, datasets };
}

function getReskillChart(data, tabValue, keyToPrint, chartType = 'line', chartAxis = 'x') {
  const chartData = getChartData(data, tabValue, keyToPrint);
  const chartConfig = getChartConfig(chartData, chartType, chartAxis);

  return chartConfig;
}

function addFilterListener(block) {
  const filterClass = 'dashboard__filter';
  const filterList = block.querySelectorAll(`.${filterClass} span`);
  filterList.forEach((filterItem) => {
    filterItem.addEventListener('click', (e) => {
      const currentEle = e.currentTarget;
      const selectedTabText = currentEle.innerText;

      // update chart 1
      updateChart(chart1.chartInstance, getChartData(excelData, selectedTabText, 'Github Pushes'));
      // update chart 2
    });
  });
}

export default async function decorate(block) {
  const parentClass = 'reskill';

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
  printFilterTabsTemplate(authorData['filter-left'], null, block);
  // print section one
  printSectionTemplate({ title: authorData['title-skill-github'] }, block, true);
  // print section two
  printSectionTemplate({ title: authorData['title-startup-overview'] }, block, false);

  // filter listerners like click
  addFilterListener(block);

  try {
    const excelJson = await ExcelDataLoader('/scripts/TI-Dashboard-Template.xlsx');
    const chartLoader = new ChartLoader();
    const sectionOneEle = document.querySelector(`.${parentClass} .dashboard__section-one`);
    const sectionTwoEle = document.querySelector(`.${parentClass} .dashboard__section-two`);

    console.log('Excel Data from script1:', excelJson);

    excelData = excelJson['Gen AI Emerging skills 2024'];
    chart1 = await chartLoader.loadChart(getReskillChart(excelData, 'EMEA', 'Github Pushes'));
    chart2 = await chartLoader.loadChart(getReskillChart(excelData, 'EMEA', 'Github Pushes', 'bar', 'y'));
    sectionOneEle.append(chart1.chart);
    sectionTwoEle.append(chart2.chart);
  } catch (error) {
    console.error('Error fetching Excel data in script1:', error);
  }
}
