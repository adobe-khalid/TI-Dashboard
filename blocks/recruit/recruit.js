/* eslint-disable no-undef */
/* eslint-disable no-new */
import ExcelDataLoader from '../../scripts/excel-to-json-helper.js';
import MapLoader from '../../scripts/map-helper.js';
import ChartLoader from '../../scripts/chart-helper.js';

export default async function decorate(block) {
  const parentClass = 'recruit';
  const authorData = {};
  const titleEle = document.createElement('div');
  titleEle.append('Recruit');
  titleEle.className = `${parentClass}__title`;
  const sectionTop = document.createElement('div');
  sectionTop.className = `${parentClass}__section-top`;
  const sectionTopHeading = document.createElement('div');
  sectionTopHeading.append('Industry Trends');
  sectionTopHeading.className = `${parentClass}__section-top-heading`;
  const sectionBottom = document.createElement('div');
  sectionBottom.className = `${parentClass}__section-bottom`;
  const sectionBottomHeading = document.createElement('div');
  sectionBottomHeading.append('Industry Demographics');
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

  console.log('authorData', authorData);

  try {
    const excelJson = await ExcelDataLoader('/scripts/TI-Dashboard-Template.xlsx');
    const mapLoader = new MapLoader('AIzaSyBz3r5qBJ3f7UiT28LKYJT4sjcORCVIQiw');
    const chartLoader = new ChartLoader();

    console.log('Excel Data from script1:', excelJson);

    let res = {};
    const cities = ['Madrid', 'Warsaw', 'Copenhagen metropolitan area', 'Frankfurt Rhine-Main', 'Stockholm'];
    const chartData = excelJson['EMEA 5-10years'].slice(0, 6);
    res = await chartLoader.loadChart({
      type: 'scatter',
      data: {
        labels: chartData.map((v) => v.Location),
        datasets: [{
          type: 'bar',
          label: 'Professionals',
          data: chartData.map((v) => v.Professionals),
          borderColor: '#0FB5AE',
          backgroundColor: '#4046CA',
        }, {
          type: 'bar',
          label: 'Related Job posts',
          data: chartData.map((v) => v['Related Job posts']),
          borderColor: 'rgb(255, 99, 132)',
          backgroundColor: 'rgba(255, 32, 45, 0.2)',
        }, {
          type: 'line',
          label: '1y growth',
          data: chartData.map((v) => v['1y growth'] * 1000),
          fill: false,
          borderColor: 'rgb(54, 162, 235)',
        }],
      },
      options: {
        plugins: {
          legend: {
            position: 'bottom',
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
    block.innerHTML = '';
    sectionTop.append(sectionTopHeading, res);
    sectionBottom.append(sectionBottomHeading);
    block.append(titleEle, sectionTop, sectionBottom);
    await mapLoader.loadMap(sectionBottom, 'recruitMap', cities);
  } catch (error) {
    console.error('Error fetching Excel data in script1:', error);
  }
}
