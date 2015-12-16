class Scope {
  constructor(vars, parents) {
    this.vars = vars || new Map()
    this.parents = parents || [Scope.global]
  }
  get(name) {
    if(this.vars.has(name)) {
      return this.vars.get(name)
    } else if(this.parents.length > 0) {
      for(let p of this.parents) {
        if(p.has(name)) {
          return p.get(name)
        }
      }
      return nil
    } else {
      return nil
    }
  }
  set(name, val) {
    if(this.vars.has(name)) {
      this.vars.set(name, val)
    } else if(this.parents.length > 0) {
      for(let p of this.parents) {
        if(p.has(name)) {
           p.set(name)
           return
        }
      }
    }
  }
  has(name) {
    if(this.vars.has(name)) {
      return true
    } else if(this.parents.length > 0) {
      for(let p of this.parents) {
        if(p.has(name)) {
          return true
        } else {
          return false
        }
      }
    } else {
      return false
    }
  }
  def(name, val = nil) {
    this.vars.set(name, val)
  }
  debug() {
    let o = {}
    for(let [k, v] of this.vars) {
      o[k] = v
    }
    o.Parents = this.parents.map(p => p.debug())
    return o
  }
}

class Value {
  constructor(val, type) {
    this.value = val
    this.type = type
  }
}
let nil = new Value(null, 'Nil')
function Name(name) {
  if(Name.symbols.has(name)) {
    return Name.symbols.get(name)
  } else {
    let val = new Value(name, 'Name')
    Name.symbols.set(name, val)
    return val
  }
}
Name.symbols = new Map()
class Block extends Value {
  constructor(exprs, lexScope) {
    super(exprs, 'Block')
    this.run = (runScope = new Scope()) => {
      let s = new Scope(new Map(), [runScope, lexScope])
      let r = nil
      for(let e of this.value) {
        r = e.exec(s)
      }
      return r
    }
  }
}
class JSFunc extends Value {
  constructor(func) {
    super(func, 'Function')
  }
  call(args, scope) {
    return this.value(...args)
  }
}
class ScopeFunc extends JSFunc {
  constructor(func) {
    super(func)
  }
  call(args, scope) {
    return this.value(args, scope)
  }
}

class Expression {

}
class Literal extends Expression {
  constructor(val) {
    super()
    this.value = val
  }
  exec() {
    return this.value
  }
}
class Ref extends Expression {
  constructor(name) {
    super()
    this.name = name
  }
  exec(scope) {
    return scope.get(this.name)
  }
}
class CallExpr extends Expression {
  constructor(func, args) {
    super()
    this.func = func
    this.args = args
  }
  exec(scope) {
    return this.func.exec(scope).call(this.args.map(a => a.exec(scope)), scope)
  }
}
class BlockExpr extends Expression {
  constructor(exprs) {
    super()
    this.exprs = exprs
  }
  exec(scope) {
    return new Block(this.exprs, scope)
  }
}

function build(node) {
  return build.types[node.Type](node)
}
build.types = {
  ref({name}) {
    return new Ref(Name(name))
  },
  literal({Class, value}) {
    return new Literal(build.classes[Class](value))
  },
  block({exprs}) {
    return new BlockExpr(exprs.map(build))
  },
  call({func, args}) {
    return new CallExpr(build(func), args.map(build))
  }
}
build.classes = {
  number(num) {
    return new Value(num, 'Number')
  },
  name(n) {
    return Name(n)
  }
}
Scope.global = new Scope(new Map([
  [Name('nil'), nil],
  [new Name('run'), new JSFunc((block, scope) => {
    return block.run(scope || new Scope())
  })],
  [new Name('list'), new JSFunc((...elems) => new Value(elems, 'List'))],
  [new Name('scope'), new ScopeFunc(([vars], scope) => {
    if(vars) {
      console.log(vars)
      //return new Value(new Scope(vars.value))
    }
    return new Value(scope, "scope")
  })],
  [new Name('def'), new ScopeFunc(([name, val, scope], defscope) =>
    ((scope && scope.value) || defscope).def(name, val))],
  [new Name('get'), new ScopeFunc(([name, scope], defscope) =>
    ((scope && scope.value) || defscope).get(name, val))],
  [new Name('set'), new ScopeFunc(([name, val, scope], defscope) =>
    ((scope && scope.value) || defscope).set(name, val))],
  //[new Name('func')],
]), [])
let stdlibjs = new Scope(new Map([
  [Name('+'), new JSFunc((a, b) => new Value(a.value + b.value, 'Scope'))],
  [Name('-'), new JSFunc((a, b) => new Value(a.value - b.value, 'Scope'))],
]))
let scope = new Scope(new Map([
  [Name('foo'), new Value(123, 'number')]
]), [stdlibjs, Scope.global])
console.log(build(
{
   "Type": "call",
   "func": {
      "Type": "ref",
      "name": "run"
   },
   "args": [
      {
         "Type": "block",
         "exprs": [
            {
               "Type": "call",
               "func": {
                  "Type": "ref",
                  "name": "scope"
               },
               "args": [
                  {
                     "Type": "call",
                     "func": {
                        "Type": "ref",
                        "name": "list"
                     },
                     "args": [
                        {
                           "Type": "call",
                           "func": {
                              "Type": "ref",
                              "name": "list"
                           },
                           "args": [
                              {
                                 "Type": "literal",
                                 "Class": "name",
                                 "value": "x"
                              },
                              {
                                 "Type": "literal",
                                 "Class": "number",
                                 "value": 1
                              }
                           ]
                        }
                     ]
                  }
               ]
            }
         ]
      }
   ]
}
).exec(scope))

console.log('\n\n')
