
let examples = [];

examples[0] = `
/* Función simple para sumar números */
numeric add(numeric a, numeric b) {
  return a + b;
}

/* Descomenta este ejemplo para probar un error
   Cambiando el nombre de la función, aparece el error por el valor
   de retorno.
*/
/*string add(numeric a, numeric b) {
  return a + b;
}*/

/* Se devuelve un array con dos sumas */
return {add(3, 4), add(1, 2)};
`;

examples[1] =`
/* Las estructuras de control de flujo incorporan un else
que se ejecutará solo si no se entró dentro de la
estructura de control */
bool foo = false;
// Comenta la siguiente línea para que se ejecuta el else en vez del for
//foo = true;

string palabra = "";
for (numeric a = 0; (a < 10) && foo; a = a + 1) {
  palabra = palabra + "a";
} else {
  palabra = "else executed";
}
return palabra;
`;

examples[2] =
`numeric b = 1;
const numeric a = 1;
// l(1, 2); // Mostrará un error de que no está definido l

class y {
  public numeric o = 1;
}

class x {
  public y yy = y.init();
  public void test(){}
}

x xx = x.init();
xx.yy.o = 1;

numeric[] num = {9,8};
numeric p = 2;
// num[1][num[2] * 2 + xx.yy.o + p + (2 * 3)] = 199;

// return num[1][num[2] * 2 + xx.yy.o + p + (2 * 3)] = 199;

void reset(numeric a, x lol) {
 numeric i1 = 0;
 numeric i2 = 0;
 numeric i3 = 0;
 numeric i4 = 0;
 return;
}

if (TRUE) {} else if (TRUE) {} else if (TRUE) {} else {}

for (numeric a = 1; a < 0; a = a + 1) {} else {}

while (false) { } else {}

class C {
 private numeric x = 1;
 public void init(numeric a){
    x = a;
 }
 private string t(numeric p){
  x = p;
 }
}

C ccc = C.init(1);`;

examples[3] =
`numeric []z = {3, 4};
numeric a = 8;
numeric b = 9;
numeric c = 10;
numeric f = b;
b = c;
c = 9;
a = 20;

class hola {
  private numeric kevin = 3;
  public void diHola(){ kevin = 2; }
}

class hola1 {
  public void funcion(){}
}
hola1 test = hola1.init();
test.funcion();

if (a == 4) {} else {}

numeric ab () { return 5; }

while (a == 3) {} else {}
for ( numeric i = 0; i < 50; i = i + 1) {} else {}

class custom1 {
  private numeric n = 0;
  public void init(numeric n) {
     n = 1;
  }
  public numeric test(numeric k) {
    n = k;
    return n;
  }
}

custom1 prueba = custom1.init(1);
prueba.test(2);`;

examples[4] =
`class A {
  public numeric n = 0;
}

class B {
  public A a = A.init();
}

class C {
  public B b = B.init();
}

C c = C.init();
c.b.a.n = 1;`;

let loadExample = function(example) {
  if ((example < 0) || (example > examples.length))
    return;

  setCodeInput(examples[example]);
}
