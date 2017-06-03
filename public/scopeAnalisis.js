/*
    - Detectar el uso de variables no inicializadas
    - Detectar asignaciones a variables constantes
*/

let scopeAnalisis = function(tree) {
    let symbolTable = generateSymbolTable(tree.result)
};

let currentTable = null;

/* Recorre el árbol y guarda todos los tipos que se encuentran con los IDs */
let generateSymbolTable = function(resultsArray) {
    let symbolTable = {
        father: null
    };

    currentTable = symbolTable;
    traverse(resultsArray, process);
    console.log(symbolTable);
}

// Called with every property and its value
let process = function(key, value) {
    if ((value !== null) && (typeof(value) == "object")) {
        switch (value.type) {
            case "declaration":
                checkDeclarations(value);
                break;
            case "function":
                console.log("Function", value.returnType);
                break;
            default: break;
        }
    }
}

let checkDeclarations = function(declaration) {
    for (var assignation in declaration.assignations) {
        var id   = declaration.assignations[assignation].id;
        var type = declaration.assignations[assignation].varType;
        var cnst = declaration.assignations[assignation].constant;

        if (!!currentTable[id]) {
            throw "Redeclaration of " + id;
        }
        currentTable[id] = {type: type, constant: cnst};
    }
}

let traverse = function(o, func) {
    for (var i in o) {
        func.apply(this, [i, o[i]]);
        if (o[i] !== null && typeof(o[i]) == "object") {
            traverse(o[i], func);
        }
        if ((o[i] !== null) && (o[i].type === "function") && (currentTable.father !== null)) {
            currentTable = currentTable.father;
        }
    }
}
