export const createElement = (elementType, classNames, text = null, parent = null) => {
  const element = document.createElement(elementType);
  if (classNames) {
    if (classNames.includes(',')) {
      classNames
        .split(',')
        .map((className) => className.trim())
        .forEach((className) => {
          element.classList.add(className);
        });
    } else {
      element.classList.add(classNames.trim());
    }
  }
  if (text instanceof HTMLElement) {
    element.appendChild(text);
  } else if (text) {
    element.innerHTML = text;
  }
  if (parent) {
    parent.appendChild(element);
  }
  return element;
};

export const createFilterElements = (filterData, parentClass, bindOnElement) => {
  const filterItemList = createElement('div', `${parentClass}-item`, null, bindOnElement);
  filterData.forEach((value, key) => {
    const className = key === 0 ? 'active' : '';
    const filterItem = createElement('button', className, value, filterItemList);
    filterItem.addEventListener('click', function () {
      // console.log('callback function', this.textContent);
      if (!this.classList.contains('active')) {
        this.parentNode.querySelector('button.active').classList.remove('active');
        this.classList.add('active');
      }
    });
  });
  return bindOnElement;
};

export const printTitleTemplate = (dataObj, bindOnElement) => {
  const config = dataObj || {};
  const parentClass = 'dashboard__title';
  const parentEle = createElement('div', parentClass, '', bindOnElement);

  if (config['title-main']) {
    createElement('div', `${parentClass}-main`, config['title-main'], parentEle);
  }

  if (config['title-sub']) {
    createElement('div', `${parentClass}-sub`, config['title-sub'], parentEle);
  }

  if (config['btn-info']) {
    createElement('span', `${parentClass}-btn-info`, 'i', parentEle);
  }
};

export const printFilterTabsTemplate = (leftFilter, rightFilter, bindOnElement) => {
  const parentClass = 'dashboard__filter';
  const filterContainer = createElement('div', parentClass);
  const leftFilterClasses = `${parentClass}-left,${parentClass}`;
  const rightFilterClasses = `${parentClass}-right,${parentClass}`;

  if (leftFilter) {
    createFilterElements(leftFilter, leftFilterClasses, filterContainer);
  }

  if (rightFilter) {
    createFilterElements(rightFilter, rightFilterClasses, filterContainer);
  }

  if (bindOnElement) {
    bindOnElement.appendChild(filterContainer);
  }
};

export const printSectionTemplate = (dataObj, bindOnElement, firstSection = true) => {
  const parentClass = 'dashboard__section';
  const selectorClass = firstSection ? 'dashboard__section-one' : 'dashboard__section-two';
  const parentEle = createElement('div', `${parentClass},${selectorClass}`);

  if (dataObj.title) {
    createElement('div', `${parentClass}-heading`, dataObj.title, parentEle);
  }

  if (bindOnElement) {
    bindOnElement.appendChild(parentEle);
  }
};

export const arrayToObject = (inputArray) => {
  const outputObject = {};
  inputArray.forEach((item) => {
    Object.keys(item).forEach((key) => {
      if (!outputObject[key]) {
        outputObject[key] = [];
      }
      const value = item[key];
      outputObject[key].push(value !== null ? value : 'na');
    });
  });
  return outputObject;
};
