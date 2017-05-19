# Creación de un Lenguaje

 - La gramática se encuentra en `grammar/grammar.pegjs`
 - Para compilar la gramática, existe una tarea en el Rakefile o directamente `pegjs -o ./public/grammar.js ./grammar/grammar.pegjs` (El archivo ya se encuentra compilado en `./public/grammar.js`)
 - Se puede desplegar un servidor local mediante `node app.js` o utilizar el despliegue de Heroku.
 - Las pruebas son ejecutas al desplegar la aplicación web. En la pestaña _Tests_.

#### Autores

<table>
<tr>
<td> Airam Manuel Navas Simón </td>
<td> <a href="https://github.com/AiramNavas">GitHub</a> </td>
<td> <a href="https://airamnavas.github.io/">Página personal</a> </td>
<td> <a href="https://dprairamnavas.herokuapp.com/">Heroku</a> </td>
</tr>
<tr>
<td> Kevin Días Marrero </td>
<td> <a href="https://github.com/alu0100880625">GitHub</a> </td>
<td> <a href="https://alu0100880625.github.io/">Página personal</a></td>
<td> <a href="https://dprairamnavas.herokuapp.com/">Heroku</a></td>
</tr>
<tr>
<td> Jorge Sierra Acosta </td>
<td> <a href="https://github.com/Ediolot">GitHub</a> </td>
<td> <a href="https://ediolot.github.io/">Página personal</a> </td>
<td> <a href="https://dprairamnavas.herokuapp.com/">Heroku</a> </td>
</tr>
</table>

### Descripción del Lenguaje

    1.  Σ = { ADDOP, MULOP, COMMA, ASSIGN, LEFTPAR, RIGHTPAR, SEMICOLON, LEFTBRACE,
       RIGHTBRACE, LOOP, RETURN, EXIT, FUNCTION, IF, ELIF, ELSE, CONST, NUMBER, ID,
       COMPARISON }

    2.  V = { start, sentences, sentence, if_statement, for_statement, function_statement,
       comma, loop_statement, assign, condition, expression, term, factor, arguments,
       integer}

    3.  Productions:

        1.  start     → sentences
        2.  sentences → if_statement / lopp_statement / function_statement / assign ';'

        3.  if_statement       →  IF condition '{' sentences '}' (ELSE IF condition '{' sentences '}' )* (ELSE '{' sentences '}' )
        4.  function_statement → FUNCTION ID '(' (ID (',' ID)* )? ')' '{' sentences '}'
        5.  loop_statement     → FOR '(' comma ';' condition ';' comma ')' '{' sentences '}'

        6.  comma       → assign (',' assign)*
        7.  assign      → CONST? ID '=' assign / condition
        8.  condition   → expression COMPARISON expression / expression
        9.  expression  → term ADDOP expression / term
        10. term        → factor MULOP term / factor
        11. factor      → integer / RETURN assign? / EXIT / ID arguments / ID / '(' assign ')'
        12. arguments   → '(' comma? ')'
        13. integer     → NUMBER

### Descripción de uso del Lenguaje

1. Las sentencias pueden ser asignaciones, funciones o declaraciones.
2. Las funciones se declaran de la siguiente forma. Pueden ser declaradas en cualquier momento y accedidas globalmente:

    ```javascript
    function ID(ID, ID, ...) {
      ...
      return ...;
    }
    ```

    Por ejemplo:

    ```javascript
    function test(x){
      x = 3;
    }

    funtion foo() {
      return 3;
    }
    ```

4. Condicionales:

    ```javascript
    if condicion {
      ...
    }

    if condition {
      ...
    } else if condition {
      ...
    } else if condition {
      ...
    } else {
      ...
    }
    ```

5. Bucles:

    ```javascript
    for (#1 ; #2; #3) {
     ...
    }
    // #1 => Operaciones que se ejecutan antes de entrar al bucle.
    // #2 => Condición que se debe cumplir para que continue el bucle.
    // #3 => Operaciones que se ejecutan cada vez que se itera sobre el bucle.
    ```

   Por ejemplo:

    ```javascript
    for ( i = 0; i < 3; i = i + 1) {
      ...
    }
    ```

