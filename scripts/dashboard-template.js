function printTitleTemplate(dataObj, selector, bindOnElement) {
  const config = dataObj || {};
  const parentClass = `${selector}__title`;
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

function printFilterTabsTemplate(dataObj) {
  //printFilterTabsTemplate
}

export {
  printTitleTemplate,
  printFilterTabsTemplate,
};
