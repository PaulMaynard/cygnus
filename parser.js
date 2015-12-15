Program
  = _ exprs:(e:Expression _ {return e})* {
    return exprs /*{
      Type: 'Call',
      function: {Type: 'Ref', name: 'run'},
      args: [
        {Type: 'Value', value:
          {Type: 'Block', exprs}
        }
      ]
    }/**/
  }

Expression
  = Call
  / Block
  / List
  / Ref
  / value:Value {
    return {Type: 'Literal', class: value.class, value: value.value}
  }

Call
  = lparen _ func:Expression args:(space e:Expression {return e})* _ rparen {
    return {Type: 'Call', func, args}
  }

Value
  = Number
  / Name

Number
  = num:$([+-]?[0-9]+('.'[0-9]+)?) {
    return {class: 'Number', value: Number(num, 10)}
  }

Name
  = colon name:Identifier {
    return {class: 'Name', value: name}
  }

Block
  = lbrace _ exprs:(e:Expression _ {return e})* rbrace {
    return {Type: 'Block',  exprs}
  }

List
  = lbracket _ first: Expression? rest:(space e:Expression {return e})* _ rbracket {
    return {
      Type: 'Call',
      function: {Type: 'Ref', name: 'list'},
      args: [[first].filter(x => !!x).concat(rest)]
    }
  }

Ref
  = name:Identifier {
    return {Type: 'Ref', name}
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

