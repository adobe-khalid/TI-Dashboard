/* eslint-disable no-undef */
/* eslint-disable no-new */
import ExcelDataLoader from '../../scripts/excel-to-json-helper.js';
import MapLoader from '../../scripts/map-helper.js';
import ChartLoader from '../../scripts/chart-helper.js';
import { printTitleTemplate } from '../../scripts/dashboard-template.js';

function mergeValueBasedOnKey(data, keyToRefer, keyToMerge) {
  const mergedData = data.reduce((acc, obj) => {
    if (!acc[obj[keyToRefer]]) {
      acc[obj[keyToRefer]] = { ...obj };
    } else {
      acc[obj[keyToRefer]][keyToMerge] += obj[keyToMerge];
    }
    return acc;
  }, {});

  return Object.values(mergedData);
}

function getLineChart(data, geo) {
  const config = {
    years: ['Q3 2022', 'Q4 2022', 'Q1 2023', 'Q2 2023'],
    geo,
    topics: ['Numpy', 'Pandas', 'Pytorch', 'R', 'TensorFlow'],
    data: [],
  };

  const chartConfig = {
    type: 'line',
    data: {
      labels: config.years.map((v) => (v.length ? (v.slice(0, -4) + v.slice(-2)) : '')),
      datasets: [],
    },
  };

  // config.data = data.filter((v) => {
  //   const checkQuarterYear = config.years.filter((qy) => qy === `Q${v.Quarter} ${v.Year}`);
  //   const checkTopic = config.topics.filter((t) => t.toLowerCase() === v.Topics);
  //   return checkQuarterYear.length && v['Adobe Geo'] === 'EMEA' && checkTopic;
  // });

  console.log("config.data ", config.data);

  config.topics.forEach((v) => {
    const filterData = data.filter((vv) => {
      const checkQuarterYear = config.years.filter((qy) => qy === `Q${vv.Quarter} ${vv.Year}`);
      const checkTopics = config.topics.filter((t) => t === vv.Topics);
      return checkQuarterYear && vv['Adobe Geo'] === config.geo && checkTopics;
    });
    console.log("filterData ", filterData);

    const combinedTopics = mergeValueBasedOnKey(filterData, 'Topics', 'Github Pushes');
    console.log("combinedTopics ", combinedTopics);

    console.log("combiined github pushes ", combinedTopics.map((ct) => ct['Github Pushes']));

    chartConfig.data.datasets.push({
      label: v,
      data: combinedTopics.map((ct) => ct['Github Pushes']),
      fill: false,
      borderColor: 'rgb(75, 192, 192)',
      tension: 0.1,
    });
  });

  return chartConfig;
}

export default async function decorate(block) {
  const parentClass = 'reskill';
  const authorData = {};
  const sectionTop = document.createElement('div');
  sectionTop.className = `${parentClass}__section-top`;
  const sectionTopHeading = document.createElement('div');
  sectionTopHeading.append('Emerging Skills Based on Github');
  sectionTopHeading.className = `${parentClass}__section-top-heading`;
  const sectionBottom = document.createElement('div');
  sectionBottom.className = `${parentClass}__section-bottom`;
  const sectionBottomHeading = document.createElement('div');
  sectionBottomHeading.append('Startup Overview');
  sectionBottomHeading.className = `${parentClass}__section-bottom-heading`;

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

  block.innerHTML = '';
  // print title
  printTitleTemplate(authorData, 'reskill', block);

  console.log('authorData', authorData);

  try {
    const excelJson = await ExcelDataLoader('/scripts/TI-Dashboard-Template.xlsx');
    const mapLoader = new MapLoader('AIzaSyBz3r5qBJ3f7UiT28LKYJT4sjcORCVIQiw');
    const chartLoader = new ChartLoader();

    console.log('Excel Data from script1:', excelJson);

    let res = {};
    const cities = ['Brabantine City', 'Rhine-Neckar', 'Lyon', 'Cologne', 'Romania'];
    const chartData = excelJson['Gen AI Emerging skills 2024'];
    res = await chartLoader.loadChart(getLineChart(chartData, 'EMEA'));
    sectionTop.append(sectionTopHeading, res);
    sectionBottom.append(sectionBottomHeading);
    block.append(sectionTop, sectionBottom);
    await mapLoader.loadMap(sectionBottom, 'reskillMap', cities);
  } catch (error) {
    console.error('Error fetching Excel data in script1:', error);
  }
}
