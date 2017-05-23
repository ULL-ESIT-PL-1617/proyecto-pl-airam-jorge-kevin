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
      type:       "block",
      statements: code
    };
  }

statements
  = stt:(statement)*
  {
    return sst;
  }

statement
  = if
  / for
  / while
  / function
  / class
  / assg:assign SEMICOLON { return assg; }
  / retu:return SEMICOLON { return retu; }

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
  = WHILE check:parexpression block:block elseBlock:(ELSE block)?
  {
    return {
      type:     "while",
      check:    check,
      contents: block,
      else:     elseBlock
    };
  }

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

parexpression
  = LEFTPAR exp:expression RIGHTPAR { return exp; }

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

function
  = returnType:RETURNTYPE functionName:ID LEFTPAR params:(TYPE ID (COMMA TYPE ID)*)? RIGHTPAR block:block
    {
      var funcParams = [];

      if (params !=== undefined) {
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
      type:   "return",
      assign: assign
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
VISIBLITY   = _"public"_ / _"private"_
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
ELIF        = _"else"_"if"_
ELSE        = _"else"_
CONST       = _"const"_
TYPE        = _"numeric"_ / _"string"_ / _"bool"_
RETURNTYPE  = TYPE / VOID
NUMBER      = _ $[0-9]+ _
BOOL        = _"true"_ / _"false"_
ID          = _ $([a-z_]i$([a-z0-9_]i*)) _
COMPARASION = _ $([<>!=]"=" / [<>]) _
DOT         = _"."_
CLASS       = _"class"_
VOID        = _"void"_
