let selectedFile;
console.log(window.XLSX);
document.getElementById('input').addEventListener("change", (event) => {
    selectedFile = event.target.files[0];
})

let data = [{
    "name": "jayanth",
    "data": "scd",
    "abc": "sdef"
}]


document.getElementById('button').addEventListener("click", () => {
    XLSX.utils.json_to_sheet(data, 'out.xlsx');
    if (selectedFile) {
        let fileReader = new FileReader();
        fileReader.readAsBinaryString(selectedFile);
        fileReader.onload = (event) => {
            let data = event.target.result;
            let workbook = XLSX.read(data, { type: "binary" });
            const jsondataPlaceholder = document.getElementById("jsondata-placeholder");
            console.log(workbook);
            workbook.SheetNames.forEach(sheet => {
                const preTag = document.createElement("pre");
                let rowObject = XLSX.utils.sheet_to_row_object_array(workbook.Sheets[sheet]);
                console.log(rowObject);
                // document.getElementById("jsondata").innerHTML = JSON.stringify(rowObject, undefined, 4)
                const node = document.createTextNode(JSON.stringify(rowObject, undefined, 4));
                preTag.appendChild(node);
                jsondataPlaceholder.appendChild(preTag);
            });
        }
    }
});