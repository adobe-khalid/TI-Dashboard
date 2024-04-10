import ChartLoader from '../../scripts/chart-helper.js';
import { fetchApiResponse } from '../../scripts/aem.js';
import {
  printTitleTemplate,
  printFilterTabsTemplate,
  printSectionTemplate,
  arrayToObject,
  createElement,
} from '../../scripts/dashboard-template.js';
import { getAuthorData } from '../../scripts/helper.js';

let chartLoader;
let excelJson = {};
let competitorInsights = [];
const parentClass = 'retain';
let authorData = {};
const retainContainer = createElement('div', 'retain-container');
const colors = ['#FF9900', '#34A354', '#F35325', '#0967DF', '#206EBA', '#00A1E1'];

function removeElementById(id) {
  const element = document.getElementById(id);
  if (element) {
    element.parentNode.removeChild(element);
  }
}

function CreateTableRow(data, parent, orderBy = 'key', order = 'asc') {
  const sortedEntries = orderBy === 'key'
    ? Object.entries(data).sort(([keyA], [keyB]) => (order === 'asc' ? keyA.localeCompare(keyB) : keyB.localeCompare(keyA)))
    : Object.entries(data).sort(([_, _valueA], [__, _valueB]) => {
      console.log(_, __);
      if (!Number.isNaN(Number(_valueA)) && !Number.isNaN(Number(_valueB))) {
        return order === 'asc' ? Number(_valueA) - Number(_valueB) : Number(_valueB) - Number(_valueA);
      }
      return order === 'asc' ? String(_valueA).localeCompare(String(_valueB)) : String(_valueB).localeCompare(String(_valueA));
    });
  sortedEntries.forEach(([competitor, regions]) => {
    const row = createElement('div', 'table-row,td');
    createElement('div', 'table-cell', competitor, row);
    createElement('div', 'table-cell', regions, row);
    parent.appendChild(row);
  });
}

function tableSort(filterElm, data) {
  filterElm.addEventListener('click', () => {
    filterElm.classList.toggle('desc');
    const parentElm = filterElm.closest('.table-container');
    parentElm.querySelectorAll('.td').forEach((element) => element.parentNode.removeChild(element));
    const orderBy = filterElm.classList.contains('key') ? 'key' : 'val';
    const order = filterElm.classList.contains('desc') ? 'desc' : 'asc';
    CreateTableRow(data, parentElm, orderBy, order);
  });
}

function createTableByArray(data, label) {
  const tableContainer = createElement('div', 'table-container');
  tableContainer.id = label;
  const headerRow = createElement('div', 'table-row,th');
  const filterRowOne = createElement('div', 'table-cell,key', 'Company', headerRow);
  const filterRowTwo = createElement('div', 'table-cell,value', label, headerRow);
  tableSort(filterRowOne, data);
  tableSort(filterRowTwo, data);
  tableContainer.appendChild(headerRow);
  CreateTableRow(data, tableContainer);
  return tableContainer;
}

function createView(data, classname = '', parent = null, isTalent = false) {
  const productContainer = createElement('div', classname ? `product-container,${classname}` : 'product-container');
  Object.entries(data).forEach(([key, item], index) => {
    const row = createElement('div', 'product-container-item');
    const logo = createElement('img');
    logo.src = `https://main--ti-dashboard--adobe-khalid.hlx.live/images/${key.toLowerCase()}-logo.png`;
    logo.alt = key;
    const legendLogo = createElement('div', 'logo', logo, row);
    if (isTalent) {
      legendLogo.style.border = `1px solid ${colors[index]}`;
    }
    row.appendChild(legendLogo);
    let label = `<p>${item}</p>`;
    if (classname === 'product-container-atrrition-eng') {
      label = `<p>${(parseFloat(item) * 100).toFixed(2)}%</p>`;
    } else if (classname === 'product-container-ai-product') {
      label = `<p>${item.replaceAll(',', '</p><p>')}</p>`;
    }
    createElement('div', 'products', label, row);
    productContainer.appendChild(row);
  });
  if (parent) {
    parent.appendChild(productContainer);
  }
  return productContainer;
}

function prepareChartData(dataArr) {
  const chartData = { labels: dataArr, datasets: [], legend: {} };
  let count = 0;
  Object.keys(competitorInsights[dataArr[1]]).forEach((platform) => {
    if (platform !== 'Adobe') {
      const data = dataArr.filter((category) => competitorInsights[category][platform] !== '')
        .map((category) => parseInt(competitorInsights[category][platform], 10));
      chartData.datasets.push({
        data,
        label: platform,
        borderColor: colors[count],
        backgroundColor: colors[count],
        barThickness: 5,
      });
      chartData.legend[platform] = data.reduce((sum, item) => sum + item, 0);
      count += 1;
    }
  });
  return chartData;
}

