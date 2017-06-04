
let semanticAnalisis = function(tree) {
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

    getType = function(x) {
      if(!x)
        return x;
      switch(x.type) {
        case "string":
        case "bool":
        case "numeric":
          return x.type;
        case "id":
          throw "ERROR tabla id";
          break;
        case "term":
        case "expression":
          if(!validOp(getType(x.left), x.op, getType(x.right)))
            throw "ERROR";
          return getType(x.left);
        case "assign":

          break;
        case "declaration":

          break;
        case "return":
          return getType(x.returnVlue);
          break;
      }
    };

    validRule = function(rule) {
      switch(rule.type) {
        case "term":
        case "expression":
          if(!validOp(getType(x.left), x.op, getType(x.right)))
            throw "ERROR validando";
          break;
        case "for":
          validRule(rule.start);
          validRule(rule.check);
          validRule(rule.iterate);
          for(var line in rule.contents)
            validRule(rule.contents[line]);
          validRule(rule.else);
          break;
        case "while":
          validRule(rule.check);
          for(var line in rule.contents)
            validRule(rule.contents[line]);
          validRule(rule.else);
          break;
        case "term":
          if(!validOp(getType(rule.left), rule.op, getType(rule.right)))
            throw "ERROR term";
          break;
        case "block":
          for(var line in rule.contents)
            validRule(rule.contents[line]);
          break;
        case "condition":
        if(!validOp(getType(rule.left), rule.op, getType(rule.right)))
          throw "ERROR term";
          break;
        case "declaration":
          //tabla

          for(var a in rule.assignations) {
            if(rule.varType !== getType(rule.assignations[a].to))
              throw "ERROR assignando";
            //validOp(getType(rule.assignations[a]), );
          }
          break;
        case "assign":
          for(var a in rule.assignations) {
            console.log(rule.assignations[a].id)
            console.log(getType(rule.assignations[a].to))
/*
            if(rule.varType !== getType(rule.assignations[a].to))
              throw "ERROR assignando";
              */
            //validOp(getType(rule.assignations[a]), );
          }

          break;
        case "IF":
        case "if":
          validRule(rule.ifCode.check);
          validRule(rule.ifCode.contents);
          if(rule.elseIfCode.length !== 0) {
            for(var x in rule.elseIfCode) {
              validRule(rule.elseIfCode[x].check);
              validRule(rule.elseIfCode[x].contents);
            }
          }
          if(rule.elseCode) {
            validRule(rule.elseCode);
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

    //comprobar palabras reservadas

try {
  for(var line in tree.result)
  {
    validRule(tree.result[line]);
    //console.log(tree["result"][line]);
    /*
    switch(tree.result[line].type)
    {
      case "declaration":
        console.log("declaration");
        // id no es una palabra reservadas
        // id no existe aun
        // varType == assignations[0]

        /*
        for(var x in tree.result[line].assignations)
        {
          if(tree.result[line].varType == tree.result[line].assignations[x].to)
        }
        */
  /*
        break;
      case "function":
        console.log("function");

        break;
      case
    }
    */
  }
} catch (e) {
  console.log(e)
} finally {

}


};
