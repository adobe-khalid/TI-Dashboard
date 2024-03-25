import ExcelDataLoader from '../../scripts/excel-to-json-helper.js';
import ChartLoader from '../../scripts/chart-helper.js';
import {
  printTitleTemplate,
  printFilterTabsTemplate,
  printSectionTemplate,
  arrayToObject,
  createElement,
} from '../../scripts/dashboard-template.js';

let chartLoader;
let competitorInsights = [];
const parentClass = 'retain';
const authorData = {};
const retainContainer = createElement('div', 'retain-container');

function removeElementById(id) {
  const element = document.getElementById(id);
  if (element) {
    element.parentNode.removeChild(element);
  }
}

function createTableByArray(data, label) {
  const tableContainer = createElement('div', 'table-container');
  tableContainer.id = label;
  const headerRow = createElement('div', 'table-row');
  createElement('div', 'table-cell', 'Company', headerRow);
  createElement('div', 'table-cell', label, headerRow);
  tableContainer.appendChild(headerRow);

  const maxLength = Math.max(...Object.values(data).map((arr) => arr.length));
  for (let i = 0; i < maxLength; i += 1) {
    const row = createElement('div', 'table-row');
    Object.keys(data).forEach((key) => {
      if (key === 'Competitor' || key === label) {
        createElement(
          'div',
          'table-cell',
          typeof data[key][i] === 'string' ? data[key][i].replace(',', ' ') : data[key][i] || 'na',
          row,
        );
      }
    });
    tableContainer.appendChild(row);
  }
  return tableContainer;
}

async function loadChart(type, datasets) {
  return chartLoader.loadChart({
    type,
    data: {
      labels: competitorInsights.Competitor,
      datasets,
    },
    options: {
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false,
        },
      },
      scales: {
        minRotation: 90,
        y: {
          beginAtZero: true,
        },
      },
    },
  });
}

async function loadTalentPool() {
  // print section one
  printSectionTemplate({ title: authorData['title-pool-skill'] }, retainContainer, true);
  // print section two
  printSectionTemplate({ title: authorData['title-pool-location'] }, retainContainer, false);

  const sectionOneEle = retainContainer.querySelector(`.${parentClass} .dashboard__section-one`);
  const sectionTwoEle = retainContainer.querySelector(`.${parentClass} .dashboard__section-two`);

  const sectionOneLegend = createView(
    competitorInsights,
    'Open AI roles',
    (value) => `<p>${value}</p>`,
  );
  const sectionTwoLegend = createView(
    competitorInsights,
    'Open AI roles',
    (value) => `<p>${value}</p>`,
  );
  createElement('div', 'retain-legend', sectionOneLegend, sectionOneEle);
  createElement('div', 'retain-legend', sectionTwoLegend, sectionTwoEle);

  const skillsElm = await loadChart('bar', [
    { label: 'Open AI roles', data: competitorInsights['Open AI roles'] },
    {
      label: 'Employee-NPS Score',
      data: competitorInsights['Employee-NPS Score'],
    },
    {
      label: 'Diversity & Inclusion score',
      data: competitorInsights['Diversity & Inclusion score'],
    },
  ]);

  sectionOneEle.appendChild(skillsElm.chart);
  const locationElm = await loadChart('line', [
    { label: 'Open AI roles', data: competitorInsights['Open AI roles'] },
    {
      label: 'Employee-NPS Score',
      data: competitorInsights['Employee-NPS Score'],
    },
    {
      label: 'Diversity & Inclusion score',
      data: competitorInsights['Diversity & Inclusion score'],
    },
  ]);
  sectionTwoEle.appendChild(locationElm.chart);
}

