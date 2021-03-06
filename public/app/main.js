const kTabSize = 2;
const kTabKeyCode = 9;
const kZCode = 90;
const kYCode = 89;
const kMaxBufferLength = 100;

let buffers = {};

window.onclick = function(event) {
  if (!event.target.matches("#dropdown-button")) {

    var dropdowns = document.getElementsByClassName("dropdown-content");
    var i;
    for (i = 0; i < dropdowns.length; i++) {
      var openDropdown = dropdowns[i];
      if (openDropdown.classList.contains("show-dropdown")) {
        openDropdown.classList.remove("show-dropdown");
      }
    }
  }
}

let showDropdown = function() {
    document.getElementById("dropdown-examples").classList.toggle("show-dropdown");
}

let main = function() {
  addTabEvents();
}

let translateInputCode = function() {
  let input, tree, symbolTable, code = getCodeInput();

  input = getCodeInput();
  input = preprocess(input);
  document.getElementById("output-area").innerHTML = "";
  setCodeOutput("");
  setErrorText("");
  setTree("");

  if (input === undefined)
    return;

  try {
    tree = peg$parse(input);
    setTree(JSON.stringify(tree, null, 2));
    try {
      symbolTable = scopeAnalisis(tree);
      try {
        semanticAnalisis(tree, symbolTable);

        try {
          code = genCode(tree);
          setCodeOutput(code);
        } catch (error) {
          setErrorText("Code generation error:\n" + error);
        }
      } catch (error) {
        setErrorText("Semantic analysis error:\n" + error);
      }
    } catch (error) {
      setErrorText("Scope analysis error:\n" + error);
    }
  } catch (error) {
    setErrorText("Pegjs parse error:\n" + error);
  }
}

