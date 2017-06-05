//var beautify = require('js-beautify').js_beautify;

let prefixTemplate = function() {
  return `
module.exports = () => {
  let e;
  let sym = {};
  try {
  `;
}; // end prefix

let suffixTemplate  = function() {
   return `return sym;
  }
  catch(e) {
    let err = e.message.replace(/sym\\.(\\w+)/g, '$1');
    console.log(err);
    return "error";
  }
}
`;
}; // end suffix

let genCode = function(tree) {

   var prefix = prefixTemplate();
   var suffix = suffixTemplate();
   /* traverse the tree producing translation */
   let js = prefix+translate(tree)+suffix;
   //return beautify(js, { indent_size: 2 });
   return js;
};

let translate2 = function(obj, result) {
  //console.log(result.type);
  switch(result.type) {
      case "block":         block_(obj, result);
          break;
      case "if":            if_(obj, result);
          break;
      case "while":         while_(obj, result);
          break;
      case "for":           for_(obj, result);
          break;
      case "assign":        assign_(obj, result);
          break;
      case "declaration":   declaration_(obj, result);
          break;
      case "function":      function_(obj, result);
          break;
      case "parameter":     obj.code += result.vartype + " " + "_" + result.id;
          break;
      case "return":        return_(obj, result);
          break;
      case "class":         obj.code += "var " + "_" + result.id + " = ";
                            translate2(obj, result.content);
          break;
      case "classBlock":    classBlock_(obj, result);
          break;

      case "attribute":     obj.code += "_" + result.assignations[0].id + ": ";
                            translate2(obj, result.assignations[0].to);
          break
      case "method":        obj.code += "_" + result.functionName + ": function () ";
                            translate2(obj, result.contents);
          break;
      case "condition":     expCondTerm_(obj, result);
          break;
      case "expression":    expCondTerm_(obj, result);
          break;
      case "term":          expCondTerm_(obj, result);
          break;
      case "call":          call_(obj, result);
          break;
      case "idAccess":      idAccess_(obj, result);
          break;
      case "methodAccess":  methodAccess_(obj, result);
          break;
      case "id":            obj.code += "_" + result.id;
          break;
      case "arguments":     arguments_(obj, result);
          break;
      case "numeric":       obj.code += result.value;
          break;
      case "string":        obj.code += "\"" + result.value + "\"";
          break;
      case "bool":          obj.code += result.value;
          break;
      default:              throw "ERROR type not exist or is undefined.";
  }
}

let block_ = function(obj, result){
  obj.code += "{\n     ";
  for(let i = 0; i < result.contents.length; i++){
    obj.code += "     ";
    translate2(obj, result.contents[i]);
  }
  obj.code += "\n     }";
}

let if_ = function(obj, result){
  obj.code += "if (";
  translate2(obj, result.ifCode.check);
  obj.code += ")";
  translate2(obj, result.ifCode.contents);
  if(result.elseIfCode != null){
    for (let i = 0; i < result.elseIfCode.length; i++) {
      obj.code += " else if (";
      translate2(obj, result.elseIfCode[i].check);
      obj.code += ")";
      translate2(obj, result.ifCode.contents);
    }
  }
  if(result.elseCode != null){
    obj.code += " else ";
    translate2(obj, result.elseCode);
  }
}

let while_ = function(obj, result){
  if(result.else != null){
    startLoopIf_(obj, result);
    whileLoop_(obj, result);
    endLoopIf_(obj, result);
    translate2(obj, result.else);
  }
  else
    whileLoop_(obj, result);
}

let for_ = function(obj, result){
  if(result.else != null){
    startLoopIf_(obj, result);
    forLoop_(obj, result);
    endLoopIf_(obj, result);
    translate2(obj, result.else);
  }
  else
    forLoop_(obj, result);
}

let whileLoop_ = function(obj, result){
  obj.code += "while (";
  translate2(obj, result.check);
  obj.code += ")";
  translate2(obj, result.contents);
}

let forLoop_ = function(obj, result){
  obj.code += "for (";
  translate2(obj, result.start);
  obj.code += "; ";
  translate2(obj, result.check);
  obj.code += "; ";
  translate2(obj, result.iterate);
  obj.code += ")";
  translate2(obj, result.contents);
}

let startLoopIf_ = function(obj, result){
  obj.code += "if (";
  translate2(obj, result.check);
  obj.code += ") {\n     ";
}

let endLoopIf_ = function(obj, result){
  obj.code += "\n     }";
  obj.code += " else "
}

let assign_ = function(obj, result){
  for(let i = 0; i < result.assignations.length; i++){
    obj.code += "_" + result.assignations[i].id + " = ";
    translate2(obj, result.assignations[i].to);
  }
}

let declaration_ = function(obj, result){
  obj.code += "var ";
  if(result.varType.array != undefined){
    for(let i = 0; i < result.assignations.length; i++){
      obj.code += "_" + result.assignations[i].id + " = [";
      for(let j = 0; j < result.assignations[i].to.length; j++){
        translate2(obj, result.assignations[i].to[j]);
        if(result.assignations[i].to.length > 1 && j < result.assignations[i].to.length - 1)
          obj.code += ", ";
      }
    }
    obj.code += "]";
  }
  else{
    for(let i = 0; i < result.assignations.length; i++){
      obj.code += "_" + result.assignations[i].id + " = ";
      translate2(obj, result.assignations[i].to);
      if(result.assignations.length > 1 && i < result.assignations.length - 1)
        obj.code += ", ";
    }
  }
}

let function_ = function(obj, result){
  obj.code += "function " + "_" + result.functionName;
  obj.code += "(";
  if(result.params.length > 0)
    for(let i = 0; i < result.params.length; i++){
      translate2(obj, result.params[i]);
      if(result.params.length > 1 && i < result.params.length - 1)
        obj.code += ", ";
    }
  obj.code += ")";
  translate2(obj, result.contents);
}

let return_ = function(obj, result){
  obj.code += "return ";
  if(result.returnValue != null)
    translate2(obj, result.returnValue);
  obj.code += ";";
}

let classBlock_ = function(obj, result){
  obj.code += "{\n     ";
  for(let i = 0; i < result.classStatement.length; i++){
    translate2(obj, result.classStatement[i]);
    if(result.classStatement.length > 1 && i < result.classStatement.length - 1)
      obj.code += ",";
    obj.code += "\n     ";
  }
  obj.code += "}";
}

let arguments_ = function(obj, result){
  for (let i = 0; i < result.arguments.length; i++){
    translate2(obj, result.arguments[i]);
    if(result.arguments.length > 1 && i < result.arguments.length - 1)
      obj.code += ", ";
  }
}

let call_ = function(obj, result){
  obj.code += "_" + result.id + "(";
  translate2(obj, result.args);
  obj.code += ");"
}

let idAccess_ = function(obj, result){
  obj.code += "_" + result.base + ".";
  for (let i = 0; i < result.access.length; i++)
    translate2(obj, result.access[i]);
}

let methodAccess_ = function(obj, result){
  obj.code += "_" + result.id + "(";
  translate2(obj, result.arguments);
  obj.code += ")";
}


let expCondTerm_ = function(obj, result){
  translate2(obj, result.left);
  obj.code += " " + result.op + " ";
  translate2(obj, result.right);
}

/* Traduccion */
let translate = function(tree) {
    var obj = { code: "   " };
    for(let i = 0; i < tree.result.length; i++){
      translate2(obj, tree.result[i]);
      obj.code += "\n     ";
    }
    return obj.code;
}
