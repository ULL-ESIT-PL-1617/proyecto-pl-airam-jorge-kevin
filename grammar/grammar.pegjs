{
  var reservedWords = new Set([
    "else", "if", "exit", "return", "for", "function", "const"
  ]);

  var functionTable = {};

  var symbolTable = { // Tipos: constant, volatile
    PI:     "constant",
    TRUE:   "constant",
    FALSE:  "constant"
  };

  var initialConstantTable = {
    PI:    Math.PI,
    TRUE:  1,
    FALSE: 0
  };

  var depth   = 0;
  var idStack = [];

  var resolveParams = function(par) {
      var params = [];
      if (par != null) {
        params.push(par[0][1]);
        par[1].forEach(x => params.push(x[1][1]));
      }
      return params;
  }

  var symbolTableFromParams = function(params) {
    var table = {}
    params.forEach(x => table[x] = "volatile");
    return table;
  }

  var saveFunctionInTable = function(id, params) {

    if (depth > 0)
      throw "Cant declare function inside another function.";

    else if (functionTable[id])
      throw "Function already declared '" + id + "'.";

    else if (reservedWords.has(id))
      throw "Cant declare reserved word as function '" + id + "'";

    functionTable[id] = {
      params: params,
      symbolTable: symbolTableFromParams(params)
    }
  }

  var currentStackId = function() {
    return idStack[idStack.length - 1];
  }

  var getCurrentSymbolTable = function() {
    if (depth == 0)
      return symbolTable;
    else
      for (var f in functionTable)
        if (f == currentStackId())
          return functionTable[f].symbolTable;
  }
}

start
  = a:sentences {
    return {
      reservedWords:        Array.from(reservedWords),
      initialConstantTable: initialConstantTable,
      functionTable:        functionTable,
      symbolTable:          symbolTable,
      result: a
    };
  }

sentences
  = a:(sentence)* {
    return {  sentences: a };
  }

sentence
 = a:if_statement       { return a; }
 / a:loop_statement     { return a; }
 / a:function_statement { return a; }
 / a:assign SEMICOLON   { return a; }

if_statement
  = IF condA:condition LEFTBRACE codeA:sentences RIGHTBRACE codeB:(ELIF condition LEFTBRACE sentences RIGHTBRACE)* codeC:(ELSE LEFTBRACE sentences RIGHTBRACE)? {
    let ifCode     = {
      condition: condA,
      sentences: codeA.sentences
    };

    let elseCode = (codeC === null) ? {} : {
      sentences: codeC[2].sentences
    };

    let elseIfCode = [];
    codeB.forEach(x => elseIfCode.push({
      condition: x[1],
      sentences: x[3].sentences,
    }));

    return {
      type:       "IF",
      ifCode:     ifCode,
      elseIfCode: elseIfCode,
      elseCode:   elseCode
    }
  }

comma
  = left:assign right:(COMMA assign)* {
    var ops = [];
    ops.push(left);
    right.forEach(x => ops.push(x[1]));
    return {
      type:        "COMMA",
      operations:  ops
    };
  }

function_statement
  = FUNCTION id:ID LEFTPAR params:(ID (COMMA ID)*)? RIGHTPAR LEFTBRACE &{

    id = id[1];
    saveFunctionInTable(id, resolveParams(params));
    depth++;
    idStack.push(id);
    return true;

  } code:sentences &{

    depth--;
    idStack.pop();
    return true;

  } RIGHTBRACE {
    return {
      type:   "FUNCTION",
      id:     id[1],
      params: resolveParams(params),
      code:   code
    };
  }

loop_statement
  = LOOP LEFTPAR left:comma SEMICOLON condition:condition SEMICOLON right:comma RIGHTPAR LEFTBRACE code:sentences RIGHTBRACE {
    return {
      type:      "LOOP",
      left:      left,
      condition: condition,
      right:     right,
      sentences: code.sentences
    };
  }

assign
  = c:CONST? id:ID ASSIGN right:assign {

    id = id[1];
    var currSymbolTable = getCurrentSymbolTable();

    if (reservedWords.has(id))
      throw "'" + id + "' is a reserved word.";

    else if (c && (currSymbolTable[id] == "constant"))
      throw "Cant redeclare constant '" + id + "'.";

    else if (c && (currSymbolTable[id] == "volatile"))
      throw "Cant redeclare variable as constant " + id;

    else if (!c && (currSymbolTable[id] == "constant"))
      throw "Cant override value of constant " + id;

    currSymbolTable[id] = c ? "constant" : "volatile";

    return {
      type:  "ASSIGN",
      id:    id,
      right: right
    };
  }
  / condition

condition
  = left:expression op:COMPARASION right:expression {
    return {
      type:  "CONDITION",
      left:  left,
      op:    op[1],
      right: right
    };
  }
  / expression

expression
  = left:term op:ADDOP right:expression {
    return {
      type:  "expression",
      op:    op[1],
      left:  left,
      right: right
    };
  }
  / term

term
  = left:factor op:MULOP right:term {
    return {
      type:  "MULOP",
      op:    op[1],
      left:  left,
      right: right
    };
  }
  / factor

factor
  = int:integer {
    return {
      type:  "NUM",
      value: parseInt(int[1])
    };
  }
  / RETURN assign:(assign)? {
    return {
      type: "RETURN",
      assign: (assign == null ? {} : assign)
    };
  }
  / EXIT {
    return {
      type: "EXIT"
    };
  }
  / id:ID args:arguments {

    id = id[1];

    var argsTable = functionTable[id].params  === undefined ? 0 : functionTable[id].params.length;
    var argsCall  = args.arguments.operations === undefined ? 0 : args.arguments.operations.length;

    if (!functionTable[id])
      throw "'" + id + "' not defined as function.";

    else if (argsTable != argsCall)
      throw "Invalid number of arguments for function '" + id + "'.";

    return {
      type: "CALL",
      args: args,
      id:   id
    };
  }
  / id:ID {

    id = id[1];

    var currSymbolTable = getCurrentSymbolTable();
    if ((currSymbolTable[id] != "volatile") && (currSymbolTable[id] != "constant"))
      throw id + " not defined as variable (or constant)";

    return {
      type: "ID",
      id: id
    };
  }
  / LEFTPAR a:assign RIGHTPAR {
    return a;
  }

arguments
  = LEFTPAR comma:(comma)? RIGHTPAR {
    return {
      type:      "ARGUMENTS",
      arguments: (comma == null ? [] : comma)
    };
  }

integer "integer"
  = NUMBER

_ = $[ \t\n\r]*

ADDOP       = PLUS / MINUS
MULOP       = MULT / DIV
COMMA       = _","_
PLUS        = _"+"_
MINUS       = _"-"_
MULT        = _"*"_
ASSIGN      = _"="_
DIV         = _"/"_
LEFTPAR     = _"("_
RIGHTPAR    = _")"_
SEMICOLON   = _";"_
LEFTBRACE   = _"{"_
RIGHTBRACE  = _"}"_
LOOP        = _"for"_
RETURN      = _"return"_
EXIT        = _"exit"_
FUNCTION    = _"function"_
IF          = _"if"_
ELIF        = _"else if"_
ELSE        = _"else"_
CONST       = _"const"_
NUMBER      = _ $[0-9]+ _
ID          = _ $([a-z_]i$([a-z0-9_]i*)) _
COMPARASION = _ $([<>!=]"=" / [<>]) _
