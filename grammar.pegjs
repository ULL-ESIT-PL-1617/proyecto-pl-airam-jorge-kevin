{
    var constantSymbols = new Set(["pi"])
    var symbolTable = {
      PI: Math.PI
    }
}

start
  = a:comma {
      return { symbolTable: symbolTable, result: a };
    }

comma
  = left:assign COMMA right:comma {
    return { type: "COMMA", left: left, right: right };
  }
  / assign

assign
  = id:ID ASSIGN a:assign {
       id = id[1];
       if (constantSymbols.has(id.toLowerCase()))
          throw "Cant override value of constant " + id;
       symbolTable[id] = 'constant';
       return { type: "ASSIGN", id: id, right: a };
  }
  / additive

additive
  = left:multiplicative op:ADDOP right:additive {
    return {
      type: "ADDITIVE",
      op: op[1],
      left: left,
      right: right
    };
  }
  / multiplicative

multiplicative
  = left:primary op:MULOP right:multiplicative {
    return {
      type: "MULOP",
      op: op[1],
      left: left,
      right: right
    };
  }
  / primary

primary
  = int:integer {
      return { type: "NUM", value: parseInt(int[1])};
  }
  / id:ID {
      id = id[1]
      if (!symbolTable[id]) { throw id + " not defined"; }
      return { type: "ID", id: id};
    }
  / LEFTPAR a:comma RIGHTPAR { return {type: "PAR", value: a}};

integer "integer"
  = NUMBER

_ = $[ \t\n\r]*

ADDOP = PLUS / MINUS
MULOP = MULT / DIV
COMMA = _","_
PLUS = _"+"_
MINUS = _"-"_
MULT = _"*"_
DIV = _"/"_
LEFTPAR = _"("_
RIGHTPAR = _")"_
NUMBER = _ $[0-9]+ _
ID = _ $([a-z_]i$([a-z0-9_]i*)) _
ASSIGN = _ '=' _
