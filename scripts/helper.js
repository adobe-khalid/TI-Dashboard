import { createElement } from './dashboard-template.js';

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

function toggleDropdown(event) {
  const dropdownButton = event.currentTarget;
  dropdownButton.classList.toggle('open');
  const dropdownContent = document.querySelector('.dropdown-content');
  dropdownContent.classList.toggle('show');
}

function showHideElement(event) {
  const targetText = event.target.textContent;
  const targetClass = `${targetText.toLowerCase()}-wrapper`;
  const dropdownBtn = document.querySelector('.dropdown-btn');
  dropdownBtn.textContent = targetText;
  document.querySelector('.dashboard .dashboard-show')?.classList.remove('dashboard-show');
  document.querySelector(`.${targetClass}`).classList.add('dashboard-show');
}

function createDropdownItems(items) {
  const dropdownContent = document.querySelector('.dropdown-content');
  dropdownContent.innerHTML = '';
  items.forEach((itemText) => {
    const dropdownItem = createElement('button', 'dropdown-content-button', itemText, dropdownContent);
    dropdownItem.addEventListener('click', showHideElement);
  });
}

function loadDropdown() {
  const initialItems = [];
  const childSectionBlocks = document.querySelector('.dashboard').children;

  for (let i = 0; i < childSectionBlocks.length; i += 1) {
    const childClass = childSectionBlocks[i].className.split('-')[0];
    if (i === 0) {
      childSectionBlocks[i].classList.add('dashboard-show');
    }
    initialItems.push(childClass);
  }

  const mainElement = document.querySelector('main');
  const dropdownContainer = createElement('div', 'dropdown');
  mainElement.prepend(dropdownContainer);

  const dropdownButton = createElement('button', 'dropdown-btn', initialItems[0], dropdownContainer);
  dropdownButton.addEventListener('click', toggleDropdown);

  createElement('div', 'dropdown-content', null, dropdownContainer);
  createDropdownItems(initialItems);

  window.addEventListener('click', (event) => {
    if (!dropdownButton.contains(event.target)) {
      const dropdownContent = document.querySelector('.dropdown-content');
      dropdownContent.classList.remove('show');
      dropdownButton.classList.remove('open');
    }
  });
}

function removeElementById(id) {
  const element = document.getElementById(id);
  if (element) {
    element.parentNode.removeChild(element);
  }
}

export {
  getAuthorData,
  isNumber,
  formatNumber,
  abbrevToNumber,
  getLastValueFromRange,
  loadDropdown,
  removeElementById,
};
