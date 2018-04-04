
  if (typeof WebAssembly === 'undefined') {
    throw new Error('WebAssembly is not supported');
  }

'use strict';

const number = 10;

const mem = new WebAssembly.Memory({ initial: 1 });
const i32 = new Uint32Array(mem.buffer);
i32[0] = 11;

function logfoo() {
  console.log("foo");
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

Promise.resolve().then(function () { return test; }).then(({test, getNumber, logfoofromwasm}) => {
  const i32 = new Uint32Array(mem.buffer);
  console.log("test()", test(), "expected", i32[0]);

  console.log("getNumber()", getNumber());

  logfoofromwasm();
});

function then(resolve) {
    if (typeof WebAssembly.instantiateStreaming !== 'function') {
      throw new Error('WebAssembly.instantiateStreaming is not supported');
    }

    if (typeof window.fetch !== 'function') {
      throw new Error('window.fetch is not supported');
    }

    const req = window.fetch('/./dist/module7149.wasm');

    WebAssembly
      .instantiateStreaming(req, {"./env.js":{"mem":mem,"number":number,"logfoo":logfoo,},})
      .then(res => res.instance.exports)
      .then(resolve)
      .catch(resolve);
  }

var test = /*#__PURE__*/Object.freeze({
  then: then
});
