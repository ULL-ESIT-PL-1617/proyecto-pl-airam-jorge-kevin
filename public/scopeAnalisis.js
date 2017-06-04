/*
    - Detectar el uso de variables no inicializadas
    - Detectar asignaciones a variables constantes
*/

var symbolTableClass = function(father) {
    this.array = [];
    this.father = (!!father) ? father : null;

    this.isCustomId = function (type) {
        return (type !== "function") && (type !== "class")
    }

    /* Comprueba si la tabla contiene una función con un id */
    this.containsFuncId = function(id) {
        for (var i in this.array) {
            if ((this.array[i].id === id) && (this.array[i].type === "function"))
                return true;
        }
        return false;
    };

    /* Comprueba si la tabla contiene una clase con un id */
    this.containsClassId = function(id) {
        for (var i in this.array) {
            if ((this.array[i].id === id) && (this.array[i].type === "class"))
                return true;
        }
        return false;
    };

    /* Comprueba si la tabla contiene un id que no es una función ni una clase */
    this.containsCustomId = function(id) {
        for (var i in this.array) {
            if ((this.array[i].id === id) && this.isCustomId(this.array[i].type))
                return true;
        }
        return false;
    };

    /* Comprueba si esta tabla o algun padre contiene un id que no es ni clase ni función
        Devuelve true si el id encontrado es constante.
        Devuelve false si el id encontrado no es constante.
        Devuelve null si no se encuentra.
    */
    this.searchUpCustomId = function(id) {
        var table = this;
        while (table !== null) {
            for (var i in table.array) {
                if ((table.array[i].id === id) && this.isCustomId(table.array[i].type))
                    return table.array[i].constant;
            }
            table = table.father;
        }
        return null;
    }

    /* Añade un id de función y devuelve el puntero a la nueva tabla */
    this.addFuncId = function(id, funcParams, isMethod) {
        var object = {id: id, type: "function", local: new symbolTableClass(this)};
        this.array.push(object);
        for (var i in funcParams) {
            object.local.array.push({id: funcParams[i].id, type: funcParams[i].vartype, param: true, constant: false, belongsToClass: !!isMethod});
        }
        return object.local;
    }

    /* Añade un id que no sea de una función ni de una clase */
    this.addCustomId = function(id, type, constant, isAttribute) {
        this.array.push({id: id, type: type, param: false, constant: constant, belongsToClass: !!isAttribute});
    }

    /* Añade un id que sea de una clase */
    this.addClassId = function(id) {
        var object = {id: id, type: "class", local: new symbolTableClass(this)};
        this.array.push(object);
        return object.local;
    }

    /* Muestra la tabla formateada */
    this.print = function() {
        var table = this;
        var text  = "";
        for (var i in table.array) {
            if (table.array[i].type === "function") {
                text += table.array[i].id + "\tfunction\n=====\n" + table.array[i].local.print() + "======\n";
            } else {
                var type = table.array[i].type;
                var typeText = type;
                if (typeof(type) == "object") {
                    typeText = "array of ";
                    for (var j = 1; j < type.arrayCount; ++j) {
                        typeText += typeText;
                    }
                    typeText += type.type;
                }
                text +=
                    table.array[i].id + "\t" +
                    typeText + "\t" +
                    (table.array[i].constant ? "const    " : "not const") + "\t" +
                    (table.array[i].param ? "parameter" : "not parameter") +
                    "\n";
            }
        }
        return text;
    }
}

let scope;
let reservedWords;
let builtInTypes;

let scopeAnalisis = function(tree) {
    let log = scope = new symbolTableClass();
    reservedWords = tree.reservedWords;
    builtInTypes  = tree.builtInTypes;
    traverse(tree.result, process);
    console.log(log.print());
};

// Called with every property and its value
let process = function(key, value) {
    if ((value !== null) && (typeof(value) == "object")) {
        switch (value.type) {
            case "assign":
                checkAssignations(value);
                break;
            case "declaration":
                checkDeclarations(value);
                break;
            case "function":
                checkFunctions(value);
                break;
            case "class":
                checkClass(value);
                break;
            case "attribute":
                checkAttributes(value);
                break;
            default: break;
        }
    }
}

let checkAttributes = function(attribute) {
    var id = attribute.id;

    if (scope.containsClassId(id)) {
        throw "Redeclaration of class " + id;
    }
    scope = scope.addClassId(id);
}

let checkClass = function(class_) {
    var id = class_.id;

    if (scope.containsClassId(id)) {
        throw "Redeclaration of class " + id;
    }
    scope = scope.addClassId(id);
}

let checkFunctions = function(func) {
    var id = func.functionName;

    if (scope.containsFuncId(id)) {
        throw "Redeclaration of function " + id;
    }
    scope = scope.addFuncId(id, func.params);
}

/* Si la variable ya está declarada en el scope, throw. Si no, añádela a la tabla */
let checkDeclarations = function(declaration) {
    for (var assign in declaration.assignations) {
        var id   = declaration.assignations[assign].id;
        var type = declaration.varType;
        var cnst = declaration.constant;

        if (reservedWords.indexOf(id.toLowerCase()) !== -1) {
            throw "Cant use " + id + " as an id";
        }

        if ((typeof(type) === "string") &&
            (reservedWords.indexOf(type.toLowerCase()) !== -1) && (builtInTypes.indexOf(type.toLowerCase()) === -1)) {
            throw "Cant use " + type + " as a type";
        }

        // Arrays
        if ((typeof(type) === "object") &&
            (reservedWords.indexOf(type.type.toLowerCase()) !== -1) && (builtInTypes.indexOf(type.type.toLowerCase()) === -1)) {
            throw "Cant use " + type.type + " as a type";
        }

        if (scope.containsCustomId(id)) {
            throw "Redeclaration of variable " + id;
        }
        scope.addCustomId(id, type, cnst);
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
        if ((o[i] !== null) && !scope.isCustomId(o[i].type) && (scope.father !== null)) {
            scope = scope.father;
        }
    }
}
