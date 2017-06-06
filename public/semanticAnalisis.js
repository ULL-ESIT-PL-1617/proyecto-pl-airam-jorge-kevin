
let semanticAnalisis = function(tree, symbolTable) {
    console.log("semanticAnalisis");
    var variables = {};
    var getType, validOp, validRule, validCall, validArray;

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
      return symbolTable.search(array, ["variable", "parameter", "attribute"]).type.arrayCount === arrayAccess.index.length
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
          //throw "ERROR tabla id";
          break;
        case "term":
        case "expression":
          if(!validOp(getType(x.left, symbolTable), x.op, getType(x.right, symbolTable)))
            throw "ERROR";
          return getType(x.left, symbolTable);
        case "return":
          return getType(x.returnValue, symbolTable);
          break;
        case "call":
          if(!validCall(x, symbolTable.search(x.id, ["function"]), symbolTable))
            throw "ERROR call";
          return symbolTable.search(x.id, ["function"]).type;
          break;
        default:
          return symbolTable.search(x, ["variable", "parameter", "attribute"]).type;
          break;
      }
    };

    validRule = function(rule, symbolTable) {
      switch(rule.type) {
        case "term":
        case "expression":
          if(!validOp(getType(x.left, symbolTable), x.op, getType(x.right, symbolTable)))
            throw "ERROR validando";
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
            throw "ERROR term";
          break;
        case "block":
          for(var line in rule.contents)
            validRule(rule.contents[line], symbolTable);
          break;
        case "condition":
          if(!validOp(getType(rule.left, symbolTable), rule.op, getType(rule.right, symbolTable)))
            throw "ERROR condition";
          break;
        case "declaration":
          //tabla
          for(var a in rule.assignations) {
            for(var b in rule.assignations[a].to) {
              if(rule.varType.type)
              {

                if(rule.varType.type !== getType(rule.assignations[a].to[b], symbolTable))
                  throw "ERROR declarando1";
              }
              else
                if(rule.varType !== getType(rule.assignations[a].to, symbolTable))
                  throw "ERROR declarando2";
            }
          }
          break;
        case "assign":
          for(var a in rule.assignations)
            if(getType(rule.assignations[a].id, symbolTable) !== getType(rule.assignations[a].to, symbolTable))
              throw "ERROR assignando";
          break;
        case "IF":
        case "if":
        //cambiar
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
          if(getType(rule.returnValue, symbolTable) !== symbolTable.fatherRow.type)
            throw "ERROR return";
          break;
        case "call":
          if(!validCall(rule, symbolTable.search(rule.id, ["function"]), symbolTable))
            throw "ERROR call";
          break;
        case "arrayAccess":
          if(!validArray(rule.id, rule, symbolTable))
            throw "ERROR array access"
          break;
        case "string":
        case "bool":
        case "numeric":
        case undefined:
        case null:

          break;
        default:
          console.log("ERROR CON " + rule.type);

      }
    };

    //term **
    //expression **
    //assign **
    //declaration **
    //return **


    //block **
    //if **
    //while **
    //for **
    //function **
    //class **
    //classBlock **
    //attribute **
    //method **
    //condition **
    //call **
    //idAccess
    //arrayAccess


    //numeric **
    //string **
    //bool **

    //arguments ?

    try {
      for(var line in tree.result)
        validRule(tree.result[line], symbolTable);
    } catch (e) {
      console.log(e)
    } finally {

    }


};
