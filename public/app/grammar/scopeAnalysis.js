/*
    - Detectar el uso de variables no inicializadas
    - Detectar asignaciones a variables constantes
*/

let scope;
let scopeQueue = [];
let reservedWords;
let builtInTypes;

let scopeAnalisis = function(tree) {
    let baseTable = scope = new SymbolTableClass();
    reservedWords = tree.reservedWords;
    builtInTypes  = tree.builtInTypes;
    traverse(tree.result, process);
    baseTable.printToDiv("box4-table");
    return baseTable;
};

var __symbolTableId = 0;
var SymbolTableClass = function(father, fatherRow) {
    this.array     = [];
    this.id        = __symbolTableId++;
    this.father    = (!!father) ? father : null;
    this.fatherRow = (!!fatherRow) ? fatherRow : null;

    /* Busca en la tabla actual (No en sus hijos ni en su padre)
    un fila que contenga un id y que sea de alguno de los tipos kinds.
    Por ejemplo: search(id, ["variable", "parameter"]) */
    this.searchLocal = function(id, kinds) {
        for (var i in this.array) {
            if ((this.array[i].id === id) && (kinds.indexOf(this.array[i].kind) !== -1)) {
                return this.array[i];
            }
        }
        return null;
    }

    /* Busca en la tabla actual (No en sus hijos) y en su padre si no lo encontrara
    un fila que contenga un id y que sea de alguno de los tipos kinds.
    Por ejemplo: search(id, ["variable", "parameter"]) */
    this.search = function(id, kinds) {
        for (var i in this.array) {
            if ((this.array[i].id === id) && (kinds.indexOf(this.array[i].kind) !== -1)) {
                return this.array[i];
            }
        }
        return (!!this.father ? this.father.search(id, kinds) : null);
    }

    /* Comprueba si un id no es una palabra reservada */
    this.isValidID = function(id) {
        for (var i in reservedWords) {
            if (reservedWords[i] === id.toLowerCase()) {
                throw id + " id cant be similar to the reserved word " + reservedWords[i];
            }
        }
        return id;
    }

    /* Comprueba si un tipo no es una palabra reservada, exluyendo aquellas que indican builtInTypes.
       Si la comprobación se completa satisfactoriamente, comprueba que el tipo o bien es builtInTypes
       o bien es de una clase ya definida. */
    this.isValidType = function(type) {
        if (typeof(type) == "object") return type;
        if (!type                   ) return null;
        if (this.isBuiltInType(type)) return type;

        for (var i in reservedWords) {
            if (reservedWords[i] === type.toLowerCase()) {
                throw type + " type cant be similar to the reserved word " + reservedWords[i];
            }
        }

        if ((typeof(type) == "object") && (scope.search(type.type, ["class"]) === null))
            throw "Unkown class " + type.type;
        else if (scope.search(type, ["class"]) === null)
            throw "Unkown class " + type;

        return type;
    }

    /* Comprueba si un typo es uno de los builtInTypes */
    this.isBuiltInType = function(type) {
        for (var i in builtInTypes) {
            if (builtInTypes[i] === type) {
                return true;
            }
        }

        if ((typeof(type) == "object") && this.isBuiltInType(type.type)) {
          return true;
        }
        return false;
    }

    this.addFunc = function(func) {
        var table = new SymbolTableClass(this);

        if (!!this.searchLocal(func.functionName, ["function", "method"])) {
            throw "Redeclartion of funtion " + func.functionName;
        } else this.array.push({
            table:      this,
            id:         this.isValidID(func.functionName),
            kind:       "function",
            type:       this.isValidType(func.returnType),
            constant:   false,
            visibility: "public",
            local:      table
        });

        for (var i in func.params) {
            table.addParameter(func.params[i]);
        }

        table.fatherRow = this.array.slice(-1)[0];
        return table;
    }

    this.addParameter = function(param) {
        if (!!this.searchLocal(param.id, ["variable", "parameter", "attribute"])) {
            throw "Redeclartion of variable " + param.id;
        } else this.array.push({
            table:      this,
            id:         this.isValidID(param.id),
            kind:       "parameter",
            type:       this.isValidType(param.vartype),
            constant:   false,
            visibility: "public",
            local:      null
        });
    }

    this.addDeclarations = function(declarations) {
        for (var i in declarations.assignations) {
            var id = declarations.assignations[i].id;

            if (!!this.searchLocal(id, ["variable", "parameter", "attribute"])) {
                throw "Redeclartion of variable " + id;
            } else this.array.push({
                table:      this,
                id:         this.isValidID(id),
                kind:       "variable",
                type:       this.isValidType(declarations.varType),
                constant:   declarations.constant,
                visibility: "public",
                local:      null
            });
        }
    }

    this.addClass = function(class_) {
        var table = new SymbolTableClass(this);

        if (!!this.searchLocal(class_.id, ["class"])) {
            throw "Redeclartion of class " + class_.id;
        } this.array.push({
            table:      this,
            id:         this.isValidID(class_.id),
            kind:       "class",
            type:       null,
            constant:   false,
            visibility: "public",
            local:      table
        });

        table.fatherRow = this.array.slice(-1)[0];
        return table;
    }

    this.addAttributeDeclarations = function(declarations) {
        for (var i in declarations.assignations) {
            var id = declarations.assignations[i].id;

            if (!!this.searchLocal(id, ["variable", "parameter", "attribute"])) {
                throw "Redeclartion of variable " + id;
            } else this.array.push({
                table:      this,
                id:         this.isValidID(id),
                kind:       "attribute",
                type:       this.isValidType(declarations.varType),
                constant:   declarations.constant,
                visibility: declarations.visibility,
                local:      null
            });
        }
    }

    this.addMethod = function(method) {
        var table = new SymbolTableClass(this);

        if (!!this.searchLocal(method.functionName, ["function", "method"])) {
            throw "Redeclartion of method " + method.functionName;
        } else this.array.push({
            table:      this,
            id:         this.isValidID(method.functionName),
            kind:       "method",
            type:       this.isValidType(method.returnType),
            constant:   false,
            visibility: method.visibility,
            local:      table
        });

        if ((method.functionName === "init") && (method.visibility === "private")) {
            throw "init method for class " + this.fatherRow.id + " can only be public";
        }
        if ((method.functionName === "init") && (method.returnType !== "void")) {
            throw "init method for class " + this.fatherRow.id + " can only return void";
        }

        for (var i in method.params) {
            table.addParameter(method.params[i]);
        }

        table.fatherRow = this.array.slice(-1)[0];
        return table;
    }

    this.addControlFlowLoop = function(controlFlow) {
        var tables = [];

        tables.push(new SymbolTableClass(this));
        this.array.push({
            table:      this,
            id:         controlFlow.id,
            kind:       controlFlow.type,
            type:       null,
            constant:   false,
            visibility: "public",
            local:      tables[0]
        });
        tables.slice(-1)[0].fatherRow = this.array.slice(-1)[0];

        if (controlFlow.else !== null) {
            var table = new SymbolTableClass(this);
            this.array.push({
                table:      this,
                id:         controlFlow.id,
                kind:       "else",
                type:       null,
                constant:   false,
                visibility: "public",
                local:      table
            });
            tables.push(table);
        }
        tables.slice(-1)[0].fatherRow = this.array.slice(-1)[0];

        return tables;
    }

    this.addControlFlowIf = function(controlFlow) {
        var tables = [];

        if (controlFlow.type === "if") {
            var table = new SymbolTableClass(this);
            this.array.push({
                table:      this,
                id:         controlFlow.id,
                kind:       "if",
                type:       null,
                constant:   false,
                visibility: "public",
                local:      table
            });
            tables.push(table);
            table.fatherRow = this.array.slice(-1)[0];
        }
        if ((controlFlow.type === "if") && (controlFlow.elseCode !== null)) {
            var table = new SymbolTableClass(this);
            this.array.push({
                table:      this,
                id:         controlFlow.id,
                kind:       "else",
                type:       null,
                constant:   false,
                visibility: "public",
                local:      table
            });
            tables.push(table);
            table.fatherRow = this.array.slice(-1)[0];
        }
        if ((controlFlow.type === "if") && (controlFlow.elseIfCode.length > 0)) {
            var table = new SymbolTableClass(this);
            var k = 0;
            controlFlow.elseIfCode.forEach( x => {
                this.array.push({
                    table:      this,
                    id:         controlFlow.id,
                    kind:       "elseif-" + (k++),
                    type:       null,
                    constant:   false,
                    visibility: "public",
                    local:      table
                });
            });
            tables.push(table);
            table.fatherRow = this.array.slice(-1)[0];
        }

        return tables;
    }

    this.typeToText = function(type) {
        if (!type)       return "null";
        if (!type.array) return type;

        var text = "";
        for (var i = 0; i < type.arrayCount; ++i) { text += "array of "; }

        return text + type.type;
    }

    this.toHTMLrow = function(item, subtables) {
        var html = "";
        html += "<tr>";
        html += "<td>" + item.id         + "</td>";
        html += "<td>" + item.kind       + "</td>";
        html += "<td>" + this.typeToText(item.type) + "</td>";
        html += "<td>" + item.constant   + "</td>";
        html += "<td>" + item.visibility + "</td>";
        html += "<td>Table ID: " + (!!item.local ? item.local.id : "none")  + "</td>";
        html += "</tr>";

        if (!!item.local) {
            subtables.push(item.local);
        }

        return html;
    }

    this.printToDiv = function(id) {
        document.getElementById(id).innerHTML = this.print();
    }

    /* Muestra la tabla formateada en html */
    this.print = function() {
        var subtables = [];
        var html = "";

        for (var i in this.array) {
            html += this.toHTMLrow(this.array[i], subtables);
        }

        html = "<p><br/></p><p><snap>ID:" + this.id + "</snap></p><p><br/></p>" +
               "<table><tr>"    +
               "<th>ID</th>"    +
               "<th>Kind</th>"  +
               "<th>Type</th>"  +
               "<th>Const</th>" +
               "<th>Visibility</th>"  +
               "<th>Local scope</th>" +
               "</tr>" + html + "</table>";

       for (var i in subtables) {
           html += subtables[i].print();
       }

       return html;
    }
}

