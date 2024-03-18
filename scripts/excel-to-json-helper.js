/* eslint-disable class-methods-use-this */
/* eslint-disable no-undef */
import { loadScript } from './aem.js';

export default class ExcelDataLoader {
  constructor(excelUrl) {
    this.excelUrl = excelUrl;
    this.jsonData = null;
  }

  async loadExcelData() {
    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.17.3/xlsx.full.min.js');

    const response = await fetch(this.excelUrl, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch Excel file');
    }

    const blob = await response.blob();
    const fileReader = new FileReader();

    return new Promise((resolve) => {
      fileReader.onload = () => {
        const binaryString = fileReader.result;
        const workbook = XLSX.read(binaryString, { type: 'binary' });
        const result = {};

        workbook.SheetNames.forEach((sheetName) => {
          const sheetData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
          result[sheetName] = sheetData;
        });

        this.jsonData = result;
        resolve(result);
      };

      fileReader.readAsBinaryString(blob);
    });
  }

  get data() {
    return this.jsonData;
  }

  set data(data) {
    this.jsonData = data;
  }
}
