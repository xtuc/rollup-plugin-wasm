'use strict';

const number = 10;

const mem = new WebAssembly.Memory({ initial: 1 });
const i32 = new Uint32Array(mem.buffer);
i32[0] = 11;

function logfoo() {
  console.log("foo");
}

function instantiate() {
    if (typeof WebAssembly === 'undefined') {
      throw new Error('WebAssembly is not supported');
    }

    if (typeof WebAssembly.instantiateStreaming !== 'function') {
      throw new Error('WebAssembly.instantiateStreaming is not supported');
    }

    if (typeof window.fetch !== 'function') {
      throw new Error('window.fetch is not supported');
    }

    const req = window.fetch("/modulee01d.wasm");

    return WebAssembly
      .instantiateStreaming(req, {"./env.js":{
"mem":mem,
"number":number,
"logfoo":logfoo,
},
})
      .then(res => res.instance.exports);
  }

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
