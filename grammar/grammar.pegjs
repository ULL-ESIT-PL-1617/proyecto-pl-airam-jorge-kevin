{
  var reservedWords = new Set([
    "else", "if", "while", "for", "const", "numeric", "bool", "string", "void",
    "public", "private", "class", "true", "false", "return"
  ]);

  var symbolTable = {
    PI:     3.14159265359,
    TRUE:   true,
    FALSE:  false
  };
}

start
  = stt:statements
  {
    return {
      reservedWords: Array.from(reservedWords),
      symbolTable:   symbolTable,
      result:        stt
    };
  }

statement
  = if
  / for
  / while
  / function
  / class
  / assg:assign SEMICOLON { return assg; }
  / retu:return SEMICOLON { return retu; }

for
  = FOR LEFTPAR start:assign SEMICOLON check:expression SEMICOLON iterate:assign RIGHTPAR block:block elseBlock:(ELSE block)?
  {
    return {
      type:     "for",
      start:    start,
      check:    check,
      iterate:  iterate,
      contents: block,
      else:     elseBlock
    }
  }

assign
  = (constant:CONST? type:TYPE)? id:ID ASSIGN assign:assign other:(COMMA ID ASSIGN assign)*
  {
    var assignations = [];

    assignations.push({id: id, assign: assign});
    other.forEach(x => assignations.push({id: x[1], assign: x[3]}));

    if (type === undefined) return {
      type:         "assign",
      assignations: assignations
    }
    else return {
      type:         "declaration",
      constant:     (constant === undefined),
      varType:      type,
      assignations: assignations
    }
  }
  / expression

block
  = LEFTBRACE code:statements RIGHTBRACE {
    return {
      type: "BLOCK",
      statements: code
    };
  }

return
  = RETURN assign:(assign)? {
    return {
      type: "RETURN",
      assign: assign
    }
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
  / id1:ID (DOT id2:ID args:arguments)* {
    return {
      type: "ID",
      id1: id1,
      id2: id2,
      arguments: args
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
FOR         = _"for"_
RETURN      = _"return"_
EXIT        = _"exit"_
FUNCTION    = _"function"_
IF          = _"if"_
ELIF        = _"else if"_
ELSE        = _"else"_
CONST       = _"const"_
TYPE        = _"numeric"_ / _"string"_ / _"bool"_
NUMBER      = _ $[0-9]+ _
ID          = _ $([a-z_]i$([a-z0-9_]i*)) _
COMPARASION = _ $([<>!=]"=" / [<>]) _
DOT         = _"."_
