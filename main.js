#!/usr/bin/env node
var PEG = require("./grammar.js");
var input = process.argv[2] || "a=5, b= 3*2, c = 9";
console.log(`Processing <${input}>`);
var r = PEG.parse(input);
console.log(JSON.stringify(r, null, 2));
