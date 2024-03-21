function printTitleTemplate(dataObj, bindOnElement) {
  const config = dataObj || {};
  const parentClass = 'dashboard__title';
  const parentEle = document.createElement('div');

  parentEle.className = parentClass;

  if (config['title-main']) {
    const titleMain = document.createElement('div');
    titleMain.append(config['title-main']);
    titleMain.className = `${parentClass}-main`;
    parentEle.appendChild(titleMain);
  }

  if (config['title-sub']) {
    const titleSub = document.createElement('div');
    titleSub.append(config['title-sub']);
    titleSub.className = `${parentClass}-sub`;
    parentEle.appendChild(titleSub);
  }

  if (config['btn-info']) {
    const btnInfo = document.createElement('span');
    btnInfo.append('i');
    btnInfo.className = `${parentClass}-btn-info`;
    parentEle.appendChild(btnInfo);
  }

  if (bindOnElement) {
    bindOnElement.appendChild(parentEle);
  }
}

function printFilterTabsTemplate(leftFilter, rightFilter, bindOnElement) {
  if (leftFilter) {
    // left tab filter html
  }

  if (rightFilter) {
    // left tab filter html
  }

  if (bindOnElement) {
    // append all above created elements to bindOnElement
  }
}

function printSectionTemplate(dataObj, bindOnElement, firstSection = true) {
  const parentClass = 'dashboard__section';
  const selectorClass = firstSection ? 'dashboard__section-one' : 'dashboard__section-two';
  const parentEle = document.createElement('div');
  parentEle.className = `${parentClass} ${selectorClass}`;

  if (dataObj.title) {
    const titleEle = document.createElement('div');
    titleEle.className = `${parentClass}-heading`;
    titleEle.append(dataObj.title);
    parentEle.appendChild(titleEle);
  }

  if (bindOnElement) {
    bindOnElement.appendChild(parentEle);
  }
}

export {
  printTitleTemplate,
  printFilterTabsTemplate,
  printSectionTemplate,
};
