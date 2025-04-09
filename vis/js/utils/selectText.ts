const selectText = (id: string) => {
  const node = document.getElementById(id);

  if (!node) {
    console.error(`Element with id '${id}' not found`);
    return;
  }

  // Check for old IE version compatibility (not generally needed in modern web apps)
  if ((document as any).body.createTextRange) {
    const range = (document as any).body.createTextRange();
    range.moveToElementText(node);
    range.select();
  } else if (window.getSelection) {
    const selection = window.getSelection();
    if (selection) {
      const range = document.createRange();
      range.selectNodeContents(node);
      selection.removeAllRanges();
      selection.addRange(range);
    }
  }
};

export default selectText;