7. La asignación puede se puede realizar a cualquier tipo de expresión
   Dichas asignaciones se declaran de la siguiente forma:

    ```javascript
    const y = 5;
    x = 3 * 2;
    z = foo( 3 * 4) * 4;
    h = 1 > 2;
    ```

    No es necesario declarar las variables previamente para que la asignación se
    produzca.

8. Las condiciones toman valor true o false.
   Por ejemplo:

    ```javascript
    condition1 = TRUE
    condition2 = i < 5
    ```

### Árbol sintáctico

El árbol sintáctico generado contendrá los siguientes atributos.

| Atributo | Descripción |
| --- | --- |
| result | Contiene el código |
| symbolTable | Contiene información sobre los símbolos globales de variables del programa |
| functionTable | Contiene información sobre los símbolos que representan funciones y su propia tabla de símbolos locales |
| initialConstantTable | Contiene información sobre las constantes predefinidas y sus valores (PI, TRUE, FALSE, ...) |
| reservedWords | Conjunto de palabras reservadas |

## Algunos ejemplos del árbol sintáctico generado:

1. Código simple con tres instrucciones:

    ```javascript
    x = 1;
    y = 2;
    z = (x + 4) * y;
    ```

    Árbol resultado:


    ```json
    {
      "reservedWords": [
        "else",
        "if",
        "exit",
        "return",
        "for",
        "function",
        "const"
      ],
      "initialConstantTable": {
        "PI": 3.141592653589793,
        "TRUE": 1,
        "FALSE": 0
      },
      "functionTable": {},
      "symbolTable": {
        "PI": "constant",
        "TRUE": "constant",
        "FALSE": "constant",
        "x": "volatile",
        "y": "volatile",
        "z": "volatile"
      },
      "result": {
        "sentences": [
          {
            "type": "ASSIGN",
            "id": "x",
            "right": {
              "type": "NUM",
              "value": 1
            }
          },
          {
            "type": "ASSIGN",
            "id": "y",
            "right": {
              "type": "NUM",
              "value": 2
            }
          },
          {
            "type": "ASSIGN",
            "id": "z",
            "right": {
              "type": "MULOP",
              "op": "*",
              "left": {
                "type": "expression",
                "op": "+",
                "left": {
                  "type": "ID",
                  "id": "x"
                },
                "right": {
                  "type": "NUM",
                  "value": 4
                }
              },
              "right": {
                "type": "ID",
                "id": "y"
              }
            }
          }
        ]
      }
    }
    ```

2. Utilizando una función

    ```javascript
    function add(x, y) {
        return x + y;
    }

    add(1, 3);
    ```

    Árbol resultado:

    ```json
    {
      "reservedWords": [
        "else",
        "if",
        "exit",
        "return",
        "for",
        "function",
        "const"
      ],
      "initialConstantTable": {
        "PI": 3.141592653589793,
        "TRUE": 1,
        "FALSE": 0
      },
      "functionTable": {
        "add": {
          "params": [
            "x",
            "y"
          ],
          "symbolTable": {
            "x": "volatile",
            "y": "volatile"
          }
        }
      },
      "symbolTable": {
        "PI": "constant",
        "TRUE": "constant",
        "FALSE": "constant"
      },
      "result": {
        "sentences": [
          {
            "type": "FUNCTION",
            "id": "add",
            "params": [
              "x",
              "y"
            ],
            "code": {
              "sentences": [
                {
                  "type": "RETURN",
                  "assign": {
                    "type": "expression",
                    "op": "+",
                    "left": {
                      "type": "ID",
                      "id": "x"
                    },
                    "right": {
                      "type": "ID",
                      "id": "y"
                    }
                  }
                }
              ]
            }
          },
          {
            "type": "CALL",
            "args": {
              "type": "ARGUMENTS",
              "arguments": {
                "type": "COMMA",
                "operations": [
                  {
                    "type": "NUM",
                    "value": 1
                  },
                  {
                    "type": "NUM",
                    "value": 3
                  }
                ]
              }
            },
            "id": "add"
          }
        ]
      }
    }
    ```

