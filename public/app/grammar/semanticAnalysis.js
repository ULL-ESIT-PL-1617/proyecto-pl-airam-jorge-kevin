
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
            throw "expresión inválida";
          return getType(x.left, symbolTable);
        case "return":
          return getType(x.returnValue, symbolTable);
          break;
        case "call":
          if(!validCall(x, symbolTable.search(x.id, ["function"]), symbolTable))
            throw "error llamando a función";
          return symbolTable.search(x.id, ["function"]).type;
          break;
        case "arrayAccess":
          return symbolTable.search(x.id, ["variable", "parameter", "attribute"]).type;
          break;
        case "idAccess":

          let symbolTableAux = symbolTable.search(symbolTable.search(x.base, ["variable", "parameter", "attribute"]).type, ["class"]).local;

          let indice = 0;
          while(indice < x.access.length) {


            symbolTableAux = symbolTableAux.search(symbolTableAux.search(x.access[indice].id, ["variable", "parameter", "attribute"]).type, ["class"]).local;

            indice += 1;
          }
          indice -= 1;


          return symbolTable.search(x.id, ["function"]).type
          break;
        default:
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
            throw "expresión inválida";
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
            throw "expresión inválida";
          break;
        case "block":
          for(var line in rule.contents)
            validRule(rule.contents[line], symbolTable);
          break;
        case "condition":
          if(!validOp(getType(rule.left, symbolTable), rule.op, getType(rule.right, symbolTable)))
            throw "condición inválida";
          break;
        case "declaration":
          //tabla
          for(var a in rule.assignations) {
            for(var b in rule.assignations[a].to) {
              if(rule.varType.type)
              {
                if(rule.varType.type !== getType(rule.assignations[a].to[b], symbolTable))
                  throw "declaración inválida";
              }
              else
              {
                if(["string", "bool", "numeric"].indexOf(rule.varType) === -1) {
                  if(!validAccess(rule.assignations[0].to, symbolTable))
                    throw "declaración inválida";
                } else
                    if(rule.varType !== getType(rule.assignations[a].to, symbolTable))
                      throw "declaración inválida";
              }

            }
          }
          break;
        case "assign":
          for(var a in rule.assignations) {
            var from, to;
            from = getType(rule.assignations[a].element, symbolTable).type ? getType(rule.assignations[a].element, symbolTable).type : getType(rule.assignations[a].element, symbolTable);
            to = getType(rule.assignations[a].to, symbolTable).type ? getType(rule.assignations[a].to, symbolTable).type : getType(rule.assignations[a].to, symbolTable);
            if(from !== to)
              throw "ERROR asignación de elementos incompatibles 1 ";
            if(getType(rule.assignations[a].element, symbolTable).type)
              if(getType(rule.assignations[a].element, symbolTable).arrayCount !== rule.assignations[a].element.index.length)
                throw "ERROR asignación de elementos incompatibles 2 ";
            if(getType(rule.assignations[a].to, symbolTable).type)
              if(getType(rule.assignations[a].to, symbolTable).arrayCount !== rule.assignations[a].to.index.length)
                throw "ERROR asignación de elementos incompatiles 3 ";
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
          if(getType(rule.returnValue, symbolTable) !== symbolTable.fatherRow.type)
            throw "retorno inválido";
          break;
        case "call":
          if(!validCall(rule, symbolTable.search(rule.id, ["function"]), symbolTable))
            throw "llamada a función inválida";
          break;
        case "arrayAccess":
          if(!validArray(rule.id, rule, symbolTable))
            throw "acceso a array inválido"
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
