class Scope {
  constructor(vars = new Map(), parents = [Scope.global]) {
    this.vars = vars
    this.parents = parents
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
      return undefined
    } else {
      return undefined
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
  constructor(val) {
    this.value = val
  }
}
let nil = new Value(null)
let undef = new Value(undefined)
function Name(name) {
  if(Name.symbols.has(name)) {
    return Name.symbols.get(name)
  } else {
    let val = new Value(name)
    Name.symbols.set(name, val)
    return val
  }
}
Name.symbols = new Map()
class Block extends Value {
  constructor(exprs, lexScope) {
    super(exprs)
    this.run = (runScope = new Scope()) => {
      let s = new Scope(new Map(), [runScope, lexScope])
      let r = undef
      for(let e of this.value) {
        r = e.exec(s)
      }
      return r
    }
  }
}
class JSFunc extends Value {
  constructor(func) {
    super(func)
  }
  call(args) {
    return this.value(...args)
  }
}
class Func extends JSFunc {
  constructor(args, body) {
    super(func)
  }
  call(args) {
    return this.value(...args)
  }
}

class Expression {
  constructor(exec) {
    this.exec = exec
  }
}
class ValExpr extends Expression {
  constructor(val) {
    super(() => this.val)
    this.value = val
  }
}
class VarRef extends Expression {
  constructor(name) {
    super(scope => scope.get(this.name))
    this.name = name
  }
}
class CallExpr extends Expression {
  constructor(func, args) {
    super(scope => {
      console.log(args)
      console.log()
      return func.exec(scope).call([args[0].value, args[1].value])
    })
    this.func = func
    this.args = args
  }
}
class BlockExpr extends Expression {
  constructor(exprs) {
    super(scope => new Block(this.exprs, scope))
    this.exprs = exprs
  }
}

function build(node) {
  return build.types[node.Type](node)
}
build.types = {
  Value({value}) {
    return new ValExpr(build(value))
  },
  Ref({name}) {
    return new VarRef(Name(name))
  },
  Number({value}) {
    return new Value(value)
  },
  Block({exprs}) {
    return new BlockExpr(exprs.map(build))
  },
  Call({func, args}) {
    return new CallExpr(build(func), args.map(build))
  }
}
Scope.global = new Scope(new Map([
  [new Name('nil'), nil],
  [new Name('undef'), undef],
  //[new Name('run'), new JSFunc((block, scope) => {
  //  return block.run(scope)
  //})],
  //[new Name('list')],
  //[new Name('scope')]
  //[new Name('set')],
  //[new Name('def')],
  //[new Name('func')],
]))
let s = new Scope(new Map([
  [new Name('+'), new JSFunc((a, b) => new Value(a.value + b.value))]
]))
console.log(build({
  "Type": "Call",
    "func": {
      "Type": "Ref",
      "name": "+"
    },
    "args": [
      {
        "Type": "Value",
        "value": {
         "Type": "Number",
          "value": "2"
        }
      },
      {
        "Type": "Value",
        "value": {
          "Type": "Number",
          "value": "2"
        }
      }
   ]
}).exec(s))
