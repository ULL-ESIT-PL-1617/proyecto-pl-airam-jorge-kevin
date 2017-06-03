
 01. start →
        statements

 02. block →
        '{' statements '}'

 03. statements →
        statement*

 04. statement →
        if
        / for
        / while
        / function
        / class
        / assign ';'
        / return ';'

 05. if →
        'if' parcondition block
        ['else' 'if' parcondition block]*  
        ['else' block]?

 06. while →
        'while' parcondition block
        ['else' block ]?

 07. for →
        'for' '(' assign ';' expression ';' assign ')' block
        ['else' block ]?

 08. parcondition →
        '(' condition ')'

 09. assign →
        ['const'? TYPE ARRAY*]? ID '=' assign (',' ID '=' assign)*
        / condition

 10. function →
        type ID '(' (type ID (',' type ID)* )? ')' block

 11. return →
        'return' assign?

 12. class →
        'class' ID classBlock

 13. classBlock →
        '{' (classStatement)* '}'

 14. classStatement →
        ('private'|'public') assign ';'
        / ('private'|'public') function

 16. condition →
        expression COMPARASION condition
        / expression

 15. expression →
        term ADDOP expression
        / term

 16. term →
        factor MULOP term
        / factor

 17. factor →
        numeric
        / array
        / string
        / bool
        / ID arguments
        / ID ('.' ID arguments?)+
        / ID '[' INTEGER ']'+
        / ID
        / arguments
        / '(' assign ')'

 18. arguments →
        '(' (assign (',' assign)\*)? ')'

 22. type    → TYPE '[]'*
 19. numeric → NUMBER
 20. bool    → BOOL
 21. string  → STRING
 22. array   → '{' factor (',' factor)* '}'
