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

statements
  = s:(statement)*
  {
    return {
      statement: s
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
    };
  }

assign
  = (constant:CONST? type:TYPE)? id:ID ASSIGN assign:assign other:(COMMA ID ASSIGN assign)*
  {
    var assignations = [];

    assignations.push({id: id, assign: assign});
    other.forEach(x => assignations.push({id: x[1], assign: x[3]}));

    return (type === undefined) ? {
      type:         "assign",
      assignations: assignations
    } : {
      type:         "declaration",
      constant:     (constant !== undefined),
      varType:      type,
      assignations: assignations
    };
  }
  / expression

block
  = LEFTBRACE code:statements RIGHTBRACE
  {
    return {
      type:       "block",
      statements: code
    };
  }

return
  = RETURN assign:(assign)?
  {
    return {
      type:   "return",
      assign: assign
    }
  }

while
  = WHILE LEFTPAR check:expression RIGHTPAR block:block elseBlock:(ELSE block)?
  {
    return {
      type:     "while",
      check:    check,
      contents: block,
      else:     elseBlock
    };
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
  / id:ID access:(DOT ID arguments?)+ {
    var accessId = [];
    access.forEach(x =>
      accessId.push(
        (x[2] === undefined)
        ? { type: "attribute", id: x[1] }
        : {type: "method", id: x[1], arguments: x[2]}
      );
    );

    return {
      type:   "idAccess",
      base:   id,
      access: accessId
    };
  }
  / id:ID
  {
    return {
      type: "id",
      id:   id
    };
  }
  / arguments
  / LEFTPAR a:assign RIGHTPAR
  {
    return a;
  }

classBlock
  = LEFTBRACE code:(classStatement)* RIGHTBRACE {
    return {
      type: "classBlock",
      classStatement: code
    };
  }

class
  = CLASS id:ID c:classBlock {
    return {
      type: "class",
      id: id[1],
      content: classBlock
    };
  }

arguments
  = LEFTPAR comma:(comma)? RIGHTPAR
  {
    return {
      type:      "arguments",
      arguments: (comma == null ? [] : comma)
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
WHILE       = _"while"_
RETURN      = _"return"_
EXIT        = _"exit"_
FUNCTION    = _"function"_
IF          = _"if"_
ELIF        = _"else if"_
ELSE        = _"else"_
CONST       = _"const"_
TYPE        = _"numeric"_ / _"string"_ / _"bool"_
NUMBER      = _ $[0-9]+ _
BOOL        = _"true"_ / _"false"_
ID          = _ $([a-z_]i$([a-z0-9_]i*)) _
COMPARASION = _ $([<>!=]"=" / [<>]) _
DOT         = _"."_
CLASS       = _"class"_
