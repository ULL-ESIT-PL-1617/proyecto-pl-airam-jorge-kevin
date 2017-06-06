
let semanticAnalisis = function(tree, symbolTable) {
    console.log("semanticAnalisis");
    var variables = {};
    var getType, validOp, validRule;

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
    }

    getType = function(x, symbolTable) {
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

          for(var a in rule.assignations) {
            if(getType(rule.assignations[a].id, symbolTable) !== getType(rule.assignations[a].to, symbolTable))
              throw "ERROR assignando";

          }

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
          console.log(symbolTable.type)
          if(getType(rule.returnValue, symbolTable) !== symbolTable.type)
            throw "ERROR return";
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
    //assign
    //declaration **
    //return


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
    //call
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
