const pasteConfig = {
  trimPaste: {
    text: false,
    textarea: false,
    search: false,
    password: false
  }
};

export default {
  setConfig(newPasteConfig) {
    Object.keys(newPasteConfig).forEach(npcKey => {
      pasteConfig[npcKey] = newPasteConfig[npcKey];
    });
  },
  getInputOnPaste: (inputType = 'text') => {
    const trimPaste = pasteConfig.trimPaste[inputType];
    if (!trimPaste) {
      return undefined;
    }
    return (event) => {
      event.preventDefault();
      let paste = (event.clipboardData || window.clipboardData).getData("text");
      if (trimPaste) {
        paste = paste.trim();
      }
      const inputElement = event.target;
      const rFrom = Math.min(inputElement.selectionStart, inputElement.selectionEnd);
      const rTo = Math.max(inputElement.selectionStart, inputElement.selectionEnd);
      const newValueArray = (inputElement.value || '').split('');
      newValueArray.splice(rFrom, rTo - rFrom, paste);
      const nivSetter = Object.getOwnPropertyDescriptor(
        Object.getPrototypeOf(inputElement),
        "value"
      ).set;
      nivSetter.call(inputElement, newValueArray.join(''));
      const endPositionPasted = rFrom + paste.length;
      inputElement.setSelectionRange(endPositionPasted, endPositionPasted);
      inputElement.dispatchEvent(new Event('input', {
        view: window,
        bubbles: true,
        cancelable: true
      }));
    };
  }
};
