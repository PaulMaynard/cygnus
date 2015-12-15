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
  / Identifier
  / Block
  / List
  / value:Value {
    return {Type: 'Value', value}
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
    return {Type: 'Number', value: num}
  }

Name
  = colon name:Identifier {
    return {Type: 'Name', name}
  }

Block
  = lbrace _ exprs:(e:Expression _ {return e})* rbrace {
    return {Type: 'Block',  exprs}
  }

List
  = colon _ lparen _ first: Expression? rest:(space e:Expression {return e})* _ rparen {
    return {
      Type: 'Call',
      function: {Type: 'Ref', name: 'list'},
      args: [[first].filter(x => !!x).concat(rest)]

     }
  }

Identifier
  = name:$(!space [^:\(\)\{\}0-9] (!space [^:\(\)\{\}])*) {
	return {Type: 'Ref', name}
  }

lparen = '('
rparen = ')'
lbrace = '{'
rbrace = '}'
colon  = ':'
space = [ \t\n\r]+
_ "whitespace" = space?
