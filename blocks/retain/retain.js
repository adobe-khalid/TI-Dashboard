/* eslint-disable no-undef */
/* eslint-disable no-new */
import ExcelDataLoader from '../../scripts/excel-to-json-helper.js';
import MapLoader from '../../scripts/map-helper.js';
import ChartLoader from '../../scripts/chart-helper.js';

export default async function decorate(block) {
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

  try {
    const excelJson = await ExcelDataLoader('/scripts/TI-Dashboard-Template.xlsx');
    const mapLoader = new MapLoader('AIzaSyBz3r5qBJ3f7UiT28LKYJT4sjcORCVIQiw');
    const chartLoader = new ChartLoader();

    console.log('Excel Data from script1:', excelJson);

    let res = {};
    const cities = ['Bristol', 'Ruhr Region', 'Hamburg', 'Leeds', 'Geneva', 'Valencia', 'Bordeaux'];
    res = await chartLoader.loadChart(excelJson['EMEA 5-10years'].slice(0, 6));
    block.innerHTML = '';
    block.appendChild(res);
    await mapLoader.loadMap(block, 'retainMap', cities);
  } catch (error) {
    console.error('Error fetching Excel data in script1:', error);
  }
}
