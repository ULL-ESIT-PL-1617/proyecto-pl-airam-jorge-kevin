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

block
  = LEFTBRACE code:statements RIGHTBRACE
  {
    return {
      type:     "block",
      contents: code
    };
  }

statements
  = stt:(statement)*
  {
    return stt;
  }

statement
  = if
  / for
  / while
  / function
  / class
  / retu:return SEMICOLON { return retu; }
  / assg:assign SEMICOLON { return assg; }

if
  = IF ifCheck:parexpression ifContents:block elseIfBlock:(ELIF parexpression block)* elseBlock:(ELSE block)?
  {
    var ifCode = {
     check:    ifCheck,
     contents: ifContents
    };

    var elseCode = {
      contents: (elseBlock === undefined) ? undefined : elseBlock[2]
    };

    let elseIfCode = [];
    elseIfBlock.forEach(x => elseIfCode.push({
      check:    x[1],
      contents: x[2]
    }));

    return {
      type:       "IF",
      ifCode:     ifCode,
      elseIfCode: elseIfCode,
      elseCode:   elseCode
    }
  }

while
  = WHILE check:parexpression? block:block elseBlock:(ELSE block)?
  {
    return {
      type:     "while",
      check:    check,
      contents: block,
      else:     elseBlock[1]
    };
  }

for
  = FOR LEFTPAR start:assign? SEMICOLON check:expression? SEMICOLON iterate:assign? RIGHTPAR block:block elseBlock:(ELSE block)?
  {
    return {
      type:     "for",
      start:    start,
      check:    check,
      iterate:  iterate,
      contents: block,
      else:     elseBlock[1]
    };
  }

parexpression
  = LEFTPAR exp:expression RIGHTPAR { return exp; }

assign
  = id:ID ASSIGN assign:assign other:(COMMA ID ASSIGN assign)*
  {
    var assignations = [];

    assignations.push({id: id[1], to: assign});
    other.forEach(x => assignations.push({id: x[1][1], to: x[3]}));

    return {
      type:         "assign",
      assignations: assignations
    };
  }
  / constant:CONST? type:type? id:ID ASSIGN assign:assign other:(COMMA ID ASSIGN assign)*
  {
    var assignations = [];

    assignations.push({id: id[1], to: assign});
    other.forEach(x => assignations.push({id: x[1][1], to: x[3]}));

    return {
      type:         "declaration",
      constant:     (constant !== null),
      varType:      type[1],
      assignations: assignations
    };
  }
  / expression

function
  = returnType:type functionName:ID LEFTPAR params:(type ID (COMMA type ID)*)? RIGHTPAR block:block
    {
      var funcParams = [];

      if (params !== undefined) {
        funcParams.push({type: "parameter", vartype: params[0], id: params[1]});
        params.forEach(x => {
          funcParams.push({ type: "parameter", vartype: x[1], id: x[2]});
        });
      }

      return {
        type:         "function",
        returnType:   returnType,
        functionName: functionName,
        params:       funcParams,
        contents:     block
      };
    }

return
  = RETURN assign:(assign)?
  {
    return {
      type:       "return",
      returnValue: assign
    }
  }

class
  = CLASS id:ID c:classBlock {
    return {
      type: "class",
      id: id[1],
      content: classBlock
    };
  }

classBlock
  = LEFTBRACE code:(classStatement)* RIGHTBRACE {
    return {
      type: "classBlock",
      classStatement: code
    };
  }

classStatement
  = visibility:VISIBLITY assign:assign SEMICOLON
  {
    return {
      type:       "attribute",
      visibility: visibility,
      assign:     assign
    }
  }
  / visibility:VISIBLITY func:function
  {
    return {
      type:       "method",
      visibility: visibility,
      method:     func
    }
  }

expression
  = left:term op:ADDOP right:expression
  {
    return {
      type:  "expression",
      op:    op[1],
      left:  left,
      right: right
    };
  }
  / term

term
  = left:factor op:MULOP right:term
  {
    return {
      type:  "term",
      op:    op[1],
      left:  left,
      right: right
    };
  }
  / factor

factor
  = numeric
  / string
  / bool
  / id:ID args:arguments
  {
    return {
      type: "call",
      args: args,
      id:   id[1]
    };
  }
  / id:ID access:(DOT ID arguments?)+
  {
    var accessId = [];
    access.forEach(x => {
      if (x[2] === undefined)
        accessId.push({type: "attribute", id: x[1][1]});
      else
        accessId.push({type: "method", id: x[1][1], arguments: x[2]});
    });

    return {
      type:   "idAccess",
      base:   id[1],
      access: accessId
    };
  }
  / id:ID index:(LEFTBRACKET INTEGER RIGHTBRACKET)+
  {
    var indexAccess = [];
    index.forEach(x => indexAccess.push(index[2]));

    return {
      type:  "arrayAccess",
      id:    id[1],
      index: index
    };
  }
  / id:ID
  {
    return {
      type: "id",
      id:   id[1]
    };
  }
  / arguments
  / LEFTPAR assign:assign RIGHTPAR { return assign; }

arguments
  = LEFTPAR args:(assign (COMMA assign)*)? RIGHTPAR
   {
    var funcArgs = [];
    if (args !== undefined) {
      funcArgs.push(args[0]);
      args[1].forEach(x => {
        funcArgs.push(x[1]);
      });
    }
    return {
      type:      "arguments",
      arguments: funcArgs
    };
   }

type
 = type:(TYPES ARRAY*)
 {
   if (type[1].length == 0)
    return type[0];
   else
    return {
      array:      "true",
      arrayCount: type[1].length,
      type:       type[0]
    };
 }

numeric
  = num:NUMBER
  {
    return {
      type:  "numeric",
      value: parseInt(num[1])
    };
  }

string
  = str:STRING
  {
    return {
      type:  "string",
      value: str[1]
    }
  }

bool
  = bool:BOOL
  {
    return {
      type:  "bool",
      value: bool[1]
    }
  }

array
  = LEFTBRACE value:factor values:(COMMA factor)* RIGHTBRACKET
  {
    var array = [];
    array.push(factor);
    values.forEach(x => array.push(x[1]));
    return array;
  }

_ = $[ \t\n\r]*

ADDOP        = PLUS / MINUS
MULOP        = MULT / DIV
VISIBLITY    = _"public"_ / _"private"_
COMMA        = _","_
PLUS         = _"+"_
MINUS        = _"-"_
MULT         = _"*"_
ASSIGN       = _"="_
DIV          = _"/"_
LEFTPAR      = _"("_
RIGHTPAR     = _")"_
SEMICOLON    = _";"_
LEFTBRACE    = _"{"_
RIGHTBRACE   = _"}"_
LEFTBRACKET  = _"]"_
RIGHTBRACKET = _"["_
FOR          = _"for"_
WHILE        = _"while"_
RETURN       = _"return"_
EXIT         = _"exit"_
FUNCTION     = _"function"_
IF           = _"if"_
ELIF         = _"else"_"if"_
ELSE         = _"else"_
CONST        = _"const"_
ARRAY        = _"[]"_
TYPES        = ID
STRING       = _"\"(\\.|[^\"])*\""_
NUMBER       = _ $([0-9]+"."?[0-9]*)_
INTEGER      = _ $[0-9]_
BOOL         = _"true"_ / _"false"_
ID           = _ $([a-z_]i$([a-z0-9_]i*))_
COMPARASION  = _ $([<>!=]"="/[<>])_
DOT          = _"."_
CLASS        = _"class"_
VOID         = _"void"_
