// const BOLD = {
//   start: "<b>",
//   end: "</b>",
//   length: 3
// };
// const ITALIC = {
//   start: "<i>",
//   end: "</i>",
//   length: 3
// };
// const UNDERLINE = {
//   start: "<u>",
//   end: "</u>",
//   length: 3
// };
// const STRIKE = {
//   start: "<strike>",
//   end: "</strike>",
//   length: 8
// };
// const FONT = {
//   start: '<font face="monospace" color="#ff6600">',
//   end: "</font>",
//   length: 39
// };

// const isItTag = function(string, indexStart) {
//   if (string.charAt(indexStart + 1 === "/")) {
//     if (string.charAt(indexStart + 3) === ">") {
//       return string
//     }
//   } else {

//   }
// }

const getTagLength = function (tag) {};

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
  pasteIntoEditableDiv(
    originalText,
    event.clipboardData.getData("text"),
    textSelection
  );
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
  let indexStart = 0;
  for (let i = 0; i < positions.start; i++, indexStart++) {
    if (
      text.charAt(indexStart) === "<" &&
      text.charAt(indexStart + 3) === ">"
    ) {
      indexStart += 3;
    }
  }

  let indexEnd = 0;
  for (let i = 0; i < positions.end; i++, indexEnd++) {
    if (text.charAt(indexEnd) === "<" && text.charAt(indexEnd + 3) === ">") {
      indexEnd += 3;
    }
  }

  let textStart = text.slice(0, indexStart);
  let textEnd = text.slice(indexEnd);
  inputField.innerHTML = textStart + pastedText + textEnd;
};

const isEditor = function (element) {
  return element != null && element.classList.contains("ws-form--text");
};
