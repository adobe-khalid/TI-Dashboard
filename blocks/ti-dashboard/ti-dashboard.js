export default function decorate(block) {
  const authorData = {};
  block.childNodes.forEach((child) => {
    if (child.nodeType === 1) {
      const firstDivText = child.children[0].textContent.trim();
      const secondDivText = child.children[1].textContent.trim();
      authorData[firstDivText] = secondDivText;
    }
  });

  console.log('authorData', authorData);
}
