/* eslint-disable no-undef */
import { loadScript } from './aem.js';

const cachedData = []; // Variable to cache the fetched Excel data

async function ExcelDataLoader(excelUrl) {
  const urlExist = cachedData.filter((v) => (v.excelUrl === excelUrl));
  if (urlExist.length && urlExist[0].excelUrl) {
    return urlExist[0].jsonData; // Return the cached data if available
  }

  await loadScript('https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.17.3/xlsx.full.min.js');

  try {
    // Fetch Excel data from the URL
    const response = await fetch(excelUrl, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      },
    });

    const blob = await response.blob();
    const fileReader = new FileReader();
    const dataPromise = new Promise((resolve, reject) => {
      fileReader.onload = () => {
        const binaryString = fileReader.result;
        const workbook = XLSX.read(binaryString, { type: 'binary' });

        const data = {};
        workbook.SheetNames.forEach((sheetName) => {
          const jsonData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
          data[sheetName] = jsonData;
        });

        cachedData.push({ excelUrl, jsonData: data }); // Cache the fetched data
        resolve(data);
      };

      fileReader.onerror = reject;
      fileReader.readAsBinaryString(blob);
    });

    return dataPromise;
  } catch (error) {
    throw new Error(`Error fetching or parsing Excel data: ${error.message}`);
  }
}

export default ExcelDataLoader;
