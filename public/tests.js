(function() {
  var assert;

  assert = chai.assert;

  suite('parser', function() {
    setup(function() {
    });
    test('Multiplications are parsed correctly', () => {
      var result = peg$parse('3 * 4;');
      console.log(result);
      assert.deepEqual(result, {
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
          "FALSE": "constant"
        },
        "result": {
          "sentences": [
            {
              "type": "MULOP",
              "op": "*",
              "left": {
                "type": "NUM",
                "value": 3
              },
              "right": {
                "type": "NUM",
                "value": 4
              }
            }
          ]
        }
      });
    });
    test('Bad expressions throw exceptions', () => {
      assert.throws(() => peg$parse('3 + (4+2))'), 'Expected "*", "+", "-", "/", ";", [ \\t\\n\\r], [<>!=], or [<>] but ")" found.');
    });
    test('Divisions are parsed correctly', () => {
      var result = peg$parse('10 / 2;');
      console.log(result);
      assert.deepEqual(result, {
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
          "FALSE": "constant"
        },
        "result": {
          "sentences": [
            {
              "type": "MULOP",
              "op": "/",
              "left": {
                "type": "NUM",
                "value": 10
              },
              "right": {
                "type": "NUM",
                "value": 2
              }
            }
          ]
        }
      });
    });
    test('Functions are parsed correctly', () => {
      var result = peg$parse('function test (x){ x = 3; }');
      console.log(result);
      assert.deepEqual(result, {
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
          "test": {
            "params": [
              "x"
            ],
            "symbolTable": {
              "x": "volatile"
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
              "id": "test",
              "params": [
                "x"
              ],
              "code": {
                "sentences": [
                  {
                    "type": "ASSIGN",
                    "id": "x",
                    "right": {
                      "type": "NUM",
                      "value": 3
                    }
                  }
                ]
              }
            }
          ]
        }
      });
    });
    test('Condition are parsed correctly', () => {
      var result = peg$parse('x = 2; if x == 5 { x = 0; } else { x = 1; }');
      console.log(result);
      assert.deepEqual(result, {
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
          "x": "volatile"
        },
        "result": {
          "sentences": [
            {
              "type": "ASSIGN",
              "id": "x",
              "right": {
                "type": "NUM",
                "value": 2
              }
            },
            {
              "type": "IF",
              "ifCode": {
                "condition": {
                  "type": "CONDITION",
                  "left": {
                    "type": "ID",
                    "id": "x"
                  },
                  "op": "==",
                  "right": {
                    "type": "NUM",
                    "value": 5
                  }
                },
                "sentences": [
                  {
                    "type": "ASSIGN",
                    "id": "x",
                    "right": {
                      "type": "NUM",
                      "value": 0
                    }
                  }
                ]
              },
              "elseIfCode": [],
              "elseCode": {
                "sentences": [
                  {
                    "type": "ASSIGN",
                    "id": "x",
                    "right": {
                      "type": "NUM",
                      "value": 1
                    }
                  }
                ]
              }
            }
          ]
        }
      });
    });
    test('Loops are parsed correctly', () => {
      var result = peg$parse('y = 0; for (x = 0; x < 4; x = x + 1) { y = y + 1; }');
      console.log(result);
      assert.deepEqual(result, {
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
          "y": "volatile",
          "x": "volatile"
        },
        "result": {
          "sentences": [
            {
              "type": "ASSIGN",
              "id": "y",
              "right": {
                "type": "NUM",
                "value": 0
              }
            },
            {
              "type": "LOOP",
              "left": {
                "type": "COMMA",
                "operations": [
                  {
                    "type": "ASSIGN",
                    "id": "x",
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
                  "id": "x"
                },
                "op": "<",
                "right": {
                  "type": "NUM",
                  "value": 4
                }
              },
              "right": {
                "type": "COMMA",
                "operations": [
                  {
                    "type": "ASSIGN",
                    "id": "x",
                    "right": {
                      "type": "expression",
                      "op": "+",
                      "left": {
                        "type": "ID",
                        "id": "x"
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
                  "id": "y",
                  "right": {
                    "type": "expression",
                    "op": "+",
                    "left": {
                      "type": "ID",
                      "id": "y"
                    },
                    "right": {
                      "type": "NUM",
                      "value": 1
                    }
                  }
                }
              ]
            }
          ]
        }
      });
    });
    test('The assignments are parsed correctly', () => {
      var result = peg$parse('function foo(x){} const y = 5; x = 3 * 2; z = foo(3 * 4); h = 1 > 2;');
      console.log(result);
      assert.deepEqual(result, {
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
          "foo": {
            "params": [
              "x"
            ],
            "symbolTable": {
              "x": "volatile"
            }
          }
        },
        "symbolTable": {
          "PI": "constant",
          "TRUE": "constant",
          "FALSE": "constant",
          "y": "constant",
          "x": "volatile",
          "z": "volatile",
          "h": "volatile"
        },
        "result": {
          "sentences": [
            {
              "type": "FUNCTION",
              "id": "foo",
              "params": [
                "x"
              ],
              "code": {
                "sentences": []
              }
            },
            {
              "type": "ASSIGN",
              "id": "y",
              "right": {
                "type": "NUM",
                "value": 5
              }
            },
            {
              "type": "ASSIGN",
              "id": "x",
              "right": {
                "type": "MULOP",
                "op": "*",
                "left": {
                  "type": "NUM",
                  "value": 3
                },
                "right": {
                  "type": "NUM",
                  "value": 2
                }
              }
            },
            {
              "type": "ASSIGN",
              "id": "z",
              "right": {
                "type": "CALL",
                "args": {
                  "type": "ARGUMENTS",
                  "arguments": {
                    "type": "COMMA",
                    "operations": [
                      {
                        "type": "MULOP",
                        "op": "*",
                        "left": {
                          "type": "NUM",
                          "value": 3
                        },
                        "right": {
                          "type": "NUM",
                          "value": 4
                        }
                      }
                    ]
                  }
                },
                "id": "foo"
              }
            },
            {
              "type": "ASSIGN",
              "id": "h",
              "right": {
                "type": "CONDITION",
                "left": {
                  "type": "NUM",
                  "value": 1
                },
                "op": ">",
                "right": {
                  "type": "NUM",
                  "value": 2
                }
              }
            }
          ]
        }
      });
    });
    test('The conditions are parsed correctly', () => {
      var result = peg$parse('FALSE; i = 2; i < 5;');
      console.log(result);
      assert.deepEqual(result, {
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
              "type": "ID",
              "id": "FALSE"
            },
            {
              "type": "ASSIGN",
              "id": "i",
              "right": {
                "type": "NUM",
                "value": 2
              }
            },
            {
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
            }
          ]
        }
      });
    });
    test('The expressions are parsed correctly', () => {
      var result = peg$parse('5 + 7; 9 - 7; 7;');
      console.log(result);
      assert.deepEqual(result, {
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
          "FALSE": "constant"
        },
        "result": {
          "sentences": [
            {
              "type": "expression",
              "op": "+",
              "left": {
                "type": "NUM",
                "value": 5
              },
              "right": {
                "type": "NUM",
                "value": 7
              }
            },
            {
              "type": "expression",
              "op": "-",
              "left": {
                "type": "NUM",
                "value": 9
              },
              "right": {
                "type": "NUM",
                "value": 7
              }
            },
            {
              "type": "NUM",
              "value": 7
            }
          ]
        }
      });
    });
    test('Function calls are parsed correctly', () => {
      var result = peg$parse('function f1(){} function f2(x){} f2(5); f1(); 4 * f2(7 * 2);');
      console.log(result);
      assert.deepEqual(result, {
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
          "f1": {
            "params": [],
            "symbolTable": {}
          },
          "f2": {
            "params": [
              "x"
            ],
            "symbolTable": {
              "x": "volatile"
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
              "id": "f1",
              "params": [],
              "code": {
                "sentences": []
              }
            },
            {
              "type": "FUNCTION",
              "id": "f2",
              "params": [
                "x"
              ],
              "code": {
                "sentences": []
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
                      "value": 5
                    }
                  ]
                }
              },
              "id": "f2"
            },
            {
              "type": "CALL",
              "args": {
                "type": "ARGUMENTS",
                "arguments": []
              },
              "id": "f1"
            },
            {
              "type": "MULOP",
              "op": "*",
              "left": {
                "type": "NUM",
                "value": 4
              },
              "right": {
                "type": "CALL",
                "args": {
                  "type": "ARGUMENTS",
                  "arguments": {
                    "type": "COMMA",
                    "operations": [
                      {
                        "type": "MULOP",
                        "op": "*",
                        "left": {
                          "type": "NUM",
                          "value": 7
                        },
                        "right": {
                          "type": "NUM",
                          "value": 2
                        }
                      }
                    ]
                  }
                },
                "id": "f2"
              }
            }
          ]
        }
      });
    });

  });
}).call(this);
