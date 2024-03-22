/* eslint-disable no-undef */
/* eslint-disable no-new */
import ExcelDataLoader from '../../scripts/excel-to-json-helper.js';
import MapLoader from '../../scripts/map-helper.js';
import ChartLoader from '../../scripts/chart-helper.js';
import { printTitleTemplate, printSectionTemplate } from '../../scripts/dashboard-template.js';

const authorData = {};

function getSkillChart(data, tabValue, keyToPrint) {
  const config = {
    years: ['Q3 2022', 'Q4 2022', 'Q1 2023', 'Q2 2023'],
    tabValue,
    topics: ['Numpy', 'Pandas', 'Pytorch', 'R', 'Tensorflow'],
    data: data.filter((v) => v['Adobe Geo'] === tabValue),
  };

  const chartConfig = {
    type: 'line',
    data: {
      labels: config.years.map((v) => (v.length ? (v.slice(0, -4) + v.slice(-2)) : '')),
      datasets: [],
    },
    options: {
      maintainAspectRatio: false,
    },
  };

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

    chartConfig.data.datasets.push({
      label: t,
      data: topicsValues,
      fill: false,
      tension: 0.1,
    });
  });

  return chartConfig;
}

export default async function decorate(block) {
  const parentClass = 'reskill';

  // iterate over children and get all authoring data
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
  console.log('authorData', authorData);

  block.innerHTML = '';
  // print title
  printTitleTemplate(authorData, block);
  // print section one
  printSectionTemplate({ title: authorData['title-skill-github'] }, block, true);
  // print section two
  printSectionTemplate({ title: authorData['title-startup-overview'] }, block, false);

  try {
    const excelJson = await ExcelDataLoader('/scripts/TI-Dashboard-Template.xlsx');
    const mapLoader = new MapLoader('AIzaSyBz3r5qBJ3f7UiT28LKYJT4sjcORCVIQiw');
    const chartLoader = new ChartLoader();
    const sectionOneEle = document.querySelector(`.${parentClass} .dashboard__section-one`);
    const sectionTwoEle = document.querySelector(`.${parentClass} .dashboard__section-two`);

    console.log('Excel Data from script1:', excelJson);

    let res = {};
    const cities = ['Brabantine City', 'Rhine-Neckar', 'Lyon', 'Cologne', 'Romania'];
    const chartData = excelJson['Gen AI Emerging skills 2024'];
    res = await chartLoader.loadChart(getSkillChart(chartData, 'EMEA', 'Github Pushes'));
    sectionOneEle.append(res);
    await mapLoader.loadMap(sectionTwoEle, 'reskillMap', cities);
  } catch (error) {
    console.error('Error fetching Excel data in script1:', error);
  }
}
