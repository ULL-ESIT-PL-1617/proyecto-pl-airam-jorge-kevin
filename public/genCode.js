
let prefixTemplate = function() {
  return `
    module.exports = () => {
        try {
  `;
};

let suffixTemplate  = function() {
   return `
            return sym;
        }
        catch(e) {
            let err = e.message.replace(/sym\\.(\\w+)/g, '$1');
            console.log(err);
            return "error";
    }
}
`;
};

let genCode = function(tree) {

   let prefix = prefixTemplate();
   let suffix = suffixTemplate();
   let js = prefix+translate(tree)+suffix;
   return js;
};


let __insideClass = false;
let translate = function(tree) {
    let text = "";
    for (let i in tree.result) {
        text += translateStep(tree.result[i]);
    }
    return text;
}

let translateStep = function(tree) {
    switch (tree.type) {
        case "declaration": return declaration(tree);
        case "function": return function_(tree);
        case "assign": return assignation(tree);
        case "return": return return_(tree);
        case "class": return class_(tree);
        case "while": return while_(tree);
        case "for": return for_(tree);
        case "if": return if_(tree);
        default: return assignation(tree) + ";\n";
    }
    return "";
}

let if_ = function(tree) {
    let text = "if " + condition(tree.ifCode.check) + " " + block(tree.ifCode.contents);
    tree.elseIfCode.forEach(x => {
        text += " else if " + condition(x.check) + " " + block(x.contents);
    });
    if (tree.elseCode !== null) {
        text += " else " + block(tree.elseCode.contents);
    }

    return text;
}

let for_ = function(tree) {

}

let while_ = function(tree) {

}

let class_ = function(tree) {

}

let return_ = function(tree) {
    return "return" + (!!tree.returnValue ? (assignation(tree.returnValue) + " ") : "") + ";";
}

let function_ = function(tree) {
    let text = "let " + id(tree.functionName) + " = function(";

    for (let i = 0; i < tree.params.length; ++i) {
        text += id(tree.params[i]);
        text += (i < (tree.params.length - 1)) ? ", " : "";
    }
    text += ")" + block(tree.contents);
    return text;
}

let block = function(tree) {
    let text = "{\n";
    for (let i in tree.contents) {
        text += translateStep(tree.contents[i]);
    }
    text += "}\n";
    return text;
}

let declaration = function(tree) {
    let text = tree.constant ? "const " : "let ";
    for (let i = 0; i < tree.assignations.length; ++i) {
        let assg = tree.assignations[i];
        text += id(assg) + " = ";
        text += assignation(assg.to);
        text += (i < (tree.assignations.length - 1)) ? ", " : ";";
    }
    return text + "\n";
}

let assignation = function(tree) {
    if (tree.type !== "assign") return condition(tree);

    let text = "";
    for (let i = 0; i < tree.assignations.length; ++i) {
        let assg = tree.assignations[i];
        text += element(assg.element) + " = ";
        text += assignation(assg.to);
        text += (i < (tree.assignations.length - 1)) ? ", " : ";";
    }
    return text + "\n";
}

let element = function(tree) {
    if (typeof(tree) === "string") return id(tree);
    if (tree.type    === "idAccess") return idAccess(tree);
    if (tree.type    === "arrayAccess") return arrayAccess(tree);
}

let condition = function(tree) {
    if (tree.type !== "condition") return "(" + expression(tree) + ")";

    let text = "(";
    text += expression(tree.left);
    text += " " + tree.op + " ";
    text += (tree.right.type === "condition") ? condition(tree.right) : expression(tree.right);
    text += ")";
    return text;
}

let expression = function(tree) {
    if (tree.type !== "expression") return term(tree);

    let text = "(";
    text += term(tree.left);
    text += " " + tree.op + " ";
    text += (tree.right.type === "expression") ? expression(tree.right) : term(tree.right);
    text += ")";
    return text;
}

let term = function(tree) {
    if (tree.type !== "term") return factor(tree);

    let text = "(";
    text += factor(tree.left);
    text += " " + tree.op + " ";
    text += (tree.right.type === "term") ? term(tree.right) : factor(tree.right);
    text += ")";
    return text;
}

let factor = function(tree) {
    if (tree.type === "string"  ) return "\"" + tree.value + "\"";
    if (tree.type === "numeric" ) return tree.value;
    if (tree.type === "bool"    ) return tree.value;
    if (tree instanceof Array   ) return array(tree);
    if (tree.type === "call"    ) return call(tree);
    if (tree.type === "idAccess") return idAccess(tree);
    if (tree.type === "id"      ) return id(tree);
    if (tree.type === "arrayAccess") return arrayAccess(tree);
    return tree;
}

let arrayAccess = function(tree) {
    let text = id(tree.id);
    for (let i in tree.index) {
        text += "[" + assignation(tree.index[i]) + "]";
    }
    return text;
}

let id = function(tree) {
    let id = "_";
    id += (typeof(tree) === "string") ? tree : tree.id;
    return id;
}

let idAccess = function(tree) {
    let text = id(tree.base);

    for (let i in tree.access) {
        text += ".";
        text += id(tree.access[i]);
        if (tree.access[i].type === "methodAccess") {
            text += arguments_(tree.access[i].arguments);
        }
    }
    return text;
}

let call = function(tree) {
    return tree.id + arguments_(tree.args);
}

let arguments_ = function(tree) {
    let text = "(";
    for (let i = 0; i < tree.arguments.length; ++i) {
        text += assignation(tree.arguments[i]);
        text += (i < (tree.arguments.length - 1)) ? ", " : "";
    }
    text += ")";
    return text;
}

let array = function(tree) {
    let text = "[";
    for (let i = 0; i < tree.length; ++i) {
        text += factor(tree[i]);
        text += (i < (tree.length - 1)) ? ", " : "";
    }
    text += "]";
    return text;
}
