Types
===
- `Block`: Block of statements. Can be run with `exec`
```
{
     <statements>
}
```
- `Name`: Like ruby's symbol
```
:<name>
```
- `Number`: A number, duh.
```
1
23.4
```

Functions
===
- `(run block scope?)` runs `block` with `scope`
- `(def name val scope?)`