async function loadKeyMetrics() {
  const metricsTag = createElement('div', 'metrics-item', '', retainContainer);
  const metricsVal = createElement('div', 'metrics-value', '', retainContainer);

  authorData['metrics-filter'].forEach((value, key) => {
    const metricsItem = createElement('div', 'metrics', value, metricsTag);
    if (key === 0 || key === 1) {
      metricsItem.classList.add('selected');
      const table = createTableByArray(competitorInsights, value);
      metricsVal.appendChild(table);
    }
    metricsItem.addEventListener('click', function () {
      if (this.classList.contains('selected')) {
        this.classList.remove('selected');
        removeElementById(value);
      } else {
        this.classList.add('selected');
        const table = createTableByArray(competitorInsights, value);
        metricsVal.append(table);
      }
    });
  });
}

function createView(data, label, formatValue) {
  const productContainer = document.createElement('div');
  productContainer.classList.add('product__container');
  productContainer.id = label;
  const maxLength = Math.max(...Object.values(data).map((arr) => arr.length));
  for (let i = 0; i < maxLength; i += 1) {
    const row = document.createElement('div');
    row.classList.add('product__container-item');
    Object.keys(data).forEach((key) => {
      if ((key === 'Competitor' || key === label) && Object.prototype.hasOwnProperty.call(data, key)) {
        if (data[key][i]) {
          if (key === 'Competitor') {
            const logo = document.createElement('img');
            logo.src = `https://main--ti-dashboard--adobe-khalid.hlx.live/images/${data[key][i].toLowerCase()}-logo.png`;
            logo.alt = data[key][i];
            createElement('div', 'logo', logo, row);
          } else {
            const value = formatValue(data[key][i]);
            createElement('div', 'products', value, row);
          }
        }
      }
    });
    productContainer.appendChild(row);
  }
  return productContainer;
}

async function loadAttritionComparison() {
  // print section one
  printSectionTemplate({ title: authorData['title-pool-skill'] }, retainContainer, true);
  // print section two
  printSectionTemplate({ title: authorData['title-pool-location'] }, retainContainer, false);

  const sectionOneEle = retainContainer.querySelector(`.${parentClass} .dashboard__section-one`);
  const sectionTwoEle = retainContainer.querySelector(`.${parentClass} .dashboard__section-two`);

  Object.keys(competitorInsights)
    .filter((key) => ['Attrition by AI Engineering Function'].includes(key))
    .forEach((key) => {
      const attritionElm = createView(
        competitorInsights,
        key,
        (value) => `<p>${(parseFloat(value) * 100).toFixed(2)}%</p>`,
      );
      sectionOneEle.appendChild(attritionElm);
    });
  Object.keys(competitorInsights)
    .filter((key) => ['Top AI Products'].includes(key))
    .forEach((key) => {
      const aiProductElm = createView(
        competitorInsights,
        key,
        (value) => `<p>${value.replaceAll(',', '</p><p>')}</p>`,
      );
      sectionTwoEle.appendChild(aiProductElm);
    });
}

function addFilterListener(block) {
  const filterClass = 'dashboard__filter';
  const filterList = block.querySelectorAll(`.${filterClass} span`);
  filterList.forEach((filterItem) => {
    filterItem.addEventListener('click', function () {
      retainContainer.innerHTML = '';
      if (this.textContent === 'Key Metrics') {
        loadKeyMetrics(block);
      } else if (this.textContent === 'Attrition Comparison') {
        loadAttritionComparison(block);
      } else {
        loadTalentPool(block);
      }
    });
  });
}

export default async function decorate(block) {
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
  console.log('authorData' , authorData);
  block.innerHTML = '';
  printTitleTemplate(authorData, block);
  // print section FilterTabs
  printFilterTabsTemplate(authorData['filter-left'], null, block);

  block.appendChild(retainContainer);

  try {
    const excelJson = await ExcelDataLoader('/scripts/TI-Dashboard-Template.xlsx');
    chartLoader = new ChartLoader();

    if (excelJson[authorData['sheet-name']]) {
      competitorInsights = arrayToObject(excelJson[authorData['sheet-name']]);
      loadTalentPool(block);
    }
    addFilterListener(block);
    // block.appendChild(retainContainer);
  } catch (error) {
    console.error('Error fetching Excel data in script1:', error);
  }
}
