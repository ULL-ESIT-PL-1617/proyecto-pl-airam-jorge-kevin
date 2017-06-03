/*
    - Detectar el uso de variables no inicializadas
    - Detectar asignaciones a variables constantes
*/

let scopeAnalisis = function(tree) {
    let symbolTable = generateSymbolTable(tree.result)
};

/* Recorre el árbol y guarda todos los tipos que se encuentran con los IDs */
let generateSymbolTable = function(resultsArray) {
    let symbolTable = {};
    let currentTable = symbolTable;

    traverse(resultsArray, process, currentTable, symbolTable);
}

// Called with every property and its value
function process(key, value, currentTable) {
    if (typeof(value) == "object") {
        switch (value.type) {
            case "declaration": console.log("Declaration", value.assignations[0].id); break;
            case "function":    console.log("Function", value.returnType); break;
            default: break;
        }
    }
}

function traverse(o, func, currentTable, symbolTable) {
    for (var i in o) {
        func.apply(this, [i, o[i], currentTable]);
        if (o[i] !== null && typeof(o[i]) == "object") {
            traverse2(o[i], func);
        }
        if (o[i].type === "function") {
            goBack = true;
        }
    }
}
