/* eslint-disable no-undef */
import { loadScript } from './aem.js';

class ExcelSheetConverter {
  constructor(excelUrl) {
    this.excelUrl = excelUrl;
    this.resultJson = null;
  }

  async convertToJSON() {
    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.17.3/xlsx.full.min.js');
    return new Promise((resolve, reject) => {
      fetch(this.excelUrl, {
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        },
      }).then((response) => {
        if (!response.ok) {
          throw new Error('Failed to fetch Excel file');
        }
        return response.blob();
      }).then((blob) => {
        const fileReader = new FileReader();
        fileReader.onload = () => {
          const binaryString = fileReader.result;
          const workbook = XLSX.read(binaryString, {
            type: 'binary',
          });
          const jsonData = {};
          workbook.SheetNames.forEach((sheetName) => {
            const sheetData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
            jsonData[sheetName] = sheetData;
          });
          this.resultJson = jsonData; // Set the results
          resolve(jsonData);
        };
        fileReader.readAsBinaryString(blob);
      }).catch((error) => {
        console.error('Error fetching or converting Excel file:', error);
        reject(error);
      });
    });
  }

  get results() {
    return this.resultJson;
  }

  set results(data) {
    this.resultJson = data;
  }
}

export default ExcelSheetConverter;
