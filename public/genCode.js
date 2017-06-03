//var beautify = require('js-beautify').js_beautify;

let prefixTemplate = function() {
  return `
module.exports = () => {
  let e;
  let sym = {};
  try {
  `;
}; // end prefix

let suffixTemplate  = function() {
   return `;
     return sym;
  }
  catch(e) {
    let err = e.message.replace(/sym\\.(\\w+)/g, '$1');
    console.log(err);
    return "error";
  }
}
`;
}; // end suffix

let genCode = function(tree) {

   var prefix = prefixTemplate();
   var suffix = suffixTemplate();
   /* traverse the tree producing translation */
   let js = prefix+translate()+suffix;
   //return beautify(js, { indent_size: 2 });
   return js;
};

let translate = function(tree) {
    console.log("Translate");
    return " ";
}
