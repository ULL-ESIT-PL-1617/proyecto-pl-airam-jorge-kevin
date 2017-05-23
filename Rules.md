
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
        'if' '(' expression ')' block
        ['else' 'if' '(' expression ')' block]*  
        ['else' '(' expression ')' block]?

 06. while →
        'while' '(' condition ')' block
        ['else' block ]?

 07. for →
        'for' '(' assign ';' expression ';' assign ')' block
        ['else' block ]?

 08. assign →
        ['const'? type]? ID '=' assign (',' ID '=' assign)*
        / expression

 09. function →
        (type|'void') ID '(' (type ID (',' type ID)* )? ')' block

 10. return →
        'return' assign?

 11. class →
        'class' ID classBlock

 12. classBlock →
        '{' (classStatement)* '}'

 13. classStatement →
        ('private'|'public') assign ';'
        / ('private'|'public') function

 14. expression →
        term ADDOP expression
        / term

 15. term →
        factor MULOP term
        / factor

 16. factor →
        number
        / ID arguments
        / ID ('.' ID arguments?)*
        / arguments
        / '(' assign ')'

 17. arguments →
        '(' (assign (',' assign)*)? ')'
