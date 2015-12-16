Program
  = _ exprs:(e:Expression _ {return e})* {
    return {
      Type: 'call',
      func: {Type: 'ref', name: 'run'},
      args: [
        {Type: 'block', exprs}
      ]
    }
  }

Expression
  = Call
  / Block
  / List
  / Ref
  / value:Value {
    return {Type: 'literal', Class: value.Class, value: value.value}
  }

Call
  = lparen _ func:Expression args:(space e:Expression {return e})* _ rparen {
    return {Type: 'call', func, args}
  }

Value
  = Number
  / Name

Number
  = num:$([+-]?[0-9]+('.'[0-9]+)?) {
    return {Class: 'number', value: Number(num, 10)}
  }

Name
  = colon name:Identifier {
    return {Class: 'name', value: name}
  }

Block
  = lbrace _ exprs:(e:Expression _ {return e})* rbrace {
    return {Type: 'block',  exprs}
  }

List
  = lbracket _ first: Expression? rest:(space e:Expression {return e})* _ rbracket {
    return {
      Type: 'call',
      func: {Type: 'ref', name: 'list'},
      args: [first].filter(x => !!x).concat(rest)
    }
  }

Ref
  = name:Identifier {
    return {Type: 'ref', name}
  }

Identifier
  = $(!space [^:\(\)\{\}\[\]0-9] (!space [^:\(\)\{\}\[\]])*)

lparen   = '('
rparen   = ')'
lbrace   = '{'
rbrace   = '}'
lbracket = '['
rbracket = ']'
colon    = ':'
space    = [ \t\n\r]+
_ "whitespace" = space?
