
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
foo = true;

string palabra = "";
for (numeric a = 0; (a < 10) && foo; a = a + 1) {
  palabra = palabra + "a";
} else {
  palabra = "else executed";
}
return palabra;
`;

examples[2] =`
/* You can access attributes of classes */
class A {
  public numeric x = 1;
}
class B {
  public A y = A.init(); // init calls the constructor of the class
                         // If the constructor does not exists
                         // the default constructor is called
}
class C {
  public B z = B.init();
}
C c = C.init();
return c.z.y.x = c.z.y.x + 3;

/* You can also create an array of classes. (Comment the return
in the superior line) */

C[] array = { C.init(), C.init() };
array[0].z.y.x = 0;
array[1].z = B.init();
return array; // Remove the other return for this one to work
`;

examples[3] =`

/* Class that represents a matrix */
class Matrix {
  private numeric rows_ = 0;
  private numeric cols_ = 0;
  private numeric[] data_ = { 0 };

  public void generate(numeric rows, numeric cols) {
    rows_ = rows;
    cols_ = cols;
    data_ = { 0 };
    for (numeric i = 0; i < (rows * cols - 1); i = i + 1) {
      data_.push(0);
    }
  }

  private numeric pos(numeric row, numeric col) {
    return col + (row * cols_);
  }

  public void set(numeric row, numeric col, numeric val) {
    data_[pos(row, col)] = val;
  }

  public numeric get(numeric row, numeric col) {
    return data_[pos(row, col)];
  }
}

Matrix m = Matrix.init();
m.generate(2, 3);
m.set(0, 0, 1);
m.set(1, 0, 2);
return m;
`;

examples[4] =`
/* Some generic errors and examples */

// numeric []z = {3, "asas"}; // Cant initialize value to string
numeric a = 8;
numeric b = 9;
numeric c = 10;
numeric f = b;
string h = "asas";
b = c;
c = 9;
a = 20;
// h = a; // Invalid types for assignation



class Foo {
  private numeric k = 3;
  public void sayHello(){ k = 2; }
}

class Foo1 {
  public void funcion(){}
}

// class Foo1 {} // Redeclaration of class Foo1

Foo1 test = Foo1.init();

test.funcion();

if (a == 4) {} else {}

/*
numeric ab() {
  return; // Returning void is not valid
}
*/

while (a == 3) {}
while (a == 3) {} else {}

/*
for (i = 0; i < 50; i = i + 1) {} // Variable i is undeclared
else {}
*/

class Foo2 {
  private numeric n = 0;
  public void init(numeric n) {
     n = 1;
  }
  public numeric test(numeric k) {
    n = k;
    return n;
  }
}
// Foo2 prueba = Foo2.init(); // Constructor requires a numeric value
`;

let loadExample = function(example) {
  if ((example < 0) || (example > examples.length))
    return;

  setCodeInput(examples[example]);
}
