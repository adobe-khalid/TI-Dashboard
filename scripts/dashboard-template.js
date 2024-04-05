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

export const createFilterElements = (filterData, parentClass, wrapperClass, bindOnElement) => {
  const filterItemList = createElement('div', `${wrapperClass}-item`, null, bindOnElement);
  filterData.forEach((value, key) => {
    let className = `${parentClass}-button`;
    className += key === 0 ? ',active' : '';
    const filterItem = createElement('button', className, value, filterItemList);
    filterItem.addEventListener('click', () => {
      // console.log('callback function', this.textContent);
      if (!filterItem.classList.contains('active')) {
        filterItem.parentNode.querySelector('button.active').classList.remove('active');
        filterItem.classList.add('active');
      }
    });
  });
  return bindOnElement;
};

export const printTitleTemplate = (dataObj, bindOnElement) => {
  const config = dataObj || {};
  const parentClass = 'dashboard-title';
  const parentEle = createElement('div', parentClass, '', bindOnElement);

  if (config['title-main']) {
    createElement('div', `${parentClass}-main`, config['title-main'], parentEle);
  }

  if (config['title-sub']) {
    createElement('div', `${parentClass}-sub`, config['title-sub'], parentEle);
  }

  if (config['btn-info']) {
    const infoBtnEle = createElement('span', `${parentClass}-btn-info`, 'i', parentEle);
    createElement('span', `${parentClass}-btn-info-text`, config['btn-info'], parentEle);

    infoBtnEle.addEventListener('mouseenter', () => {
      parentEle.querySelector(`.${parentClass}-btn-info-text`).classList.add('show');
    });

    infoBtnEle.addEventListener('mouseleave', () => {
      parentEle.querySelector(`.${parentClass}-btn-info-text`).classList.remove('show');
    });
  }
};

export const printFilterTabsTemplate = (leftFilter, rightFilter, bindOnElement) => {
  const parentClass = 'dashboard-filter';
  const filterContainer = createElement('div', parentClass);
  const leftFilterClasses = `${parentClass}-left,${parentClass}`;
  const rightFilterClasses = `${parentClass}-right,${parentClass}`;

  if (leftFilter) {
    createFilterElements(leftFilter, parentClass, leftFilterClasses, filterContainer);
  }

  if (rightFilter) {
    createFilterElements(rightFilter, parentClass, rightFilterClasses, filterContainer);
  }

  if (bindOnElement) {
    bindOnElement.appendChild(filterContainer);
  }
};

export const printSectionTemplate = (dataObj, bindOnElement, firstSection = true) => {
  const parentClass = 'dashboard-section';
  const selectorClass = firstSection ? 'dashboard-section-one' : 'dashboard-section-two';
  const parentEle = createElement('div', `${parentClass},${selectorClass}`);

  if (dataObj.title) {
    createElement('div', `${parentClass}-heading`, dataObj.title, parentEle);
  }

  if (bindOnElement) {
    bindOnElement.appendChild(parentEle);
  }
};

export const arrayToObject = (inputData) => {
  const outputObject = {};
  inputData.forEach(({ Competitor, ...data }) => {
    Object.entries(data).forEach(([key, value]) => {
      outputObject[key] = {
        ...(outputObject[key] || {}),
        [Competitor]: value,
      };
    });
  });
  return outputObject;
};
