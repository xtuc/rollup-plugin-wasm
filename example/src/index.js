import instantiate from "./test.wasm"

import {mem} from "./env.js"

// (module
//   (import "./env.js" "mem" (memory 1))
//   (import "./env.js" "number" (global i32))
//   (import "./env.js" "logfoo" (func))
//
//   (func (export "test") (result i32)
//     (i32.load8_s (i32.const 0))
//   )
//   (func (export "getNumber") (result i32)
//     (get_global 0)
//   )
//   (func (export "logfoofromwasm") call 0)
// )

instantiate().then(({test, getNumber, logfoofromwasm}) => {
  const i32 = new Uint32Array(mem.buffer);
  console.log("test()", test(), "expected", i32[0]);

  console.log("getNumber()", getNumber());

  logfoofromwasm();
});
