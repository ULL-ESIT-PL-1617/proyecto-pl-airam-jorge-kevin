#!/usr/bin/env node
var util = require('util');
var fs = require('fs');
var PEG = require("./grammar.js");
var fileName = process.argv[2] || 'input1';
var SPACES = "    ";
fs.readFile(fileName, 'utf8', function (err,input) {
  if (err) {
    return console.log(err);
  }
  console.log(`Processing <\n${input}\n>`);
  var r = PEG.parse(input);
  console.log(util.inspect(r, { depth: null }));
  var js = genCode(r);
  console.log(js);
});

var genCode = function(tree) {
    var suffix = ';\nreturn sym;\n}';
    var preffix = 'module.exports = () => {\nvar sym = {};\n'
    return ident(preffix + translate(tree.result) + suffix);
}

var ident = function(str) {
  var lines = str.split("\n");
  var depth = 0;
  for (var i = 0; i < lines.length; ++i) {
    var new_depth = depth + getDepth(lines[i]);
    var idents    = (new_depth <= depth) ? new_depth : depth;

    for (var j = 0; j < idents; ++j)
      lines[i] = SPACES + lines[i];
    depth = new_depth;
  }
  return lines.join("\n");
}

var getDepth = function(line) {
  var depth = 0;
  for (var i = 0; i < line.length; ++i) {
    if (line[i] === '}') depth--;
    if (line[i] === '{') depth++;
  }
  return depth;
}

var translate = function(tree) {
  if (tree.type === "COMMA") {
    return translate(tree.left) + ",\n" + translate(tree.right);
  }
  if (tree.type === "ASSIGN") {
    return "sym['" + tree.id + "'] = " + translate(tree.right);
  }
  if (tree.type === "ADDITIVE") {
    return translate(tree.left) + " " + tree.op + " " + translate(tree.right);
  }
  if (tree.type === "MULOP") {
    return translate(tree.left) + " " + tree.op + " " + translate(tree.right);
  }
  if (tree.type === "NUM") {
    return tree.value;
  }
  if (tree.type === "ID") {
    return "sym['" + tree.id + "']"
  }
  if (tree.type === "PAR") {
    return "(" + tree.a + ")";
  }
  return "";
}
