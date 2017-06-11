
let prefixTemplate = function() {
  return "let $$_main = function() {\n  try {\n\n";
};

let suffixTemplate  = function() {
   return "\n  }\n  catch(error) {\n    console.log(error);\n    return error;\n  }\n}\n$$_main();";
};

let genCode = function(tree) {
   let prefix = prefixTemplate();
   let suffix = suffixTemplate();
   let js = prefix+translate(tree)+suffix;
   return js;
};


let __currentClassAttributesStack = [];
let __currentFuncParametersStack  = [];
let __currentClassMethodsStack    = [];
let __currentLocalVariablesStack  = [[]];
let translate = function(tree) {
    let text = "";
    for (let i in tree.result) {
        text += translateStep(tree.result[i]);
    }
    return text;
}

let translateStep = function(tree) {
    switch (tree.type) {
        case "declaration": return declaration(tree) + ";\n";
        case "function": return function_(tree);
        case "assign": return assignation(tree) + ";\n";
        case "return": return return_(tree) + ";\n";
        case "class": return class_(tree);
        case "while": return while_(tree);
        case "for": return for_(tree);
        case "if": return if_(tree);
        default: return assignation(tree) + ";\n";
    }
    return "";
}

let if_ = function(tree) {
    let text = "if " + condition(tree.ifCode.check) + " " + block(tree.ifCode.contents);

    tree.elseIfCode.forEach(x => {
        text += " else if " + condition(x.check) + " " + block(x.contents);
    });
    if (tree.elseCode !== null) {
        text += " else " + block(tree.elseCode.contents);
    }

    return text;
}

let for_ = function(tree) {
    let text  = "var $$executed_" + tree.id + " = false;\n";

    text += "for (";
    if (tree.start !== null) text += declaration(tree.start);
    text += "; ";
    if (tree.check !== null) text += condition(tree.check);
    text += "; ";
    if (tree.iterate !== null) text += declaration(tree.iterate) + ",";
    text += " $$executed_" + tree.id + " = true)" + block(tree.contents);

    if (tree.else !== null) {
        text += "if (!$$executed_" + tree.id + ")" + block(tree.else);
    }

    return text;
}

let while_ = function(tree) {
    let text  = "var $$executed_" + tree.id + " = false;\n";

    text += "while (";
    if (tree.check !== null) text += condition(tree.check);
    text += "&& ($$executed_" + tree.id + " = true))" + block(tree.contents);

    if (tree.else !== null) {
        text += "if (!$$executed_" + tree.id + ")" + block(tree.else);
    }

    return text;
}

let class_ = function(tree) {
    let init = getInitMethod(tree);
    let text = "function _class" + id(tree) + "(";
    for (let i = 0; i < init.params.length; ++i) {
        text += id(init.params[i]);
        text += (i < (init.params.length - 1)) ? ", " : "";
    }
    text += ") {\n";

    // Inicializar variables
    let parameters = [];
    let methods = [];
    tree.content.classStatement.forEach(x => {
        if (x.type === "attribute") {
            x.assignations.forEach(y => {
              parameters.push(y.id);
            });
        } else if (x.type === "method") {
          methods.push(x.functionName);
        }
    });
    __currentClassMethodsStack.push(methods);
    __currentClassAttributesStack.push(parameters);
    tree.content.classStatement.forEach(x => {
        if (x.type === "attribute") {
            text += declaration(x) + ";\n";
        }
    });

    // Init
    let block = init.contents;
    for (let i in block.contents) {
        text += translateStep(block.contents[i]);
    }

    // Methods
    tree.content.classStatement.forEach(x => {
        if (x.type === "method") {
            text += method(x);
        }
    });

    if (!hasInitMethod(tree)) {
      text += "this._init = function(){}";
    }
    text += "}\n";
    __currentClassAttributesStack.pop();
    __currentClassMethodsStack.pop();
    return text;
}