async function loadTalentPool(chartObj) {
  // Print section one
  printSectionTemplate({ title: authorData['title-pool-skill'] }, retainContainer, true);
  // Print section two
  printSectionTemplate({ title: authorData['title-pool-location'] }, retainContainer, false);

  const sectionOneEle = retainContainer.querySelector(`.${parentClass} .dashboard-section-one`);
  const sectionTwoEle = retainContainer.querySelector(`.${parentClass} .dashboard-section-two`);

  // Extract chart data
  const skillDataArr = chartObj['chart-talent-skills-company'] || [];
  const locationDataArr = chartObj['chart-talent-location-company'] || [];

  // Prepare chart data
  const chartDataSkill = prepareChartData(skillDataArr);
  const chartDataLocation = prepareChartData(locationDataArr);

  const sectionOneLegend = createView(chartDataSkill.legend, null, null, true);
  const sectionTwoLegend = createView(chartDataLocation.legend, null, null, true);
  createElement('div', 'retain-legend', sectionOneLegend, sectionOneEle);
  createElement('div', 'retain-legend', sectionTwoLegend, sectionTwoEle);

  const chartConfig = chartLoader.getChartConfig(chartDataSkill, 'bar', 'x', false);
  const chartConfigb = chartLoader.getChartConfig(chartDataLocation, 'line', 'x', false);

  // Load charts in parallel
  const [skillsElm, locationElm] = await Promise.all([
    chartLoader.loadChart(chartConfig),
    chartLoader.loadChart(chartConfigb),
  ]);

  // Append charts to sections
  sectionOneEle.appendChild(skillsElm.chart);
  sectionTwoEle.appendChild(locationElm.chart);
}

async function loadKeyMetrics() {
  const metricsTag = createElement('div', 'metrics-item', '', retainContainer);
  const metricsVal = createElement('div', 'metrics-value', '', retainContainer);

  authorData['metrics-filter'].forEach((value, key) => {
    const metricsItem = createElement('div', 'metrics', value, metricsTag);
    if (key === 0 || key === 1) {
      metricsItem.classList.add('selected');
      const table = createTableByArray(competitorInsights[value], value);
      metricsVal.appendChild(table);
    }
    metricsItem.addEventListener('click', () => {
      if (metricsItem.classList.contains('selected')) {
        metricsItem.classList.remove('selected');
        removeElementById(value);
      } else {
        metricsItem.classList.add('selected');
        const table = createTableByArray(competitorInsights[value], value); // fixed obj issue
        metricsVal.append(table);
      }
    });
  });
}

async function loadAttritionComparison() {
  // print section one
  printSectionTemplate({ title: authorData['title-attrition'] }, retainContainer, true);
  // print section two
  printSectionTemplate({ title: authorData['title-ai-product'] }, retainContainer, false);

  const sectionOneEle = retainContainer.querySelector(`.${parentClass} .dashboard-section-one`);
  const sectionTwoEle = retainContainer.querySelector(`.${parentClass} .dashboard-section-two`);
  const attritionEngineering = competitorInsights['Attrition by AI Engineering Function'];
  const topAIProducts = competitorInsights['Top AI Products'];
  createView(attritionEngineering, 'product-container-atrrition-eng', sectionOneEle);
  createView(topAIProducts, 'product-container-ai-product', sectionTwoEle);
}

function addFilterListener(block, data) {
  const filterClass = 'dashboard-filter';
  const filterList = block.querySelectorAll(`.${parentClass} .${filterClass} button`);
  filterList.forEach((filterItem) => {
    filterItem.addEventListener('click', () => {
      retainContainer.innerHTML = '';
      if (filterItem.textContent === 'Key Metrics') {
        loadKeyMetrics();
      } else if (filterItem.textContent === 'Attrition Comparison') {
        loadAttritionComparison();
      } else {
        loadTalentPool(data);
      }
    });
  });
}

export default async function decorate(block) {
  authorData = getAuthorData(block);

  block.innerHTML = '';
  printTitleTemplate(authorData, block);
  // print section FilterTabs
  printFilterTabsTemplate(authorData['filter-left'], null, block);

  block.appendChild(retainContainer);

  // load excel data
  excelJson = await fetchApiResponse(authorData['excel-sheet']);

  // load chart
  chartLoader = new ChartLoader();

  if (excelJson[authorData['sheet-name']] && excelJson[authorData['sheet-name']]?.data) {
    competitorInsights = arrayToObject(excelJson[authorData['sheet-name']].data);
    loadTalentPool(authorData);
  }
  addFilterListener(block, authorData);
}
