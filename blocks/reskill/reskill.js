/* eslint-disable no-undef */
/* eslint-disable no-new */
import ExcelDataLoader from '../../scripts/excel-to-json-helper.js';
import ChartLoader from '../../scripts/chart-helper.js';
import { printTitleTemplate, printFilterTabsTemplate, printSectionTemplate } from '../../scripts/dashboard-template.js';

let chart1 = {};
let chart2 = {};
let excelJson = {};
let skillChartExcelData = [];
let startupChartExcelData = [];
const parentClass = 'reskill';
const authorData = {};

function abbrevToNumber(abbrev) {
  // Define mapping of abbreviations to multipliers
  const abbreviations = {
    k: 1000,
    m: 1000000,
    b: 1000000000,
  };

  // Extract numeric value and abbreviation from the input string
  const matches = abbrev.match(/^([\d.]+)([kmb])?$/i);
  if (!matches) {
    throw new Error('Invalid abbreviation format');
  }

  // Convert numeric value to a number
  const numericValue = parseFloat(matches[1]);

  // Multiply by the corresponding multiplier if an abbreviation is provided
  if (matches[2]) {
    const multiplier = abbreviations[matches[2].toLowerCase()];
    if (!multiplier) {
      throw new Error('Invalid abbreviation');
    }
    return numericValue * multiplier;
  }

  return numericValue;
}

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
          beginAtZero: false,
        },
      },
    },
  };

  return chartConfig;
}

function getChart1Data(data, tabValue, keyToPrint) {
  const config = {
    years: authorData['chart-skill-year'],
    tabValue,
    topics: authorData['chart-skill-github'],
    data: data.filter((v) => v['Adobe Geo'] === tabValue),
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
          ? filterVal.reduce((sum, item) => sum + item[keyToPrint], 0)
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

function getLastValueFromRange(value) {
  const computedValue = value || '0';
  const parts = computedValue.replace('$', '').split('—');
  const afterDash = parts[parts.length - 1];

  return afterDash;
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
  const chartConfig = getChartConfig(chartData, chartType, chartAxis);

  return chartConfig;
}

function getStartupChart(data, tabValue, chartType = 'line', chartAxis = 'x') {
  const chartData = getChart2Data(data);
  const chartConfig = getChartConfig(chartData, chartType, chartAxis, 'top');

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
  printFilterTabsTemplate(authorData['filter-left'], null, block);
  // print section one
  printSectionTemplate({ title: authorData['title-skill-github'] }, block, true);
  // print section two
  printSectionTemplate({ title: authorData['title-startup-overview'] }, block, false);
  // filter listerners like click
  addFilterListener(block);

  try {
    excelJson = await ExcelDataLoader('/scripts/TI-Dashboard-Template.xlsx');
    const chartLoader = new ChartLoader();
    const sectionOneEle = document.querySelector(`.${parentClass} .dashboard-section-one`);
    const sectionTwoEle = document.querySelector(`.${parentClass} .dashboard-section-two`);
    const { leftFilterValue } = getFilterActiveTabs();

    // pick data from  excel tab 'Gen AI Emerging skills 2024'
    skillChartExcelData = excelJson[authorData['chart-skill-sheet-name']];
    startupChartExcelData = excelJson[authorData['chart-startup-sheet-name']];
    chart1 = await chartLoader.loadChart(getReskillChart(skillChartExcelData, leftFilterValue, 'Github Pushes'));
    chart2 = await chartLoader.loadChart(getStartupChart(startupChartExcelData, leftFilterValue, 'bar', 'y'));
    sectionOneEle.append(chart1.chart);
    sectionTwoEle.append(chart2.chart);
  } catch (error) {
    console.error('Error fetching Excel data in script1:', error);
  }
}
