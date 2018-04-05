// a.wasm:
// (module
//   (import "./b.wasm" "fn" (func (result i32)))
//   (func (export "test") (result i32)
//     (call 0)
//   )
// )

// b.wasm:
// (module
//   (func (export "fn") (result i32)
//     (i32.const 101)
//   )
// )

import("./a.wasm").then(({test}) => {
  console.log("test()", test());
});
