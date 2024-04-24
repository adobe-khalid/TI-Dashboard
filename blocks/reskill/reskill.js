/* eslint-disable no-undef */
/* eslint-disable no-new */
import ChartLoader from '../../scripts/chart-helper.js';
import { fetchApiResponse } from '../../scripts/aem.js';
import { printTitleTemplate, printFilterTabsTemplate, printSectionTemplate } from '../../scripts/dashboard-template.js';
import { getAuthorData, abbrevToNumber, getLastValueFromRange } from '../../scripts/helper.js';

let chart1 = {};
let chart2 = {};
let excelJson = {};
let skillChartExcelData = [];
let startupChartExcelData = [];
let chartLoader;
const parentClass = 'reskill';
let authorData = {};

function updateChart(chartInstance, data) {
  chartInstance.data.datasets = data.datasets;
  chartInstance.data.labels = data.labels;
  chartInstance.update();
}

function getChart1Data(data, tabValue, keyToPrint) {
  const config = {
    years: authorData['chart-skill-year'],
    tabValue,
    topics: authorData['chart-skill-github'],
    data: data.filter((v) => v['Adobe-Geo'] === tabValue),
  };

  const labels = config.years.map((v) => (v.length ? (v.slice(0, -4) + v.slice(-2)) : ''));
  const datasets = [];
  const colors = ['#7E84FA', '#7326D3', '#72E06A', '#0967DF', '#DE3C82'];

  config.topics.forEach((t, i) => {
    const topicsValues = [];
    config.years.forEach((y) => {
      const filterVal = config.data.filter((vv) => {
        const checkQuarterYear = (y === `Q${vv.Quarter} ${vv.Year}`);
        const checkTopics = t.toLowerCase() === vv.Topics.toLowerCase();
        return checkQuarterYear && checkTopics;
      });
      topicsValues.push(
        filterVal.length
          ? filterVal.reduce((sum, item) => sum + Number(item[keyToPrint]), 0)
          : 0,
      );
    });

    datasets.push({
      label: t,
      data: topicsValues,
      fill: false,
      tension: 0.1,
      borderColor: colors[i],
      backgroundColor: colors[i],
      barThickness: 10,
    });
  });

  return { labels, datasets };
}

function getChart2Data(data) {
  const results = data?.slice(0, 10);
  const labels = results.map((v) => v['Startup Name']);
  const columnsNames = authorData['chart-startup-labels'];
  const datasets = [];
  const colors = ['#7E84FA', '#7326D3'];

  columnsNames.forEach((l, i) => {
    const dataValue = results.map((v) => {
      const lastValue = getLastValueFromRange(v[l]);
      const finalNumber = abbrevToNumber(lastValue);
      return finalNumber;
    });
    datasets.push({
      label: l,
      data: dataValue,
      borderColor: colors[i],
      backgroundColor: colors[i],
      barThickness: 5,
      borderWidth: 1,
    });
  });

  return { labels, datasets };
}

function getReskillChart(data, tabValue, keyToPrint, chartType = 'line', chartAxis = 'x') {
  const chartData = getChart1Data(data, tabValue, keyToPrint);
  const chartConfig = chartLoader.getChartConfig(chartData, chartType, chartAxis);

  return chartConfig;
}

function getStartupChart(data, tabValue, chartType = 'line', chartAxis = 'x') {
  const chartData = getChart2Data(data);
  const chartConfig = chartLoader.getChartConfig(chartData, chartType, chartAxis, 'top', 0);

  return chartConfig;
}

function getFilterActiveTabs(parentEleClass) {
  const leftFilterValue = document.querySelector(`.${parentEleClass} .dashboard-filter-left button.active`)?.innerText || '';
  const rightFilterValue = document.querySelector(`.${parentEleClass} .dashboard-filter-right button.active`)?.innerText || '';

  return { leftFilterValue, rightFilterValue };
}

function addFilterListener(block) {
  const filterClass = 'dashboard-filter';
  const filterList = block.querySelectorAll(`.${parentClass} .${filterClass} button`);
  filterList.forEach((filterItem) => {
    filterItem.addEventListener('click', (e) => {
      const currentEle = e.currentTarget;
      const selectedTabText = currentEle.innerText;

      // update chart 1
      updateChart(chart1.chartInstance, getChart1Data(skillChartExcelData, selectedTabText, 'Github Pushes'));
      // update chart 2
      // updateChart(
      //   chart2.chartInstance,
      //   getChart1Data(
      //     startupChartExcelData,
      //     selectedTabText,
      //     'Github Pushes',
      //     'bar',
      //     'y',
      //   ),
      // );
    });
  });
}

export default async function decorate(block) {
  authorData = getAuthorData(block);

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

  // load excel data
  excelJson = await fetchApiResponse(authorData['excel-sheet']);

  chartLoader = new ChartLoader();
  const sectionOneEle = document.querySelector(`.${parentClass} .dashboard-section-one`);
  const sectionTwoEle = document.querySelector(`.${parentClass} .dashboard-section-two`);
  const { leftFilterValue } = getFilterActiveTabs(parentClass);

  // pick data from  excel tab 'Gen AI Emerging skills 2024'
  skillChartExcelData = excelJson[authorData['chart-skill-sheet-name']]?.data;
  startupChartExcelData = excelJson[authorData['chart-startup-sheet-name']]?.data;
  chart1 = await chartLoader.loadChart(getReskillChart(skillChartExcelData, leftFilterValue, 'Github Pushes'));
  chart2 = await chartLoader.loadChart(getStartupChart(startupChartExcelData, leftFilterValue, 'bar', 'y'));

  sectionOneEle.append(chart1.chart);
  sectionTwoEle.append(chart2.chart);
}
