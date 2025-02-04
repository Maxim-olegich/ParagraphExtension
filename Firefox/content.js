const BR = "<br>";

const NBSP = /&nbsp;|&nbsp/g;
const NEWLINE = /\r\n|\n/g;

let inputField = null;
let originalText = "";
let textSelection = null;

const observer = new MutationObserver(() => {
  const newInputField = document.querySelector(".ws-form--text");

  if (newInputField && newInputField !== inputField) {
    // console.log("newInputField was found:", inputField);
    handleNewInputField(newInputField);
  }
});

observer.observe(document.body, {
  childList: true,
  subtree: true,
});

const handleNewInputField = function (newInputField) {
  if (!newInputField) {
    // console.log(`newInputField is null or empty`);
    return;
  }

  if (inputField) {
    document.removeEventListener("selectionchange", handleSelectionChange);
    inputField.removeEventListener("keydown", handleKeydownCtrlV);
    inputField.removeEventListener("paste", handlePasteText);
  }

  inputField = newInputField;
  // console.log("new inputField detected:", inputField);

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

  // alert(pastedText);
  // console.log(pastedText);

  pasteIntoEditableDiv(originalText, pastedText, textSelection);
};

const handleSelectionChange = function () {
  // console.log("handleSelectionChange");

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

  if (node.nodeName == "BR") textLength = 1;
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
  // console.log(text);

  text = text.replaceAll(NBSP, " ");

  let indexStart = getAdjustedBRCursorPosition(text, positions.start);
  let indexEnd = indexStart;

  if (positions.start != positions.end) {
    indexEnd = getAdjustedBRCursorPosition(text, positions.end);
  }

  let textStart = text.slice(0, indexStart);
  let textEnd = text.slice(indexEnd);

  inputField.innerHTML = textStart + pastedText + textEnd;
  setCursorToEnd(inputField);
};

const getAdjustedBRCursorPosition = function (text, cursorIndex) {
  let adjustedCursorIndex = 0;
  for (let i = 0; i < cursorIndex; i++, adjustedCursorIndex++) {
    if (
      text.charAt(adjustedCursorIndex) === "<" &&
      isBRTag(text, adjustedCursorIndex)
    ) {
      adjustedCursorIndex += 3;
    }
  }

  return adjustedCursorIndex;
};

const isBRTag = function (text, indexStart) {
  return BR.localeCompare(text.slice(indexStart, indexStart + 4)) === 0;
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