let setTree = function(jsonTree) {
  let treeArea = document.getElementById("box3-code");
  treeArea.innerHTML = JSON.stringify(jsonTree, null, 2).replace(/^/g,  "<p class=\"code-paragraph\">")
                                                        .replace(/$/g,  "</p>")
                                                        .replace(/\\n/g, "</p><p class=\"code-paragraph\">")
                                                        .replace(/\\/g,  "")
                                                        .replace(/"{/,   "{")
                                                        .replace(/}"/,   "}")
                                                        .replace(/("\w*?"):/g, "<span class=\"json-attr\">$1</span>:");
}

let setErrorText = function(error) {
  let errorArea = document.getElementById("error-area");
  errorArea.innerHTML = error;
}

let setCodeOutput = function(code) {
  let outputCode = document.getElementById("box2-code");
  outputCode.innerHTML = js_beautify(code).replace(/^/g,  "<p class=\"code-paragraph\">")
                                          .replace(/$/g,  "</p>")
                                          .replace(/\n/g, "</p><p class=\"code-paragraph\">");
}

let setCodeInput = function(code) {
  let outputCode = document.getElementById("box1-code");
  outputCode.innerHTML = code.replace(/^/g,  "<p class=\"code-paragraph\">")
                             .replace(/$/g,  "</p>")
                             .replace(/\n/g, "</p><p class=\"code-paragraph\">");
}

let getCodeInput = function() {
  let inputCode = document.getElementById("box1-code");
  return inputCode.innerHTML.replace(/<\/p>/g, "\n")
                            .replace(/<.*?>/g, "")
                            .replace(/&amp;/g, "&")
                            .replace(/&nbsp;/g, " ")
                            .replace(/&lt;/g,  "<")
                            .replace(/&gt;/g,  ">")
                            .replace(/<br>/g, "");
}

let evalCodeOutput = function() {
  let outputArea = document.getElementById("output-area");
  let code       = document.getElementById("box2-code").innerHTML;
  let result;

  try {
    result = "Output: " + JSON.stringify(eval(code.replace(/<\/p>/g, "\n")
                                                  .replace(/<.*?>/g, "")
                                                  .replace(/&amp;/g, "&")
                                                  .replace(/&nbsp;/g, " ")
                                                  .replace(/&lt;/g,  "<")
                                                  .replace(/&gt;/g,  ">")
                                                  .replace(/<br>/g, "")), null, 2);
  } catch (error) {
    result = "Eval error: " + error;
  }

  if (result === "Output: undefined") {
    outputArea.innerHTML = "Your output is 'undefined'. Try to add a return at the end of your code";
  } else {
    outputArea.innerHTML = result;
  }
}

let addTabEvents = function() {
  let tags = document.getElementsByTagName("code");

  for (let i = 0; i < tags.length; ++i) {
    tags[i].onkeydown = function(e) {
      if (((e.which === kTabKeyCode) || (e.keyCode === kTabKeyCode))) {
          e.preventDefault();
          addTab(tags[i]);
      }

      if (((e.which === kZCode) || (e.keyCode === kZCode)) && e.ctrlKey) {
          e.preventDefault();
          ctrlZ(tags[i]);
      } else if (((e.which === kYCode) || (e.keyCode === kYCode)) && e.ctrlKey) {
          e.preventDefault();
          ctrlY(tags[i]);
      } else {
        updateBuffers(tags[i]);
      }

      updateHighLight(tags[i]);
    }
  }
}

let updateBuffers = function(element) {
  if (!buffers[element]) {
    buffers[element] = {
      index: 0,
      contents: [removeHighLight(element.innerHTML)]
    }
    return;
  }

  let buffer = buffers[element];
  if (buffer.contents[buffer.index] !== element.innerHTML) {
    buffer.contents = buffer.contents.slice(0, buffer.index + 1);
    buffer.contents = buffer.contents.concat([removeHighLight(element.innerHTML)]);

    if (++buffer.index >= kMaxBufferLength) {
      buffer.contents = buffer.contents.slice(1);
      buffer.index--;
    }
  }
}

let ctrlZ = function(element) {
  if (!buffers[element]) {
    return;
  }

  let buffer = buffers[element];
  if (--buffer.index < 0) {
    buffer.index = 0;
  }
  element.innerHTML = buffer.contents[buffer.index];
}

let ctrlY = function(element) {
  if (!buffers[element]) {
    return;
  }

  let buffer = buffers[element];
  if (++buffer.index >= buffer.contents.length) {
    buffer.index = buffer.contents.length - 1;
  }
  element.innerHTML = buffer.contents[buffer.index];
}

let addTab = function(element) {
  var editor  = element;
  var doc     = editor.ownerDocument.defaultView;
  var sel     = doc.getSelection();
  var range   = sel.getRangeAt(0);

  var tabNode = document.createTextNode(generateTab());
  range.insertNode(tabNode);

  range.setStartAfter(tabNode);
  range.setEndAfter(tabNode);
  sel.removeAllRanges();
  sel.addRange(range);
}

let generateTab = function() {
  var tab = "";
  for (let i = 0; i < kTabSize; ++i) {
    tab += "\u00a0";
  }
  return tab;
}

let showMore = function(){
  showNathing();
  document.getElementById("mainMore").style.opacity = "1";
  document.getElementById("mainMore").style.display = "flex";
}

let showHome = function(){
  showNathing();
  document.getElementById("mainPrincipal").style.opacity = "1";
  document.getElementById("mainPrincipal").style.display = "block";
}

let showTutorial = function(){
  showNathing();
  document.getElementById("mainTutorial").style.opacity = "1";
  document.getElementById("mainTutorial").style.display = "flex";
}

let showNathing = function(){
  document.getElementById("mainPrincipal").style.opacity = "0";
  document.getElementById("mainPrincipal").style.display = "none";
  document.getElementById("mainMore").style.opacity = "0";
  document.getElementById("mainMore").style.display = "none";
  document.getElementById("mainTutorial").style.opacity = "0";
  document.getElementById("mainTutorial").style.display = "none";
}

main();
