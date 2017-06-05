
let semanticAnalisis = function(tree, symbolTable) {
    console.log("semanticAnalisis");
    var variables = {};
    var getType, validOp, validRule;

    validOp = function(left, op, right) {
      if(left.type !== "string" && left.type !== "bool")
      if(left.type === "numeric") {
        if(right.type !== "numeric")
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
            return true
          default:
            return false;
        }
      }
      if(left.type === "bool") {
        if(right.type !== "bool")
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
      if(left.type === "string") {
        if(right.type !== "string")
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
      if(!x)
        return x;
      switch(x.type) {
        case "string":
        case "bool":
        case "numeric":
          return x.type;
        case "id":
          symbolTable.search(x.id);
          //throw "ERROR tabla id";
          break;
        case "term":
        case "expression":
          if(!validOp(getType(x.left, symbolTable), x.op, getType(x.right, symbolTable)))
            throw "ERROR";
          return getType(x.left, symbolTable);
        case "assign":

          break;
        case "declaration":

          break;
        case "return":
          return getType(x.returnValue, symbolTable);
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
          validRule(rule.start, symbolTable);
          validRule(rule.check, symbolTable);
          validRule(rule.iterate, symbolTable);
          for(var line in rule.contents)
            validRule(rule.contents[line], symbolTable);
          validRule(rule.else, symbolTable);
          break;
        case "while":
          validRule(rule.check, symbolTable);
          for(var line in rule.contents)
            validRule(rule.contents[line], symbolTable);
          validRule(rule.else, symbolTable);
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
          throw "ERROR term";
          break;
        case "declaration":
          //tabla

          for(var a in rule.assignations) {
            if(rule.varType !== getType(rule.assignations[a].to, symbolTable))
              throw "ERROR assignando";
            //validOp(getType(rule.assignations[a]), );
          }
          break;
        case "assign":
          for(var a in rule.assignations) {
            console.log(rule.assignations[a].id)
            console.log(getType(rule.assignations[a].to, symbolTable))
/*
            if(rule.varType !== getType(rule.assignations[a].to))
              throw "ERROR assignando";
              */
            //validOp(getType(rule.assignations[a]), );
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
    //function
    //class
    //classBlock
    //attribute
    //method
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
  {
    validRule(tree.result[line], symbolTable);
  }
} catch (e) {
  console.log(e)
} finally {

}


};