// Called with every property and its value
let process = function(key, value) {
    if ((value !== null) && (typeof(value) == "object")) {
        switch (value.type) {
            case "idAccess":
                checkIdAccess(value);
                break;
            case "call":
                checkCall(value);
                break;
            case "assign":
                checkAssignations(value);
                break;
            case "id":
                checkId(value);
                break;
            case "return":
                checkReturn(value);
                break;
            case "if":
                scopeQueue = scope.addControlFlowIf(value);
                scope = scopeQueue.shift();
                break;
            case "while":
            case "for":
                scopeQueue = scope.addControlFlowLoop(value);
                scope = scopeQueue.shift();
                break;
            case "declaration":
                scope.addDeclarations(value);
                break;
            case "function":
                scope = scope.addFunc(value);
                break;
            case "class":
                scope = scope.addClass(value);
                break;
            case "attribute":
                scope.addAttributeDeclarations(value);
                break;
            case "method":
                scope = scope.addMethod(value);
                break;
            default: break;
        }
    }
}

let checkId = function(id) {
  if (scope.search(id.id, ["variable", "attribute", "parameter"]) === null)
    throw "Id " + id.id + " is not defined";
}

let isAConstructor = function(idAccess) {
    var classRow = scope.search(idAccess.base, ["class"]);

    if (classRow === null) return false;
    if (idAccess.access.length !== 1) return false;
    if (idAccess.access[0].id !== "init") return false;
    return true;
}

