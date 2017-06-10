(function() {
  var assert;

  assert = chai.assert;

  suite('parser', function() {
    setup(function() {
    });
    test('Creating array and numeric variable', () => {
      var result = peg$parse(`string[][] c = {"a", "b"}; numeric k = 0;`);
      //console.log(result);
      assert.deepEqual(result, {
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
      });
    });
    test('Creating a function which contain a numeric variable, two loops (while and for) and two examples of if, else if, else..', () => {
      var result = peg$parse(`numeric function(string a, numeric d) {
                                numeric l = 0;
                                for (numeric i = 0; i < 10; i = i + 1) {
                                } else { numeric x = 0; }
                                while (TRUE) { numeric xx = 1; } else { numeric ll = 11; }
                                if (TRUE) { numeric a = 1; } else { numeric d = 1; }
                                if (TRUE) { numeric a = 1; } else if (TRUE) { numeric x = 0; a = "9"; }
                            }`);
      //console.log(result);
      assert.deepEqual(result, {
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
      });
    });
    test('Creating a class', () => {
      var result = peg$parse(`class A {}`);
      //console.log(result);
      assert.deepEqual(result, {
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
      });
    });

  });
}).call(this);
