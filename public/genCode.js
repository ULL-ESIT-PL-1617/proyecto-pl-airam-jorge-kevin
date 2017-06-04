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
  console.log(result.type);
  switch(result.type) {
      case "block":         obj.code += "{\n     ";
                            for(let i = 0; i < result.contents.length; i++){
                              obj.code += "     ";
                              translate2(obj, result.contents[i]);
                            }
                            obj.code += "\n     }";
          break;
      case "if":            obj.code += "if (";
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

          break;
      case "while":         obj.code += "while (";
                            translate2(obj, result.check);
                            obj.code += ")";
                            translate2(obj, result.contents);
                            if(result.else != null){
                              obj.code += " else ";
                              translate2(obj, result.else);
                            }
          break;
      case "for":           obj.code += "for (";
                            translate2(obj, result.start);
                            obj.code += "; ";
                            translate2(obj, result.check);
                            obj.code += "; ";
                            translate2(obj, result.iterate);
                            obj.code += ")";
                            translate2(obj, result.contents);
                            if(result.else != null){
                              obj.code += " else ";
                              translate2(obj, result.else);
                            }
          break;
      case "assign":        for(let i = 0; i < result.assignations.length; i++){
                              obj.code += result.assignations[i].id + " = ";
                              translate2(obj, result.assignations[i].to);
                            }
          break;
      case "declaration":   obj.code += "var ";
                            if(result.varType.array != undefined){
                              for(let i = 0; i < result.assignations.length; i++){
                                obj.code += result.assignations[i].id + " = [";
                                for(let j = 0; j < result.assignations[i].to.length; j++){
                                  translate2(obj, result.assignations[i].to[j]);
                                  if(result.assignations[i].to.length > 1 && j < result.assignations[i].to.length - 1)
                                    obj.code += ", ";
                                }
                              }
                              obj.code += "];";
                            }
                            else{
                              for(let i = 0; i < result.assignations.length; i++){
                                obj.code += result.assignations[i].id + " = ";
                                translate2(obj, result.assignations[i].to);
                                if(result.assignations.length > 1 && i < result.assignations.length - 1)
                                  obj.code += ", ";
                              }
                            }
          break;
      case "function":      obj.code += "function " + result.functionName;
                            obj.code += "(";
                            if(result.params.length > 0)
                              for(let i = 0; i < result.params.length; i++){
                                translate2(obj, result.params[i]);
                                if(result.params.length > 1 && i < result.params.length - 1)
                                  obj.code += ", ";
                              }
                            obj.code += ")";
                            translate2(obj, result.contents);
          break;
      case "parameter":     obj.code += result.vartype + " " + result.id;
          break;
      case "return":        obj.code += "return ";
                            if(result.returnValue != null)
                              translate2(obj, result.returnValue);
          break;
      case "class":         obj.code += "class " + result.id;
                            translate2(obj, result.content);
          break;
      case "classBlock":    obj.code += "{\n     ";
                            for(let i = 0; i < result.classStatement.length; i++){
                              translate2(obj, result.classStatement[i]);
                              obj.code += "\n     ";
                            }
                            obj.code += "}";
          break;
      case "attribute":     obj.code += result.visibility + " ";
                            translate2(obj, result.assign);
          break;
      case "method":        obj.code += result.visibility + " ";
                            translate2(obj, result.method);
          break;
      case "condition":     translate2(obj, result.left);
                            obj.code += " " + result.op + " ";
                            translate2(obj, result.right);
          break;
      case "expression":    translate2(obj, result.left);
                            obj.code += " " + result.op + " ";
                            translate2(obj, result.right);
          break;
      case "term":          translate2(obj, result.left);
                            obj.code += " " + result.op + " ";
                            translate2(obj, result.right);
          break;
      case "call":          obj.code += result.id + "(";
                            translate2(obj, result.args);
                            obj.code += ");"
          break;
      case "idAccess":      obj.code += result.base + ".";
                            for (let i = 0; i < result.access.length; i++)
                              translate2(obj, result.access[i]);
          break;
      case "methodAccess":  obj.code += result.id + "(";
                            translate2(obj, result.arguments);
                            obj.code += ")";
          break;
      case "arrayAccess":
          break;
      case "id":            obj.code += result.id;
          break;
      case "arguments":     for (let i = 0; i < result.arguments.length; i++){
                              translate2(obj, result.arguments[i]);
                              if(result.arguments.length > 1 && i < result.arguments.length - 1)
                                obj.code += ", ";
                            }
          break;
      case "numeric":       obj.code += result.value;
          break;
      case "string":        obj.code += "\"" + result.value + "\"";
          break;
      case "bool":          obj.code += result.value;
          break;
      //TODO  array por hacer
      default:
  }
  //console.log(obj.code);
}

let translate = function(tree) {
    console.log("-----------");
    console.log("-Translate-");
    console.log("-----------");
    var obj = { code: "   " };
    for(let i = 0; i < tree.result.length; i++){
      translate2(obj, tree.result[i]);
      obj.code += "\n     ";
    }
    return obj.code;
}
