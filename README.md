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

 - La descripción del lenguaje se encuentra en `./Rules.md`.

### Descripción de uso del Lenguaje

1. Las sentencias pueden ser asignaciones, funciones o declaraciones.
2. Las funciones se declaran de la siguiente forma. Pueden ser declaradas en cualquier momento y accedidas globalmente:

    ```javascript
    <type> ID(ID, ID, ...) {
      ...
      return ...;
    }
    ```

    Por ejemplo:

    ```javascript
    void test(x){
      x = 3;
    }

    numeric foo() {
      return 3;
    }
    ```

3. Condicionales:

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

4. Bucles:

    ```javascript
    for (#1; #2; #3) {
     ...
    }[else {...}]

    while (parcondition) {
     ...
   }[else {...}]

    // #1 => Operaciones que se ejecutan antes de entrar al bucle.
    // #2 => Condición que se debe cumplir para que continue el bucle.
    // #3 => Operaciones que se ejecutan cada vez que se itera sobre el bucle.
    ```

   Por ejemplo:

    ```javascript
    for (i = 0; i < 3; i = i + 1) {
      ...
    } else {
      ...
    }

    while (i < 50) {
     ...
    }
    ```

5. La asignación puede se puede realizar a cualquier tipo de expresión
   Dichas asignaciones se declaran de la siguiente forma:

    ```javascript
    y = 5;
    x = 3 * 2;
    z = foo( 3 * 4) * 4;
    h = 1 > 2;
    ```

    No es necesario declarar las variables previamente para que la asignación se
    produzca.

6. Las condiciones toman valor true o false.
   Por ejemplo:

    ```javascript
    condition1 = TRUE
    condition2 = i < 5
    ```

7. Podemos declarar atributos de la clase de la siguiente forma:
    ```javascript
    <visibility> <type> <name> = [<value> | <constructor>];
    ```

    Por ejemplo:

    ```javascript
    public numeric x = 7;
    private otraClase y = otraClase.init();
    ```

