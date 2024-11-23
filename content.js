function copyToClipboard(text) {
    const textarea = document.createElement("textarea");
    document.body.appendChild(textarea);
    textarea.value = text;
    textarea.select();
    document.execCommand("copy");
    document.body.removeChild(textarea);
    console.log(text); 
  }
  
  document.addEventListener('click', function (event) {
    event.preventDefault();
    const element = event.target;
    const { xpath, message } = getUniqueXPath(element);
  
    copyToClipboard(xpath);
    alert(message); 
  });
  
  function getUniqueXPath(element) {
    const baseXPath = getXPath(element);
  
   
    if (isXPathUnique(baseXPath)) {
      return { xpath: baseXPath, message: "XPath copiado: " + baseXPath };
    }
    

    const refinedXPath = refineXPath(baseXPath, element);
    return { xpath: refinedXPath, message: "XPath copiado, pode incluir refinamentos: " + refinedXPath };
  }
  
  function isXPathUnique(xpath) {
    const matchingElements = document.evaluate(xpath, document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
    return matchingElements.snapshotLength === 1;
  }
  
  function refineXPath(baseXPath, element) {
    let refinedXPath = baseXPath;
    let index = 1;
  
    while (true) {
      refinedXPath = `(${baseXPath})[${index}]`;
      if (isXPathUnique(refinedXPath)) {
        return refinedXPath;
      }
      index++;
    
      if (index > 100) break;
    }
  
  
    return refineWithUniqueAttributes(element) || refinedXPath;
  }
  
  function refineWithUniqueAttributes(element) {
    const elements = document.querySelectorAll('*');
    for (let el of elements) {
      const xpath = getXPath(el);
      if (isXPathUnique(xpath) && isMoreSpecific(xpath, getXPath(element))) {
        return xpath;
      }
    }
    return null;
  }
  
  function isMoreSpecific(candidateXPath, originalXPath) {

    return candidateXPath.length < originalXPath.length;
  }
  
  function getXPath(element) {
    if (element.id) {
      return `//*[@id="${element.id}"]`;
    }
  
    const attributes = ['ng-click', 'ng-if', 'class'];
    for (let attr of attributes) {
      if (element.hasAttribute(attr)) {
        return `//*[contains(@${attr},"${element.getAttribute(attr)}")]`;
      }
    }
  
    const text = element.textContent.trim();
    if (text) {
      return `//*[contains(text(),"${text}")]`;
    }
  
    return getHierarchicalXPath(element);
  }
  
  function getHierarchicalXPath(element) {
    let segments = [];
    let currentElement = element;
  
    while (currentElement && currentElement.nodeType === Node.ELEMENT_NODE) {
      let index = 1;
      let sibling = currentElement.previousElementSibling;
  
      while (sibling) {
        if (sibling.tagName === currentElement.tagName) {
          index++;
        }
        sibling = sibling.previousElementSibling;
      }
  
      const tagName = currentElement.tagName.toLowerCase();
      let segment = tagName;
  
      if (index > 1) {
        segment += `[${index}]`;
      }
  
      segments.unshift(segment);
      currentElement = currentElement.parentElement;
    }
  
    return `/${segments.join('/')}`;
  }
  