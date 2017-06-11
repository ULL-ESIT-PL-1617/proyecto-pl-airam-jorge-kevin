
let semanticAnalisis = function(tree, symbolTable) {

    var variables = {};
    var getType, validOp, validRule, validCall, validArray, validAccess, validAccess2;

    validAccess = function(rule, symbolTable) {
      let params = [];

      for(var i in symbolTable.search(rule.base, ["class"]).local.array) {
        if(symbolTable.search(rule.base, ["class"]).local.array[i].kind === "method" && symbolTable.search(rule.base, ["class"]).local.array[i].id === rule.access[0].id)
          params.push(symbolTable.search(rule.base, ["class"]).local.array[i].local.array)
        }
      if(!params[0])
        return true;
      if(rule.access[0].arguments.arguments.length !== params[0].length)
        return false;
      for(var i in params[0]) {
        if(params[0][i].type !== getType(rule.access[0].arguments.arguments[i], symbolTable))
          return false;
        }
      return true;
    };

    validAccess2 = function(rule, symbolTable) {
      let type = symbolTable.search(rule.base, ["class", "variable"]).type;

      if (type.array && rule.access[0].id === "push") {
        if (rule.access[0].arguments.arguments.length !== 1)
          throw "Push() can only have one parameter.";
        return true;
      }
      if (type.array && rule.access[0].id === "pop") {
        if (rule.access[0].arguments.arguments.length !== 0)
          throw "Pop() cant have arguments.";
        return true;
      }

      let params = [];
      let ruleAux = symbolTable.search(type, ["class"]).local.array
      for(var i in ruleAux) {
        if(ruleAux[i].kind === "method" && ruleAux[i].id === rule.access[0].id && ruleAux[i].local.array.length > 0) {
          for (var j in ruleAux[i].local.array) {
            if (ruleAux[i].local.array[j].kind === "parameter") {
              params.push(ruleAux[i].local.array[j]);
            }
          }
        }
      }
      console.log(params)
      if(params.length !== rule.access[0].arguments.arguments.length)
        return false;
      for(var i in params) {
        if(params[i].type !== rule.access[0].arguments.arguments[i].type)
          return false
      }
      return true;
    };

    validCall = function(call, functionCall, symbolTable) {
      let params = [];
      for(var i in functionCall.local.array)
        if(functionCall.local.array[i].kind === "parameter")
          params.push(functionCall.local.array[i])
      if(call.args.arguments.length !== params.length)
        return false;

      for(var i in params)
        if(params[i].type !== getType(call.args.arguments[i], symbolTable))
          return false;
      return true;
    };

    validArray = function(array, arrayAccess, symbolTable) {
      return symbolTable.search(array, ["variable", "parameter", "attribute"]).type.arrayCount === arrayAccess.index.length;
    };

    validOp = function(left, op, right) {
      if(left === "numeric") {
        if(right !== "numeric")
          return false;
        switch(op) {
          case "+":
          case "-":
          case "*":
          case "/":
          case "%":
          case "=":
          case "==":
          case ">":
          case "<":
          case "<=":
          case ">=":
          case "!=":
            return true;
          default:
            return false;
        }
      }
      if(left === "bool") {
        if(right !== "bool")
          return false;
        switch(op) {
          case "=":
          case "==":
          case ">":
          case "<":
          case "<=":
          case ">=":
          case "&&":
          case "||":
          case "!":
          case "!=":
            return true;
          default:
            return false;
        }
      }
      if(left === "string") {
        if(right !== "string")
          return false;
        switch(op) {
          case "+":
          case "*":
          case "=":
          case "==":
          case ">":
          case "<":
          case "<=":
          case ">=":
          case "!=":
            return true
          default:
            return false;
        }
      }
      return false;
    };

    getType = function(x, symbolTable) {
      if(!x)
        return "void";
      switch(x.type) {
        case "string":
        case "bool":
        case "numeric":
          return x.type;
        case "id":
          return symbolTable.search(x.id, ["variable", "parameter", "attribute"]).type;
          break;
        case "term":
        case "expression":
          if(!validOp(getType(x.left, symbolTable), x.op, getType(x.right, symbolTable)))
            throw "Invalid expression";
          return getType(x.left, symbolTable);
        case "return":
          if (typeof(x.returnValue()) === "Object")
            throw "Return is not allowed to use arrays";
          return getType(x.returnValue, symbolTable);
          break;
        case "condition":
          return "bool";
        case "call":
          if(!validCall(x, symbolTable.search(x.id, ["function"]), symbolTable))
            throw "Invalid call to function";
          return symbolTable.search(x.id, ["function"]).type;
          break;
        case "arrayAccess":
          let row = symbolTable.search(x.id, ["variable", "parameter", "attribute"]).type;
          row.arrayCount -= x.index.length;
          return (row.arrayCount <= 0) ? row.type : row;
          break;
        case "idAccess":

          if ((!!x.access) && (x.access[0].id === "init")) {
            let text = x.base + ".init(";
            for (let i = 0; i < x.access[0].arguments.arguments.length; ++i) {
                text += x.access[0].arguments.arguments[i];
                text += (i < (x.access[0].arguments.arguments.length - 1)) ? ", " : "";
            }
            text += ")";

            if (text.match(/.*?\.init(.*?)/) && (x.access.length < 2))
              return x.base;
          }

          let search = (x.base.type === "arrayAccess") ? x.base.id : x.base;
          let rowBase = symbolTable.search(search, ["variable", "parameter", "attribute"]);
          if (rowBase === null)
            throw "Id " + JSON.stringify(search) + " is not declared.";

          let rowClass = symbolTable.search((x.base.type === "arrayAccess") ? rowBase.type.type : rowBase.type, ["class"]);
          if (rowClass === null)
            throw "Id " + JSON.stringify(search) + " is not of type class.";
          let symbolTableAux = rowClass.local;

          let indice = 0;
          //let symbolTableAux = symbolTableAux;
          while(indice < (x.access.length -1)) {

            let newClass = symbolTableAux.search(symbolTableAux.search(x.access[indice].id, ["attribute"]).type, ["class"]);
            if (!!newClass) symbolTableAux = newClass.local;

            indice += 1;
          }

          return symbolTableAux.search(x.access[indice].id, ["method", "attribute"]).type
          break;
        default:
          if (x instanceof Array) {
            return {
              array: "true",
              arrayCount: 1,
              type: getType(x[0], symbolTable)
            };
          }
          if(symbolTable.search(x, ["variable", "parameter", "attribute"]))
            return symbolTable.search(x, ["variable", "parameter", "attribute"]).type;
          return x.base;
          break;
      }
    };

    validRule = function(rule, symbolTable) {
      if (rule === null) return true;
      switch(rule.type) {
        case "term":
        case "expression":
          if(!validOp(getType(x.left, symbolTable), x.op, getType(x.right, symbolTable)))
            throw "Invalid expression";
          break;
        case "for":
          symbolTable = symbolTable.search(rule.id, ["for"]).local;

          validRule(rule.start, symbolTable);
          validRule(rule.check, symbolTable);
          validRule(rule.iterate, symbolTable);
          for(var line in rule.contents)
            validRule(rule.contents[line], symbolTable);
          validRule(rule.else, symbolTable);
          symbolTable = symbolTable.father;
          break;
        case "while":
          symbolTable = symbolTable.search(rule.id, ["while"]).local;
          validRule(rule.check, symbolTable);
          for(var line in rule.contents)
            validRule(rule.contents[line], symbolTable);
          validRule(rule.else, symbolTable);
          symbolTable = symbolTable.father;
          break;
        case "term":
          if(!validOp(getType(rule.left, symbolTable), rule.op, getType(rule.right, symbolTable)))
            throw "Invalid expression";
          break;
        case "block":
          for(var line in rule.contents)
            validRule(rule.contents[line], symbolTable);
          break;
        case "condition":
          if(!validOp(getType(rule.left, symbolTable), rule.op, getType(rule.right, symbolTable)))
            throw "Invalid condition";
          break;
        case "declaration":
          //tabla
          for(var a in rule.assignations) {
            for(var b in rule.assignations[a].to) {
              if(rule.varType.type)
              {
                if (rule.varType.arrayCount !== depthArray(rule.assignations[a].to))
                  throw "Invalid array declaration";

                if(JSON.stringify(rule.varType.type) !== JSON.stringify(getType(rule.assignations[a].to[b], symbolTable)))
                  throw "Invalid declaration";
              }
              else
              {
                if(["string", "bool", "numeric", "void"].indexOf(rule.varType) === -1) {
                  if(!validAccess(rule.assignations[0].to, symbolTable))
                    throw "Invalid declaration";
                } else
                    if(JSON.stringify(rule.varType) !== JSON.stringify(getType(rule.assignations[a].to, symbolTable)))
                      throw "Invalid declaration";
              }

            }
          }
          break;
        case "assign":
          for(var a in rule.assignations) {
            var from, to;
            from = getType(rule.assignations[a].element, symbolTable);
            to = getType(rule.assignations[a].to, symbolTable);
            if(JSON.stringify(from) !== JSON.stringify(to))
              throw "Invalid assignation of incompatible elements";
        }

          break;
        case "IF":
        case "if":
          validRule(rule.ifCode.check, symbolTable);
          validRule(rule.ifCode.contents, symbolTable);
          if(rule.elseIfCode.length !== 0) {
            for(var x in rule.elseIfCode) {
              validRule(rule.elseIfCode[x].check, symbolTable);
              validRule(rule.elseIfCode[x].contents, symbolTable);
            }
          }
          if(rule.elseCode) {
            validRule(rule.elseCode, symbolTable);
          }
          break;
        case "method":
        case "function":
            symbolTable = symbolTable.search(rule.functionName, ["function", "method"]).local;
            validRule(rule.contents, symbolTable);
            symbolTable = symbolTable.father;
          break;
        case "class":
          symbolTable = symbolTable.search(rule.id, ["class"]).local;
          validRule(rule.content, symbolTable);
          symbolTable = symbolTable.father;
          break;
        case "classBlock":
          for(var x in rule.classStatement)
            validRule(rule.classStatement[x], symbolTable);
          break;
        case "attribute":
          validRule(rule.assignations, symbolTable);
          break;
        case "return":
          if (symbolTable.father === null) // Si es la tabla base, el return puede ser de cualquier tipo.
            break;
          if(JSON.stringify(getType(rule.returnValue, symbolTable)) !== JSON.stringify(symbolTable.fatherRow.type))
            throw "Invalid return type";
          break;
        case "call":
          if(!validCall(rule, symbolTable.search(rule.id, ["function"]), symbolTable))
            throw "Invalid call to function";
          break;
        case "arrayAccess":
          if(!validArray(rule.id, rule, symbolTable))
            throw "Invalid access to array";
          break;
        case "idAccess":
          if(!validAccess2(rule, symbolTable))
            throw  "Invalid access to object";
          break;
        case "string":
        case "bool":
        case "numeric":
        case undefined:
        case null:

          break;
        default:


      }
    };
      for(var line in tree.result)
        validRule(tree.result[line], symbolTable);
};

let depthArray = function(array) {
  let max = 0;
  for (let i in array) {
    if (typeof(array[i]) === "object") {
      let depth = depthArray(array[i]);
      if (depth > max) max = depth;
      if (1 > max) max = 1;
    }
  }
  return max;
}
