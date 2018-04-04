// (module
//   (import "./env.js" "mem" (memory 1))
//   (func (export "getAtOffset") (param i32) (result i32)
//     (get_local 0)
//     (i32.load8_u)
//   )
// )

import("./getAtOffset.wasm").then(({getAtOffset}) => {
  const bytes = [
    getAtOffset(0),
    getAtOffset(1),
    getAtOffset(2),
    getAtOffset(3),
  ];

  const text = bytes
    .map(x => String.fromCharCode(x))
    .join("");

  console.log(text);
});