let hasInitMethod = function(tree) {
    let init = null;
    tree.content.classStatement.forEach(x => {
        if ((x.type === "method") && (x.functionName === "init")) {
            init = x;
        }
    });
    return !!init;
}

let getInitMethod = function(tree) {
    let init = null;
    tree.content.classStatement.forEach(x => {
        if ((x.type === "method") && (x.functionName === "init")) {
            init = x;
        }
    });

    if (init === null) {
        return { // Default init
            type: "method",
            returnType: "void",
            functionName: "init",
            params: [],
            contents: {
                type: "block",
                contents: []
            },
            visibility: "public"
        };
    } else {
        return init;
    }
}

let method = function(tree) {
  if (tree.functionName == "init") return "";

  let text = "this." + id(tree.functionName) + " = function(";
  let params = [];

  tree.params.forEach(x => params.push(x.id));
  __currentFuncParametersStack.push(params);
  for (let i = 0; i < tree.params.length; ++i) {
    text += "_" + tree.params[i].id;
    text += (i < (tree.params.length - 1)) ? ", " : "";
  }
  text += ")" + block(tree.contents);
  __currentFuncParametersStack.pop();
  return text;
}

let return_ = function(tree) {
    return "return" + (!!tree.returnValue ? (" (" + declaration(tree.returnValue)) + ")" : "");
}

let function_ = function(tree) {
    let text = "let " + id(tree.functionName) + " = function(";
    let params = [];

    tree.params.forEach(x => params.push(x.id));
    __currentFuncParametersStack.push(params);
    for (let i = 0; i < tree.params.length; ++i) {
        text += "_" + tree.params[i].id;
        text += (i < (tree.params.length - 1)) ? ", " : "";
    }
    text += ")" + block(tree.contents);
    __currentFuncParametersStack.pop();
    return text;
}

let block = function(tree) {
    let text = "{\n";
    __currentLocalVariablesStack.push([]);
    for (let i in tree.contents) {
        text += translateStep(tree.contents[i]);
    }
    text += "}\n";
    __currentLocalVariablesStack.pop();
    return text;
}

let isBuiltInType = function(type) {
    for (var i in builtInTypes) {
        if (builtInTypes[i] === type) {
            return true;
        }
    }
    if ((typeof(type) == "object") && isBuiltInType(type.type)) {
      return true;
    }
    return false;
}

let declaration = function(tree) {
    if ((tree.type !== "declaration") && (tree.type !== "attribute")) return assignation(tree);

    let text = "";

    for (let i = 0; i < tree.assignations.length; ++i) {
        let assg = tree.assignations[i];
        if (assg.id && (tree.type !== "attribute")) {
          text += tree.constant ? "const " : "let ";
          __currentLocalVariablesStack.slice(-1)[0].push(assg.id);
        }
        text += id(assg) + " = ";

        if (!isBuiltInType(tree.varType) && !(assg.to instanceof Array)) { // Custom class
          text += "new _class_" + assg.to.base + arguments_(assg.to.access[0].arguments);
        } else { // builtInTypes
          text += assignation(assg.to);
        }
        text += (i < (tree.assignations.length - 1)) ? ";" : "";
    }
    return text;
}

let assignation = function(tree) {
    if (tree.type !== "assign") return condition(tree);

    let text = "";
    for (let i = 0; i < tree.assignations.length; ++i) {
        let assg = tree.assignations[i];
        text += element(assg.element) + " = ";
        text += assignation(assg.to);
        text += (i < (tree.assignations.length - 1)) ? ", " : "";
    }
    return text;
}

let element = function(tree) {
    if (typeof(tree) === "string") return id(tree);
    if (tree.type    === "idAccess") return idAccess(tree);
    if (tree.type    === "arrayAccess") return arrayAccess(tree);
}