let checkIdAccess = function(idAccess) {
    if (isAConstructor(idAccess)) return;

    let base = (idAccess.base.type === "arrayAccess") ? idAccess.base.id : idAccess.base;
    var row  = scope.search(base, ["variable", "parameter", "attribute"]);
    if (row === null) {
        throw base + " is not a valid object";
    }
    var currentType = row.type;

    for (var i in idAccess.access) {

        if (currentType.array) {
          if (idAccess.base.index) {
            let dimension = currentType.arrayCount - idAccess.base.index.length;
            if (dimension <= 0) continue;
          }

          if (idAccess.access[i].id === "push") {
            currentType = "void";
            continue;
          } else if (idAccess.access[i].id === "pop") {
            currentType = "void";
            continue;
          } else {
            throw "Only available methods for array are push() and pop()";
          }
        }
        if (scope.isBuiltInType(currentType)) {
            throw "Cant access method or attribute of built in type";
        }
        var typeClass = scope.search(currentType, ["class"]);
        var atype     = idAccess.access[i].type;
        var find      = (atype === "methodAccess") ? "method" : "attribute";
        var row       = typeClass.local.searchLocal(idAccess.access[i].id, [find]);

        if (row === null)  {
            throw "Cant find " + find + " " + idAccess.access[i].id + " for type " + currentType;
        }

        if (row.visibility == "private" && ((scope.father === null) || (row.table.fatherRow.local.id != scope.father.id))) {
            throw "Cant access private " + find + " " + idAccess.access[i].id;
        }

        currentType = typeClass.local.searchLocal(idAccess.access[i].id, [find]).type;
    }
}

let checkReturn = function(return_) {
    if ((return_.returnValue !== null) && (return_.returnValue.type === "declaration"))
      throw "Declaration of a new id inside a return is not allowed."
}

/* Comprueba que las asignaciones se hacen a variables que ya han sido declaradas
y no son constantes */
let checkAssignations = function(assignation) {
    for (var assign in assignation.assignations) {
        var element  = assignation.assignations[assign].element;

        var id = null;
        if (typeof(element) == "string") {
            id = element;
        } else if (element.type === "idAccess") {
            id = element.base;
        } else { // type === "arrayAccess"
            id = element.id;
        }

        if (id.type === "arrayAccess")
          id = id.id;

        var row = scope.search(id, ["variable", "parameter", "attribute"]);

        if (row === null)
            throw "Variable " + id + " not declared";
        else if (row.constant) {
            throw "Variable " + id + " is constant";
        }
    }
}

let checkCall = function(call) {
    if (!scope.search(call.id, ["function", "method"])) {
        throw "Unknown function to call " + call.id;
    }
}

let traverse = function(o, func) {
    for (var i in o) {
        func.apply(this, [i, o[i]]);
        if (o[i] !== null && typeof(o[i]) == "object") {
            traverse(o[i], func);
        }

        if ((o[i] !== null) && (scope.father !== null)) {
            if ((o[i].type === "block") && (scopeQueue.length > 0)) {
                scope = scopeQueue.shift();
            }
            else if ((o[i].type === "function") || (o[i].type === "class") || (o[i].type === "method") ||
                     (o[i].type === "for"     ) || (o[i].type === "while") || (o[i].type === "if"    )) {
                    scope = scope.father;
            }
        }
    }
}
