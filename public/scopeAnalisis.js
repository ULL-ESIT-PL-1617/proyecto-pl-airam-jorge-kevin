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
    baseTable.printToDiv("symbolTable");
    return baseTable;
};

var __symbolTableId = 0;
var SymbolTableClass = function(father) {
    this.array  = [];
    this.id     = __symbolTableId++;
    this.father = (!!father) ? father : null;

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

    /* Comprueba is un id no es una palabra reservada */
    this.isValidID = function(id) {
        for (var i in reservedWords) {
        }
    }

    this.addFunc = function(func) {
        var table = new SymbolTableClass(this);

        if (!!this.searchLocal(func.functionName, ["function", "method"])) {
            throw "Redeclartion of funtion " + func.functionName;
        } else this.array.push({
            id:         func.functionName,
            kind:       "function",
            type:       func.returnType,
            constant:   false,
            visibility: "public",
            local:      table
        });

        for (var i in func.params) {
            table.addParameter(func.params[i]);
        }

        return table;
    }

    this.addParameter = function(param) {
        if (!!this.searchLocal(param.id, ["variable", "parameter", "attribute"])) {
            throw "Redeclartion of variable " + param.id;
        } else this.array.push({
            id:         param.id,
            kind:       "parameter",
            type:       param.vartype,
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
                id:         id,
                kind:       "variable",
                type:       declarations.varType,
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
            id:         class_.id,
            kind:       "class",
            type:       null,
            constant:   false,
            visibility: "public",
            local:      table
        });

        return table;
    }

    this.addAttributeDeclarations = function(declarations) {
        for (var i in declarations.assignations) {
            var id = declarations.assignations[i].id;

            if (!!this.searchLocal(id, ["variable", "parameter", "attribute"])) {
                throw "Redeclartion of variable " + id;
            } else this.array.push({
                id:         id,
                kind:       "attribute",
                type:       declarations.varType,
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
            id:         method.functionName,
            kind:       "method",
            type:       method.returnType,
            constant:   false,
            visibility: method.visibility,
            local:      table
        });

        for (var i in method.params) {
            table.addparameter(func.params[i]);
        }

        return table;
    }

    this.addControlFlowLoop = function(controlFlow) {
        var tables = [];

        tables.push(new SymbolTableClass(this));
        this.array.push({
            id:         controlFlow.id,
            kind:       controlFlow.type,
            type:       null,
            constant:   false,
            visibility: "public",
            local:      tables[0]
        });

        if (controlFlow.else !== null) {
            var table = new SymbolTableClass(this);
            this.array.push({
                id:         controlFlow.id,
                kind:       "else",
                type:       null,
                constant:   false,
                visibility: "public",
                local:      table
            });
            tables.push(table);
        }

        return tables;
    }

    this.addControlFlowIf = function(controlFlow) {
        var tables = [];

        if (controlFlow.type === "if") {
            var table = new SymbolTableClass(this);
            this.array.push({
                id:         controlFlow.id,
                kind:       "if",
                type:       null,
                constant:   false,
                visibility: "public",
                local:      table
            });
            tables.push(table);
        }
        if ((controlFlow.type === "if") && (controlFlow.elseCode !== null)) {
            var table = new SymbolTableClass(this);
            this.array.push({
                id:         controlFlow.id,
                kind:       "else",
                type:       null,
                constant:   false,
                visibility: "public",
                local:      table
            });
            tables.push(table);
        }
        if ((controlFlow.type === "if") && (controlFlow.elseIfCode.length > 0)) {
            var table = new SymbolTableClass(this);
            var k = 0;
            controlFlow.elseIfCode.forEach( x => {
                this.array.push({
                    id:         controlFlow.id,
                    kind:       "elseif-" + (k++),
                    type:       null,
                    constant:   false,
                    visibility: "public",
                    local:      table
                });
            });
            tables.push(table);
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
        html += "<td>" + (!!item.local ? item.local.id : null)  + "</td>";
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

        html = "<snap>ID:" + this.id + "</snap>" +
               "<table><tr>"    +
               "<th>ID</th>"    +
               "<th>kind</th>"  +
               "<th>type</th>"  +
               "<th>const</th>" +
               "<th>visibility</th>"  +
               "<th>local scope</th>" +
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
            /*case "assign":
                checkAssignations(value);
                break;*/
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

/* Comprueba que las asignaciones se hacen a variables que ya han sido declaradas
y no son constantes */
let checkAssignations = function(assignation) {
    for (var assign in assignation.assignations) {
        var id       = assignation.assignations[assign].id;
        var constant = scope.searchUpCustomId(id);

        if (constant === null)
            throw "Variable " + id + " not declared";
        else if (constant === true) {
            throw "Variable " + id + " is constant";
        }
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
