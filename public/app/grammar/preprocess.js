
/* Quita los comentarios */
let preprocess = function (code) {
  return code.replace(/\/\*[^]*?\*\//g, "")
             .replace(/\/\/[^]*?\n/g, "");
}
