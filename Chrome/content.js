const NBSPEntity = /&nbsp/g;
const NEWLINE = /\r\n|\n/g;
const RIGHT_ARROW_ENTITY = /-&gt/g; // ->

let inputField = null;
let originalText = "";
let textSelection = null;

const observer = new MutationObserver(() => {
  const newInputField = document.querySelector(".ws-form--text");

  if (newInputField && newInputField !== inputField) {
    handleNewInputField(newInputField);
  }
});

observer.observe(document.body, {
  childList: true,
  subtree: true,
});

const handleNewInputField = function (newInputField) {
  if (!newInputField) {
    return;
  }

  if (inputField) {
    document.removeEventListener("selectionchange", handleSelectionChange);
    inputField.removeEventListener("keydown", handleKeydownCtrlV);
    inputField.removeEventListener("paste", handlePasteText);
  }

  inputField = newInputField;

  document.addEventListener("selectionchange", handleSelectionChange);
  inputField.addEventListener("keydown", handleKeydownCtrlV);
  inputField.addEventListener("paste", handlePasteText);
};

const handleKeydownCtrlV = function (event) {
  if (event.ctrlKey && event.code === "KeyV") {
    originalText = inputField.innerHTML;
  }
};

const handlePasteText = function (event) {
  let pastedText = event.clipboardData.getData("text");

  pastedText = pastedText.replaceAll(NEWLINE, "<br>");

  pasteIntoEditableDiv(originalText, pastedText, textSelection);
};

const handleSelectionChange = function () {
  if (isEditor(document.activeElement)) {
    textSelection = getTextSelection(document.activeElement);
  }
};

const getTextSelection = function (editor) {
  const selection = window.getSelection();

  if (selection != null && selection.rangeCount > 0) {
    const range = selection.getRangeAt(0);

    return {
      start: getTextLength(editor, range.startContainer, range.startOffset),
      end: getTextLength(editor, range.endContainer, range.endOffset),
    };
  } else return null;
};

const getTextLength = function (parent, node, offset) {
  let textLength = 0;

  if (node.nodeName == "#text") textLength += offset;
  else
    for (let i = 0; i < offset; i++)
      textLength += getNodeTextLength(node.childNodes[i]);

  if (node != parent)
    textLength += getTextLength(parent, node.parentNode, getNodeOffset(node));

  return textLength;
};

const getNodeTextLength = function (node) {
  let textLength = 0;

  if (node.nodeName == "BR") textLength = 4;
  else if (node.nodeName == "#text") textLength = node.nodeValue.length;
  else if (node.childNodes != null)
    for (let i = 0; i < node.childNodes.length; i++)
      textLength += getNodeTextLength(node.childNodes[i]);

  return textLength;
};

const getNodeOffset = function (node) {
  return node == null ? -1 : 1 + getNodeOffset(node.previousSibling);
};

const pasteIntoEditableDiv = function (text, pastedText, positions) {
  let indexStart = getAdjustedCursorPosition(text, positions.start);
  let indexEnd = indexStart;

  if (positions.start != positions.end) {
    indexEnd = getAdjustedCursorPosition(text, positions.end);
  }

  let textStart = text.slice(0, indexStart);
  let textEnd = text.slice(indexEnd);

  inputField.innerHTML = textStart + pastedText + textEnd;
  setCursorToEnd(inputField);
};

const getAdjustedCursorPosition = function (text, cursorIndex) {
  let adjustedCursorIndex = 0;
  for (let i = 0; i < cursorIndex; i++, adjustedCursorIndex++) {
    if (
      text.charAt(adjustedCursorIndex) === "-" &&
      isRightArrowEntity(text, adjustedCursorIndex)
    ) {
      adjustedCursorIndex += 3;
    } else if (
      text.charAt(adjustedCursorIndex) === "&" &&
      isNBSPEntity(text, adjustedCursorIndex)
    ) {
      adjustedCursorIndex += 5;
    }
  }

  return adjustedCursorIndex;
};

const isRightArrowEntity = function (text, indexStart) {
  let substr = text.slice(indexStart, indexStart + 5);
  return substr.match(RIGHT_ARROW_ENTITY) !== null;
};

const isNBSPEntity = function (text, indexStart) {
  let substr = text.slice(indexStart, indexStart + 6);
  return substr.match(NBSPEntity) !== null;
};

const isEditor = function (element) {
  return element != null && element.classList.contains("ws-form--text");
};

function setCursorToEnd(element) {
  const range = document.createRange();
  const sel = window.getSelection();

  range.selectNodeContents(element);
  range.collapse(false);

  sel.removeAllRanges();
  sel.addRange(range);
}
