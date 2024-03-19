/* eslint-disable no-undef */
/* eslint-disable no-new */
import ExcelDataLoader from '../../scripts/excel-to-json-helper.js';
import MapLoader from '../../scripts/map-helper.js';
import ChartLoader from '../../scripts/chart-helper.js';

export default function decorate(block) {
  const authorData = {};
  const recruit = block.classList.contains('recruit');
  const retain = block.classList.contains('retain');
  const reskill = block.classList.contains('reskill');

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

  if (recruit) {
    const excelDataLoader = new ExcelDataLoader('/scripts/TI-Dashboard-Template.xlsx');
    const mapLoader = new MapLoader('AIzaSyBz3r5qBJ3f7UiT28LKYJT4sjcORCVIQiw');
    const chartLoader = new ChartLoader();

    excelDataLoader.loadExcelData()
      .then(async (data) => {
        let res = {};
        console.log('Results are already available:', data);
        res = await chartLoader.loadChart(data['Tab_EMEA_5-10years'].slice(0, 6));
        block.innerHTML = '';
        block.appendChild(res);
        mapLoader.loadMap(block);
      })
      .catch((error) => console.error('Error fetching or converting Excel file:', error));
  } else if (retain) {
    // retain container code here
  } else if (reskill) {
    // retain container code here
  }
}
