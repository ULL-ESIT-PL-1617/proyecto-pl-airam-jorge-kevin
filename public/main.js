// Generated by CoffeeScript 1.12.4

(function() {
  var main;

  main = function() {
    var tree, source, code;
    source = original.value;
    //try {
      tree = peg$parse(source);
      symbolTable = scopeAnalisis(tree);
      semanticAnalisis(tree, symbolTable);
      //code = genCode(tree);
      result = code + "\n" + JSON.stringify(tree, null, 2)
    //} catch (error) {
    //  result = "<div class=\"error\">" + error + "</div>";
    //}
    return OUTPUT.innerHTML = result;
  };

  window.onload = function() {
    return PARSE.onclick = main;
  };


}).call(this);