let condition = function(tree) {
    if (tree.type !== "condition") return "(" + expression(tree) + ")";

    let text = "(";
    text += expression(tree.left);
    text += " " + tree.op + " ";
    text += (tree.right.type === "condition") ? condition(tree.right) : expression(tree.right);
    text += ")";
    return text;
}

let expression = function(tree) {
    if (tree.type !== "expression") return term(tree);

    let text = "(";
    text += term(tree.left);
    text += " " + tree.op + " ";
    text += (tree.right.type === "expression") ? expression(tree.right) : term(tree.right);
    text += ")";
    return text;
}

let term = function(tree) {
    if (tree.type !== "term") return factor(tree);

    let text = "(";
    text += factor(tree.left);
    text += " " + tree.op + " ";
    text += (tree.right.type === "term") ? term(tree.right) : factor(tree.right);
    text += ")";
    return text;
}

let factor = function(tree) {
    if (tree.type === "string"  ) return "\"" + tree.value + "\"";
    if (tree.type === "numeric" ) return tree.value;
    if (tree.type === "bool"    ) return tree.value;
    if (tree instanceof Array   ) return array(tree);
    if (tree.type === "call"    ) return call(tree);
    if (tree.type === "idAccess") return idAccess(tree);
    if (tree.type === "id"      ) return id(tree);
    if (tree.type === "arrayAccess") return arrayAccess(tree);
    return assignation(tree);
}

let arrayAccess = function(tree) {
    let text = id(tree.id);
    for (let i in tree.index) {
        text += "[" + assignation(tree.index[i]) + "]";
    }
    return text;
}

let idIsAttribute = function(id) {
  return (__currentClassAttributesStack.length > 0)
          && (__currentClassAttributesStack.slice(-1)[0].indexOf(id) !== -1);
}

let idIsMethod = function(id) {
  return (__currentClassMethodsStack.length > 0)
          && (__currentClassMethodsStack.slice(-1)[0].indexOf(id) !== -1);
}

// Check if is local variable of parameter
let idIsLocal = function(id) {
  let isParameter = (__currentFuncParametersStack.length > 0)
                        && (__currentFuncParametersStack.slice(-1)[0].indexOf(id) !== -1);
  let isVariable  = (__currentLocalVariablesStack.length > 0)
                        && (__currentLocalVariablesStack.slice(-1)[0].indexOf(id) !== -1);
  return isParameter || isVariable;
}

let id = function(tree) {
    let id = (typeof(tree) === "string") ? tree : tree.id;
    let text = "";

    if (id === "push") { return "push"; }
    if (id === "pop" ) { return "pop" ; }

    text += (idIsAttribute(id) && !idIsLocal(id)) ? "this._" : "_";
    text += id;
    return text;
}

let idAccess = function(tree) {
    let text = (tree.base.type === "arrayAccess") ? arrayAccess(tree.base) : id(tree.base);

    if ((tree.access.length === 1) && (tree.access[0].id === "init")) {
      return "(new _class" + id(tree.base) + arguments_(tree.access[0].arguments) + ")";
    }

    for (let i in tree.access) {
        text += ".";

        text += id(tree.access[i]);
        if (tree.access[i].type === "methodAccess") {
            text += arguments_(tree.access[i].arguments);
        }
    }
    return text;
}

let call = function(tree) {

    return (idIsMethod(tree.id) ? ("this." + id(tree)) : id(tree)) + arguments_(tree.args);
}

let arguments_ = function(tree) {
    let text = "(";
    for (let i = 0; i < tree.arguments.length; ++i) {
        text += assignation(tree.arguments[i]);
        text += (i < (tree.arguments.length - 1)) ? ", " : "";
    }
    text += ")";
    return text;
}

let array = function(tree) {
    let text = "[";
    for (let i = 0; i < tree.length; ++i) {
        text += factor(tree[i]);
        text += (i < (tree.length - 1)) ? ", " : "";
    }
    text += "]";
    return text;
}
