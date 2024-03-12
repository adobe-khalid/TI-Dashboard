/* eslint-disable no-undef */
let selectedFile;
// console.log(window.XLSX);
document.getElementById('input').addEventListener('change', (event) => {
  [selectedFile] = event.target.files;
});

document.getElementById('button').addEventListener('click', () => {
  if (selectedFile) {
    const fileReader = new FileReader();
    fileReader.readAsBinaryString(selectedFile);
    fileReader.onload = (event) => {
      const data = event.target.result;
      const workbook = XLSX.read(data, {
        type: 'binary',
      });
      const jsondataPlaceholder = document.getElementById('jsondata-placeholder');
      // console.log(workbook);
      workbook.SheetNames.forEach((sheet) => {
        const preTag = document.createElement('pre');
        const rowObject = XLSX.utils.sheet_to_row_object_array(workbook.Sheets[sheet]);
        // console.log(rowObject);
        // document.getElementById('jsondata').innerHTML = JSON.stringify(rowObject, undefined, 4)
        const node = document.createTextNode(JSON.stringify(rowObject, undefined, ' '));
        preTag.appendChild(node);
        jsondataPlaceholder.appendChild(preTag);
      });
    };
  }
});
