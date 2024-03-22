/* eslint-disable no-undef */
/* eslint-disable no-new */
import ExcelDataLoader from '../../scripts/excel-to-json-helper.js';
import MapLoader from '../../scripts/map-helper.js';
import ChartLoader from '../../scripts/chart-helper.js';
import { printTitleTemplate, printSectionTemplate } from '../../scripts/dashboard-template.js';

function groupData(data) {
  // Grouping the data
  const groupedData = data.reduce((acc, obj) => {
    const key = `${obj['Adobe Geo']}-${obj.Quarter}-${obj.Year}-${obj.Topics}`;
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(obj);
    return acc;
  }, {});

  return groupedData;
}

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
    topics: ['Numpy', 'Pandas', 'Pytorch', 'R', 'Tensor'],
    data: [],
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

  // config.data = data.filter((v) => {
  //   const checkQuarterYear = config.years.filter((qy) => qy === `Q${v.Quarter} ${v.Year}`);
  //   const checkTopic = config.topics.filter((t) => t.toLowerCase() === v.Topics);
  //   return checkQuarterYear.length && v['Adobe Geo'] === config.geo && checkTopic;
  // });

   console.log("config.data ", data);

  config.topics.forEach((v, i) => {
    let filterData = [];
    config.years.forEach((y) => {
      filterData = data.filter((vv) => {
        const checkQuarterYear = (y === `Q${vv.Quarter} ${vv.Year}`);
        const checkTopics = config.topics.filter((t) => t === vv.Topics);
        return checkQuarterYear && vv['Adobe Geo'] === config.geo && checkTopics;
      });
    });

    console.log("filterData ", filterData);

    const combinedTopics = mergeValueBasedOnKey(filterData, 'Topics', 'Github Pushes');
    console.log("combinedTopics ", combinedTopics);

    console.log("combiined github pushes ", combinedTopics.map((ct) => ct['Github Pushes']));

    chartConfig.data.datasets.push({
      label: v,
      data: combinedTopics.map((ct) => (ct['Github Pushes'] + (i * 100))),
      fill: false,
      borderColor: `rgb(${i}75, ${i * 2}2, ${i * 4}2)`,
      tension: 0.1,
    });
  });

  return chartConfig;
}

export default async function decorate(block) {
  const parentClass = 'reskill';
  const authorData = {};

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
    res = await chartLoader.loadChart(getLineChart(chartData, 'EMEA'));
    sectionOneEle.append(res);
    await mapLoader.loadMap(sectionTwoEle, 'reskillMap', cities);
  } catch (error) {
    console.error('Error fetching Excel data in script1:', error);
  }
}
