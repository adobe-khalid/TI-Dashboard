/* eslint-disable no-undef */
/* eslint-disable no-new */
import MapLoader from '../../scripts/map-helper.js';
import ChartLoader from '../../scripts/chart-helper.js';
import { fetchApiResponse } from '../../scripts/aem.js';
import { printTitleTemplate, printFilterTabsTemplate, printSectionTemplate } from '../../scripts/dashboard-template.js';
import { getAuthorData } from '../../scripts/helper.js';

let chart1 = {};
let excelJson = {};
let excelColumn = [];
let mapLoaderInstance = {};
let chartLoader;
const parentClass = 'recruit';
let authorData = {};

function updateChart(chartInstance, data) {
  chartInstance.data.datasets = data.datasets;
  chartInstance.data.labels = data.labels;
  chartInstance.update();
}

function getChartData(data) {
  let limitResult = data.slice(0, 6);

  // sort by location
  limitResult = limitResult.sort((a, b) => (a.Location > b.Location ? 1 : -1));

  const labels = limitResult.map((v) => v.Location);
  const columnLabel = authorData['chart-industry-trend'];
  const chartTypes = authorData['chart-industry-trend-types'];
  const datasets = [];
  const colors = ['#0FB5AE', '#4046CA', '#F68512'];

  columnLabel.forEach((l, i) => {
    const dataValue = limitResult.map((v) => {
      let res = Number(v[l]);
      if (i === (columnLabel.length - 1)) {
        res += Number(v[columnLabel[1]]);
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
  const chartConfig = chartLoader.getChartConfig(chartData, chartType, chartAxis);

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
    filterItem.addEventListener('click', () => {
      const { leftFilterValue, rightFilterValue } = getFilterActiveTabs(parentClass);
      const data = excelJson[`${leftFilterValue}-${rightFilterValue}`]?.data;
      const cities = data.map((v) => v.Location);
      // update chart
      updateChart(chart1.chartInstance, getChartData(data));
      // update map
      mapLoaderInstance.updateCities(cities);
    });
  });
}

export default async function decorate(block) {
  authorData = getAuthorData(block);

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

  // load excel data
  excelJson = await fetchApiResponse(authorData['excel-sheet']);

  console.log('excelJson await ', excelJson);

  mapLoaderInstance = new MapLoader(authorData['map-api-key']);
  chartLoader = new ChartLoader();
  const sectionOneEle = document.querySelector(`.${parentClass} .dashboard-section-one`);
  const sectionTwoEle = document.querySelector(`.${parentClass} .dashboard-section-two`);
  let cities = [];
  const { leftFilterValue, rightFilterValue } = getFilterActiveTabs(parentClass);

  excelColumn = excelJson[`${leftFilterValue}-${rightFilterValue}`]?.data;
  cities = excelColumn.map((v) => v.Location);
  chart1 = await chartLoader.loadChart(getRecruitChart(excelColumn));
  sectionOneEle.append(chart1.chart);

  // load google map
  mapLoaderInstance.loadMap(sectionTwoEle, 'recruitMap', cities);
}
