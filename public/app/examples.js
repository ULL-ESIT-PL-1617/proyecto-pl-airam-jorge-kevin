
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
