{
  var reservedWords = new Set([
    "else", "if", "while", "for", "const", "numeric", "bool", "string", "void",
    "public", "private", "class", "true", "false", "return"
  ]);

  var builtInTypes = new Set([
    "numeric", "bool", "string", "void"
  ]);

  var symbolTable = {
    PI:     3.14159265359,
    TRUE:   true,
    FALSE:  false
  };

  var grammarControlFlowID = 0;
}

start
  = stt:statements
  {
    return {
      builtInTypes:  Array.from(builtInTypes),
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
  = IF ifCheck:parcondition ifContents:block elseIfBlock:(ELIF parcondition block)* elseBlock:(ELSE block)?
  {
    var ifCode = {
     check:    ifCheck,
     contents: ifContents
    };

    var elseCode = {
      contents: (elseBlock === null) ? null : elseBlock[2]
    };

    let elseIfCode = [];
    elseIfBlock.forEach(x => elseIfCode.push({
      check:    x[1],
      contents: x[2]
    }));

    return {
      id:         grammarControlFlowID++,
      type:       "if",
      ifCode:     ifCode,
      elseIfCode: elseIfCode,
      elseCode:   (elseBlock === null) ? null : elseBlock[1]
    }
  }

while
  = WHILE check:parcondition? block:block elseBlock:(ELSE block)?
  {
    return {
      id:         grammarControlFlowID++,
      type:     "while",
      check:    check,
      contents: block,
      else:     (elseBlock === null) ? null : elseBlock[1]
    };
  }

for
  = FOR LEFTPAR start:assign? SEMICOLON check:condition? SEMICOLON iterate:assign? RIGHTPAR block:block elseBlock:(ELSE block)?
  {
    return {
      id:       grammarControlFlowID++,
      type:     "for",
      start:    start,
      check:    check,
      iterate:  iterate,
      contents: block,
      else:     (elseBlock === null) ? null : elseBlock[1]
    };
  }

parcondition
  = LEFTPAR exp:condition RIGHTPAR { return exp; }

assign
  = id:ID ASSIGN assign:assign other:(COMMA ID ASSIGN assign)*
  {
    var assignations = [];

    assignations.push({id: id, to: assign});
    other.forEach(x => assignations.push({id: x[1], to: x[3]}));

    return {
      type:         "assign",
      assignations: assignations
    };
  }
  / constant:CONST? type:type? id:ID ASSIGN assign:assign other:(COMMA ID ASSIGN assign)*
  {
    var assignations = [];

    assignations.push({id: id, to: assign});
    other.forEach(x => assignations.push({id: x[1], to: x[3]}));

    return {
      type:         "declaration",
      constant:     (constant !== null),
      varType:      type,
      assignations: assignations
    };
  }
  / condition

function
  = returnType:type functionName:ID LEFTPAR params:(type ID (COMMA type ID)*)? RIGHTPAR block:block
    {
      var funcParams = [];

      if (params !== null) {
        funcParams.push({type: "parameter", vartype: params[0], id: params[1]});
        params[2].forEach(x => {
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
  = CLASS id:ID classBlock:classBlock {
    return {
      type:    "class",
      id:      id,
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
    assign.type = "attribute";
    assign.visibility = visibility;
    return assign;
  }
  / visibility:VISIBLITY func:function
  {
    func.type = "method";
    func.visibility = visibility;
    return func;
  }

condition
  = left:expression op:COMPARASION right:condition
  {
    return {
      type:  "condition",
      op:    op,
      left:  left,
      right: right
    };
  }
  / expression

expression
  = left:term op:ADDOP right:expression
  {
    return {
      type:  "expression",
      op:    op,
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
      op:    op,
      left:  left,
      right: right
    };
  }
  / factor

factor
  = numeric
  / string
  / bool
  / array
  / id:ID args:arguments
  {
    return {
      type: "call",
      args: args,
      id:   id
    };
  }
  / id:ID access:(DOT ID arguments?)+
  {
    var accessId = [];
    access.forEach(x => {
      if (x[2] === null)
        accessId.push({type: "attributeAccess", id: x[1]});
      else
        accessId.push({type: "methodAccess", id: x[1], arguments: x[2]});
    });

    return {
      type:   "idAccess",
      base:   id,
      access: accessId
    };
  }
  / id:ID index:(LEFTBRACKET INTEGER RIGHTBRACKET)+
  {
    var indexAccess = [];
    index.forEach(x => indexAccess.push(x[1]));

    return {
      type:  "arrayAccess",
      id:    id,
      index: indexAccess
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
    if (args !== null) {
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
 = type:(ID ARRAY*)
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
      value: parseInt(num)
    };
  }

string
  = str:STRING
  {
    return {
      type:  "string",
      value: str.replace(/^["']|["']$/g, "")
    }
  }

bool
  = bool:BOOL
  {
    return {
      type:  "bool",
      value: bool
    }
  }

array
  = LEFTBRACE value:factor values:(COMMA factor)* RIGHTBRACE
  {
    var array = [];
    array.push(value);
    values.forEach(x => array.push(x[1]));
    return array;
  }

_ = $[ \t\n\r]*

COMMA        = _ "," _
ASSIGN       = _ "=" _
LEFTPAR      = _ "(" _
RIGHTPAR     = _ ")" _
SEMICOLON    = _ ";" _
LEFTBRACE    = _ "{" _
RIGHTBRACE   = _ "}" _
LEFTBRACKET  = _ "[" _
RIGHTBRACKET = _ "]" _
FOR          = _ "for" _
WHILE        = _ "while" _
RETURN       = _ "return" _
EXIT         = _ "exit" _
FUNCTION     = _ "function" _
IF           = _ "if" _
ELIF         = _ "else" _ "if" _
ELSE         = _ "else" _
CONST        = _ "const" _
ARRAY        = _ "[]" _
DOT          = _ "." _

ADDOP        = _ k:$("+" / "-") _                       { return k; }
MULOP        = _ k:$("*" / "/") _                       { return k; }
VISIBLITY    = _ k:$("public" / "private") _            { return k; }
STRING       = _ k:$("\""[^"\\]*("\\".[^"\\]*)*"\"") _  { return k; }
NUMBER       = _ k:$([0-9]+"."?[0-9]*) _                { return k; }
INTEGER      = _ k:$([0-9]) _                           { return k; }
BOOL         = _ k:$("true" / "false") _                { return k; }
COMPARASION  = _ k:$([<>!=]"="/[<>]/"&&"/"||") _        { return k; }
ID           = _ k:$([a-z_]i$([a-z0-9_]i*)) _           { return k; }
CLASS        = _ k:$("class") _                         { return k; }