8. Para declarar funciones de una clase hacemos lo siguiente:
    ```javascript
    
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

1. Código simple donde declaramos un array y un numeric:

    ```javascript
    string[][] c = {"a", "b"};
    numeric k = 0;
    ```

    Árbol resultado:


    ```json
    {
      "builtInTypes": [
        "numeric",
        "bool",
        "string",
        "void"
      ],
      "reservedWords": [
        "else",
        "if",
        "while",
        "for",
        "const",
        "numeric",
        "bool",
        "string",
        "void",
        "public",
        "private",
        "class",
        "true",
        "false",
        "return"
      ],
      "symbolTable": {
        "PI": 3.14159265359,
        "TRUE": true,
        "FALSE": false
      },
      "result": [
        {
          "type": "declaration",
          "constant": false,
          "varType": {
            "array": "true",
            "arrayCount": 2,
            "type": "string"
          },
          "assignations": [
            {
              "id": "c",
              "to": [
                {
                  "type": "string",
                  "value": "a"
                },
                {
                  "type": "string",
                  "value": "b"
                }
              ]
            }
          ]
        },
        {
          "type": "declaration",
          "constant": false,
          "varType": "numeric",
          "assignations": [
            {
              "id": "k",
              "to": {
                "type": "numeric",
                "value": 0
              }
            }
          ]
        }
      ]
    }
    ```

2. Ejemplo variado donde aparece una funcion en la cual creamos variables, dos bucles de ambos tipos (while y for), y dos condiciones if diferentes:

    ```javascript
    numeric function(string a, numeric d) {
        numeric l = 0;
        for (numeric i = 0; i < 10; i = i + 1) {
        } else { numeric x = 0; }
        while (TRUE) { numeric xx = 1; } else { numeric ll = 11; }
        if (TRUE) { numeric a = 1; } else { numeric d = 1; }
        if (TRUE) { numeric a = 1; } else if (TRUE) { numeric x = 0; a = "9"; }
    }
    ```

    Árbol resultado:

    ```json
    {
      "builtInTypes": [
        "numeric",
        "bool",
        "string",
        "void"
      ],
      "reservedWords": [
        "else",
        "if",
        "while",
        "for",
        "const",
        "numeric",
        "bool",
        "string",
        "void",
        "public",
        "private",
        "class",
        "true",
        "false",
        "return"
      ],
      "symbolTable": {
        "PI": 3.14159265359,
        "TRUE": true,
        "FALSE": false
      },
      "result": [
        {
          "type": "function",
          "returnType": "numeric",
          "functionName": "function",
          "params": [
            {
              "type": "parameter",
              "vartype": "string",
              "id": "a"
            },
            {
              "type": "parameter",
              "vartype": "numeric",
              "id": "d"
            }
          ],
          "contents": {
            "type": "block",
            "contents": [
              {
                "type": "declaration",
                "constant": false,
                "varType": "numeric",
                "assignations": [
                  {
                    "id": "l",
                    "to": {
                      "type": "numeric",
                      "value": 0
                    }
                  }
                ]
              },
              {
                "id": 0,
                "type": "for",
                "start": {
                  "type": "declaration",
                  "constant": false,
                  "varType": "numeric",
                  "assignations": [
                    {
                      "id": "i",
                      "to": {
                        "type": "numeric",
                        "value": 0
                      }
                    }
                  ]
                },
                "check": {
                  "type": "condition",
                  "op": "<",
                  "left": {
                    "type": "id",
                    "id": "i"
                  },
                  "right": {
                    "type": "numeric",
                    "value": 10
                  }
                },
                "iterate": {
                  "type": "assign",
                  "assignations": [
                    {
                      "element": "i",
                      "to": {
                        "type": "expression",
                        "op": "+",
                        "left": {
                          "type": "id",
                          "id": "i"
                        },
                        "right": {
                          "type": "numeric",
                          "value": 1
                        }
                      }
                    }
                  ]
                },
                "contents": {
                  "type": "block",
                  "contents": []
                },
                "else": {
                  "type": "block",
                  "contents": [
                    {
                      "type": "declaration",
                      "constant": false,
                      "varType": "numeric",
                      "assignations": [
                        {
                          "id": "x",
                          "to": {
                            "type": "numeric",
                            "value": 0
                          }
                        }
                      ]
                    }
                  ]
                }
              },
              {
                "id": 1,
                "type": "while",
                "check": {
                  "type": "bool",
                  "value": "true"
                },
                "contents": {
                  "type": "block",
                  "contents": [
                    {
                      "type": "declaration",
                      "constant": false,
                      "varType": "numeric",
                      "assignations": [
                        {
                          "id": "xx",
                          "to": {
                            "type": "numeric",
                            "value": 1
                          }
                        }
                      ]
                    }
                  ]
                },
                "else": {
                  "type": "block",
                  "contents": [
                    {
                      "type": "declaration",
                      "constant": false,
                      "varType": "numeric",
                      "assignations": [
                        {
                          "id": "ll",
                          "to": {
                            "type": "numeric",
                            "value": 11
                          }
                        }
                      ]
                    }
                  ]
                }
              },
              {
                "id": 2,
                "type": "if",
                "ifCode": {
                  "check": {
                    "type": "bool",
                    "value": "true"
                  },
                  "contents": {
                    "type": "block",
                    "contents": [
                      {
                        "type": "declaration",
                        "constant": false,
                        "varType": "numeric",
                        "assignations": [
                          {
                            "id": "a",
                            "to": {
                              "type": "numeric",
                              "value": 1
                            }
                          }
                        ]
                      }
                    ]
                  }
                },
                "elseIfCode": [],
                "elseCode": {
                  "type": "block",
                  "contents": [
                    {
                      "type": "declaration",
                      "constant": false,
                      "varType": "numeric",
                      "assignations": [
                        {
                          "id": "d",
                          "to": {
                            "type": "numeric",
                            "value": 1
                          }
                        }
                      ]
                    }
                  ]
                }
              },
              {
                "id": 3,
                "type": "if",
                "ifCode": {
                  "check": {
                    "type": "bool",
                    "value": "true"
                  },
                  "contents": {
                    "type": "block",
                    "contents": [
                      {
                        "type": "declaration",
                        "constant": false,
                        "varType": "numeric",
                        "assignations": [
                          {
                            "id": "a",
                            "to": {
                              "type": "numeric",
                              "value": 1
                            }
                          }
                        ]
                      }
                    ]
                  }
                },
                "elseIfCode": [
                  {
                    "check": {
                      "type": "bool",
                      "value": "true"
                    },
                    "contents": {
                      "type": "block",
                      "contents": [
                        {
                          "type": "declaration",
                          "constant": false,
                          "varType": "numeric",
                          "assignations": [
                            {
                              "id": "x",
                              "to": {
                                "type": "numeric",
                                "value": 0
                              }
                            }
                          ]
                        },
                        {
                          "type": "assign",
                          "assignations": [
                            {
                              "element": "a",
                              "to": {
                                "type": "string",
                                "value": "9"
                              }
                            }
                          ]
                        }
                      ]
                    }
                  }
                ],
                "elseCode": null
              }
            ]
          }
        }
      ]
    }
    ```

3. Ejemplo de la declaración de una clase:

    ```javascript
    class A {}
    ```

    Árbol resultado:

    ```json
    {
      "builtInTypes": [
        "numeric",
        "bool",
        "string",
        "void"
      ],
      "reservedWords": [
        "else",
        "if",
        "while",
        "for",
        "const",
        "numeric",
        "bool",
        "string",
        "void",
        "public",
        "private",
        "class",
        "true",
        "false",
        "return"
      ],
      "symbolTable": {
        "PI": 3.14159265359,
        "TRUE": true,
        "FALSE": false
      },
      "result": [
        {
          "type": "class",
          "id": "A",
          "content": {
            "type": "classBlock",
            "classStatement": []
          }
        }
      ]
    }
    ```

### Recursos

* [Apuntes: Programación Orientada a Objetos](https://casianorodriguezleon.gitbooks.io/ull-esit-1617/content/apuntes/oop/)
* [Apuntes: Pruebas. Mocha](https://casianorodriguezleon.gitbooks.io/ull-esit-1617/content/apuntes/pruebas/mocha.html)
* [Apuntes: Pruebas. Should](https://casianorodriguezleon.gitbooks.io/ull-esit-1617/content/apuntes/pruebas/mocha.html#shouldl)
* [Apuntes: Integración Contínua. Travis](https://casianorodriguezleon.gitbooks.io/ull-esit-1617/content/apuntes/pruebas/travis.html)
* [node-sass-middleware](https://github.com/sass/node-sass-middleware/blob/master/README.md)
