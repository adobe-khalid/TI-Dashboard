export const arrayToObject = (inputArray) => {
    const outputObject = {};
    inputArray.forEach(item => {
        for (const key in item) {
            if (item.hasOwnProperty(key)) {
                if (!outputObject[key]) {
                    outputObject[key] = [];
                }
                const value = item[key];
                outputObject[key].push(value !== null ? value : 'na');
            }
        }
    });
    return outputObject;
};
