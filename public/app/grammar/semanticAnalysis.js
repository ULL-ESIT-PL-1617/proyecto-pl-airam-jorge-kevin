
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
      let params = [];
      let ruleAux = symbolTable.search(symbolTable.search(rule.base, ["class", "variable"]).type, ["class"]).local.array
      for(var i in ruleAux) {
        if(ruleAux[i].kind === "method" && ruleAux[i].local.array.length > 0)
          params.push(ruleAux[i].local.array)
      }
      if(params.length !== rule.access[0].arguments.arguments.length)
        return false;
      for(var i in params) {
        if(params[0][i].type !== rule.access[0].arguments.arguments[i].type)
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
            throw "Expresión inválida";
          return getType(x.left, symbolTable);
        case "return":
          if (typeof(x.returnValue()) === "Object")
            throw "Return is not allowed to use arrays";
          return getType(x.returnValue, symbolTable);
          break;
        case "call":
          if(!validCall(x, symbolTable.search(x.id, ["function"]), symbolTable))
            throw "Error llamando a función";
          return symbolTable.search(x.id, ["function"]).type;
          break;
        case "arrayAccess":
          let row = symbolTable.search(x.id, ["variable", "parameter", "attribute"]).type;
          row.arrayCount -= x.index.length;
          console.log("ROW:", x, row);
          return row;
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

          let rowBase = symbolTable.search(x.base, ["variable", "parameter", "attribute"]);
          if (rowBase === null)
            throw "Id " + x.base + " is not declared.";
          let rowClass = symbolTable.search(rowBase.type, ["class"]);
          if (rowClass === null)
            throw "Id " + x.base + " is of type class.";
          let symbolTableAux = rowClass.local;

          let indice = 0;
          while(indice < x.access.length) {

            let newClass = symbolTableAux.search(symbolTableAux.search(x.access[indice].id, ["attribute"]).type, ["class"]);
            if (!!newClass) symbolTableAux = newClass.local;

            indice += 1;
          }
          indice -= 1;

          return symbolTableAux.search(x.access[indice].id, ["method", "attribute"], "ITSME").type
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
      switch(rule.type) {
        case "term":
        case "expression":
          if(!validOp(getType(x.left, symbolTable), x.op, getType(x.right, symbolTable)))
            throw "Expresión inválida";
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
            throw "Expresión inválida";
          break;
        case "block":
          for(var line in rule.contents)
            validRule(rule.contents[line], symbolTable);
          break;
        case "condition":
          if(!validOp(getType(rule.left, symbolTable), rule.op, getType(rule.right, symbolTable)))
            throw "Condición inválida";
          break;
        case "declaration":
          //tabla
          for(var a in rule.assignations) {
            for(var b in rule.assignations[a].to) {
              if(rule.varType.type)
              {
                if (rule.varType.arrayCount !== depthArray(rule.assignations[a].to))
                  throw "Declaración de array inválida";

                if(JSON.stringify(rule.varType.type) !== JSON.stringify(getType(rule.assignations[a].to[b], symbolTable)))
                  throw "Declaración inválida";
              }
              else
              {
                if(["string", "bool", "numeric"].indexOf(rule.varType) === -1) {
                  if(!validAccess(rule.assignations[0].to, symbolTable))
                    throw "Declaración inválida";
                } else
                    if(JSON.stringify(rule.varType) !== JSON.stringify(getType(rule.assignations[a].to, symbolTable)))
                      throw "Declaración inválida";
              }

            }
          }
          break;
        case "assign":
          for(var a in rule.assignations) {
            var from, to;
            console.log(rule);
            from = getType(rule.assignations[a].element, symbolTable);
            to = getType(rule.assignations[a].to, symbolTable);
            console.log("FROM:", from);
            console.log("TO:", to);
            if(JSON.stringify(from) !== JSON.stringify(to))
              throw "ERROR asignación de elementos incompatibles";
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
            throw "Retorno inválido";
          break;
        case "call":
          if(!validCall(rule, symbolTable.search(rule.id, ["function"]), symbolTable))
            throw "Llamada a función inválida";
          break;
        case "arrayAccess":
          if(!validArray(rule.id, rule, symbolTable))
            throw "Acceso a array inválido"
          break;
        case "idAccess":
          if(!validAccess2(rule, symbolTable))
            throw  "acceso a objeto inválido"
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
