
let examples = [];

examples[0] = `string[] c = {"a", "b"};
numeric k = 0;

numeric function(string a, numeric d) {
  numeric l = 0;
  for (numeric i = 0; i < 10; i = i + 1) {

  } else { numeric x = 0; }

  while (TRUE) { numeric xx = 1; } else { numeric ll = 11; }

  if (TRUE) { numeric a = 1; } else { numeric d = 1; }
  if (TRUE) { numeric a = 1; } else if (TRUE) { numeric x = 0; a = "9"; }
}

class x {
  private numeric test = 0;
  private void test2() {}
}`;

examples[1] =
`class x {}

class MyClass {
  private numeric n = 0;

  public void init() {}
  public void test1(numeric n) {}
  private string test2() { return "asd"; }
}


MyClass c = MyClass.init();
c.test1(32);`;

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
num[1][num[2] * 2 + xx.yy.o + p + (2 * 3)] = 199;

return num[1][num[2] * 2 + xx.yy.o + p + (2 * 3)] = 199;

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
