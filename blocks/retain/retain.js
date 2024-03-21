import ExcelDataLoader from '../../scripts/excel-to-json-helper.js';
import ChartLoader from '../../scripts/chart-helper.js';
import { arrayToObject } from '../../scripts/helper.js';

let chartLoader;
let competitorInsights = [];
const authorData = {};
const retainContainer = document.createElement('div');
retainContainer.classList.add('retain-container');

function createElement(elementType, className, text, parent) {
    const element = document.createElement(elementType);
    if (className) {
        element.classList.add(className);
    }
    if (text instanceof HTMLImageElement) {
        element.appendChild(text);
    } else if (text) {
        element.innerHTML = text;
    }
    if (parent) {
        parent.appendChild(element);
    }
    return element;
}

function removeElementById (id) {
  const element = document.getElementById(id);
  if (element) {
      element.parentNode.removeChild(element);
  }
}

async function loadChart(container, title, type, datasets) {
    const chartContainer = createElement('div', `${title.toLowerCase()}-container`, '', container);
    createElement('div', 'title', authorData[title], chartContainer);
    return await chartLoader.loadChart({
        type: type,
        data: {
            labels: competitorInsights['Competitor'],
            datasets: datasets
        },
        options: {
            plugins: {
                legend: {
                    position: 'top'
                }
            },
            scales: {
                minRotation: 90,
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

async function loadTalentPool() {
    const skillsContainer = createElement('div', 'skills-container', '', retainContainer);
    const skillsElm = await loadChart(skillsContainer, 'title-pool-skill', 'bar', [
        { label: 'Open AI roles', data: competitorInsights['Open AI roles'] },
        { label: 'Employee-NPS Score', data: competitorInsights['Employee-NPS Score'] },
        { label: 'Diversity & Inclusion score', data: competitorInsights['Diversity & Inclusion score'] }
    ]);
    skillsContainer.appendChild(skillsElm);

    const locationContainer = createElement('div', 'location-container', '', retainContainer);
    const locationElm = await loadChart(locationContainer, 'title-pool-location', 'line', [
        { label: 'Open AI roles', data: competitorInsights['Open AI roles'] },
        { label: 'Employee-NPS Score', data: competitorInsights['Employee-NPS Score'] },
        { label: 'Diversity & Inclusion score', data: competitorInsights['Diversity & Inclusion score'] }
    ]);
    locationContainer.appendChild(locationElm);
}

async function loadKeyMetrics() {
    const metricsTag = createElement('div', 'metrics-item', '', retainContainer);
    const metricsVal = createElement('div', 'metrics-item-value', '', retainContainer);

    authorData['metrics-filter'].forEach((value, key) => {
        const metricsItem = createElement('div', 'metrics', value, metricsTag);
        if (key === 0 || key === 1) {
            metricsItem.classList.add('selected');
            const table = createTableByArray(competitorInsights, value);
            metricsVal.appendChild(table);
        }
        metricsItem.addEventListener("click", function () {
            if (this.classList.contains("selected")) {
                this.classList.remove("selected");
                removeElementById(value);
            } else {
                this.classList.add("selected");
                const table = createTableByArray(competitorInsights, value);
                metricsVal.append(table);
            }
        });
    });
}

async function loadAttritionComparison() {
    const attritionContainer = createElement('div', 'attrition-container', '', retainContainer);
    createElement('div', 'title', authorData['title-attrition'], attritionContainer);
    Object.keys(competitorInsights).filter(key => ['Attrition by AI Engineering Function'].includes(key)).forEach(key => {
        const attritionElm = createAttrition(competitorInsights, key);
        attritionContainer.appendChild(attritionElm);
    });
    const aiProductContainer = createElement('div', 'ai-product', '', retainContainer);
    createElement('div', 'title', authorData['title-ai-product'], aiProductContainer);
    Object.keys(competitorInsights).filter(key => ['Top AI Products'].includes(key)).forEach(key => {
        const aiProductElm = createProductView(competitorInsights, key);
        aiProductContainer.appendChild(aiProductElm);
    });
}

function crateFilter(data) {
    const filterContainer = createElement('div', 'filter-container', '');
    data.forEach((value, key) => {
        const className = key == 0 ? 'active' : '';
        const filterItem = createElement('span', className, value, filterContainer);
        filterItem.addEventListener("click", function () {
            if (!this.classList.contains("active")) {
                document.querySelector('.filter-container span.active').classList.remove('active');
                this.classList.add("active");
                retainContainer.innerHTML = '';
                if (this.textContent === 'Key Metrics') {
                    loadKeyMetrics();
                } else if (this.textContent === 'Attrition Comparison') {
                    loadAttritionComparison();
                } else {
                    loadTalentPool();
                }
            }
        });
    });
    return filterContainer;
}

function createTableByArray (data, label) {
  const tableContainer = document.createElement("div");
  tableContainer.classList.add("table-container");
  tableContainer.id = label;
  const headerRow = document.createElement("div");
  headerRow.classList.add("table-row");
  createElement("div", "table-cell", "Company", headerRow);
  createElement("div", "table-cell", label, headerRow);
  tableContainer.appendChild(headerRow);

  const maxLength = Math.max(...Object.values(data).map(arr => arr.length));
  for (let i = 0; i < maxLength; i++) {
      const row = document.createElement("div");
      row.classList.add("table-row");
      for (const key in data) {
          if (Object.prototype.hasOwnProperty.call(data, key) && (key === 'Competitor' || key === label)) {
            createElement("div", "table-cell", data[key][i] || "na", row);
          }
      }
      tableContainer.appendChild(row);
  }
  return tableContainer;
}

function createProductView (data, label) {
  const productContainer = document.createElement("div");
  productContainer.classList.add("product__container");
  productContainer.id = label;
  const maxLength = Math.max(...Object.values(data).map(arr => arr.length));
  for (let i = 0; i < maxLength; i++) {
      const row = document.createElement("div");
      row.classList.add("product__container-item");
      for (const key in data) {
          if (Object.prototype.hasOwnProperty.call(data, key) && (key === 'Competitor' || key === label)) {
            console.log(key);
            if(data[key][i] && key == "Competitor"){
              const logo = document.createElement('img');
              logo.src = `https://main--ti-dashboard--adobe-khalid.hlx.live/images/${data[key][i].toLowerCase()}-logo-logo.png`;
              logo.alt = data[key][i];
              createElement('div', "logo", logo, row);
            }else if(data[key][i]) {
              const products = `<p>${data[key][i].replaceAll(',','</p><p>')}</p>`
              createElement('div', "products", products, row);
            }
              
          }
      }
      productContainer.appendChild(row);
  }
  return productContainer;
}

function createAttrition (data, label) {
  const productContainer = document.createElement("div");
  productContainer.classList.add("product__container");
  productContainer.id = label;
  const maxLength = Math.max(...Object.values(data).map(arr => arr.length));
  for (let i = 0; i < maxLength; i++) {
      const row = document.createElement("div");
      row.classList.add("product__container-item");
      for (const key in data) {
          if (Object.prototype.hasOwnProperty.call(data, key) && (key === 'Competitor' || key === label)) {
            console.log(key);
            if(data[key][i] && key == "Competitor"){
              const logo = document.createElement('img');
              logo.src = `https://main--ti-dashboard--adobe-khalid.hlx.live/images/${data[key][i].toLowerCase()}-logo-logo.png`;
              logo.alt = data[key][i];
              createElement('div', "logo", logo, row);
            }else if(data[key][i]) {
              const products = `<p>${ (parseFloat(data[key][i]) * 100)}%</p>`
              createElement('div', "products", products, row);
            }
              
          }
      }
      productContainer.appendChild(row);
  }
  return productContainer;
}

export default async function decorate(block) {
    block.childNodes.forEach((child) => {
        if (child.nodeType === 1) {
            const firstDivText = child.children[0].textContent.trim();
            let secondDivText = child.children[1].textContent.trim();
            if (firstDivText.indexOf('filter') >= 0) {
                secondDivText = secondDivText.split(',');
            }
            authorData[firstDivText] = secondDivText;
        }
    });

    try {
        const excelJson = await ExcelDataLoader('/scripts/TI-Dashboard-Template.xlsx');
        chartLoader = new ChartLoader();
        const filter = crateFilter(authorData['filter-left']);

        if (excelJson[authorData['sheet-name']]) {
            competitorInsights = arrayToObject(excelJson[authorData['sheet-name']]);
            loadTalentPool();
        }
        block.innerHTML = '';
        block.appendChild(filter);
        block.appendChild(retainContainer);
    } catch (error) {
        console.error('Error fetching Excel data in script1:', error);
    }
}
