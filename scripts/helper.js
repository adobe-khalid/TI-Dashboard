function getAuthorData(block) {
  const authorData = {};
  // iterate over children and get all authoring data
  block.childNodes.forEach((child) => {
    if (child.nodeType === 1) {
      const objText = 'obj';
      let firstDivText = child.children[0].textContent.trim();
      let secondDivText = child.children[1].textContent.trim();

      if (firstDivText.indexOf(objText) >= 0) {
        firstDivText = firstDivText.replace(objText, '').trim();
        secondDivText = secondDivText.split(',');
      }

      authorData[firstDivText] = secondDivText;
    }
  });

  return authorData;
}

function isNumber(value) {
  // Remove commas from the value
  const valueWithoutCommas = value.replace(/,/g, '');
  // Check if the value is a valid number
  return !Number.isNaN(parseFloat(valueWithoutCommas))
    && Number.isFinite(parseFloat(valueWithoutCommas));
}

function formatNumber(value) {
  const numberValue = value.replace(/,/g, '');
  if (numberValue >= 1000000000) {
    return `${(numberValue / 1000000000).toFixed(1)}b`;
  } if (numberValue >= 1000000) {
    return `${(numberValue / 1000000).toFixed(1)}m`;
  } if (numberValue >= 1000) {
    return `${(numberValue / 1000).toFixed(1)}k`;
  }
  return numberValue;
}

function abbrevToNumber(abbrev) {
  // Define mapping of abbreviations to multipliers
  const abbreviations = {
    k: 1000,
    m: 1000000,
    b: 1000000000,
  };

  // Extract numeric value and abbreviation from the input string
  const matches = abbrev.match(/^([\d.]+)([kmb])?$/i);
  if (!matches) {
    throw new Error('Invalid abbreviation format');
  }

  // Convert numeric value to a number
  const numericValue = parseFloat(matches[1]);

  // Multiply by the corresponding multiplier if an abbreviation is provided
  if (matches[2]) {
    const multiplier = abbreviations[matches[2].toLowerCase()];
    if (!multiplier) {
      throw new Error('Invalid abbreviation');
    }
    return numericValue * multiplier;
  }

  return numericValue;
}

function getLastValueFromRange(value) {
  const computedValue = value || '0';
  const parts = computedValue.replace('$', '').split('—');
  const afterDash = parts[parts.length - 1];

  return afterDash;
}

export {
  getAuthorData,
  isNumber,
  formatNumber,
  abbrevToNumber,
  getLastValueFromRange,
};
