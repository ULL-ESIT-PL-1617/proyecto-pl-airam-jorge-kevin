module.exports = () => {
  var sym = {};
  sym['a'] = 4,
  sym['b'] = 5+sym['a'],
  sym['c'] = 2*sym['a']
  return sym;
}