3. Utilizando una sentencia IF

    ```javascript
    if 2 > 3 {
      c = 4;
    }
    else {
      c = 5;
    }
    ```

    Árbol resultado:

    ```json
    {
      "reservedWords": [
        "else",
        "if",
        "exit",
        "return",
        "for",
        "function",
        "const"
      ],
      "initialConstantTable": {
        "PI": 3.141592653589793,
        "TRUE": 1,
        "FALSE": 0
      },
      "functionTable": {},
      "symbolTable": {
        "PI": "constant",
        "TRUE": "constant",
        "FALSE": "constant",
        "c": "volatile"
      },
      "result": {
        "sentences": [
          {
            "type": "IF",
            "ifCode": {
              "condition": {
                "type": "CONDITION",
                "left": {
                  "type": "NUM",
                  "value": 2
                },
                "op": ">",
                "right": {
                  "type": "NUM",
                  "value": 3
                }
              },
              "sentences": [
                {
                  "type": "ASSIGN",
                  "id": "c",
                  "right": {
                    "type": "NUM",
                    "value": 4
                  }
                }
              ]
            },
            "elseIfCode": [],
            "elseCode": {
              "sentences": [
                {
                  "type": "ASSIGN",
                  "id": "c",
                  "right": {
                    "type": "NUM",
                    "value": 5
                  }
                }
              ]
            }
          }
        ]
      }
    }
    ```

4. Utilizando una sentencia FOR

    ```javascript
    for ( i = 0; i < 5 ; i = i + 1) {
      i = 3;
    }
    ```

    Árbol resultado:

    ```json
    {
      "reservedWords": [
        "else",
        "if",
        "exit",
        "return",
        "for",
        "function",
        "const"
      ],
      "initialConstantTable": {
        "PI": 3.141592653589793,
        "TRUE": 1,
        "FALSE": 0
      },
      "functionTable": {},
      "symbolTable": {
        "PI": "constant",
        "TRUE": "constant",
        "FALSE": "constant",
        "i": "volatile"
      },
      "result": {
        "sentences": [
          {
            "type": "LOOP",
            "left": {
              "type": "COMMA",
              "operations": [
                {
                  "type": "ASSIGN",
                  "id": "i",
                  "right": {
                    "type": "NUM",
                    "value": 0
                  }
                }
              ]
            },
            "condition": {
              "type": "CONDITION",
              "left": {
                "type": "ID",
                "id": "i"
              },
              "op": "<",
              "right": {
                "type": "NUM",
                "value": 5
              }
            },
            "right": {
              "type": "COMMA",
              "operations": [
                {
                  "type": "ASSIGN",
                  "id": "i",
                  "right": {
                    "type": "expression",
                    "op": "+",
                    "left": {
                      "type": "ID",
                      "id": "i"
                    },
                    "right": {
                      "type": "NUM",
                      "value": 1
                    }
                  }
                }
              ]
            },
            "sentences": [
              {
                "type": "ASSIGN",
                "id": "i",
                "right": {
                  "type": "NUM",
                  "value": 3
                }
              }
            ]
          }
        ]
      }
    }    
    ```

### Recursos

* [Apuntes: Programación Orientada a Objetos](https://casianorodriguezleon.gitbooks.io/ull-esit-1617/content/apuntes/oop/)
* [Apuntes: Pruebas. Mocha](https://casianorodriguezleon.gitbooks.io/ull-esit-1617/content/apuntes/pruebas/mocha.html)
* [Apuntes: Pruebas. Should](https://casianorodriguezleon.gitbooks.io/ull-esit-1617/content/apuntes/pruebas/mocha.html#shouldl)
* [Apuntes: Integración Contínua. Travis](https://casianorodriguezleon.gitbooks.io/ull-esit-1617/content/apuntes/pruebas/travis.html)
* [node-sass-middleware](https://github.com/sass/node-sass-middleware/blob/master/README.md)
