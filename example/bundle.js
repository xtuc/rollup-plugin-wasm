'use strict';

function instantiate(importObject = {}) {
  if (typeof WebAssembly === 'undefined') {
    throw new Error('WebAssembly is not supported');
  }

  if (typeof WebAssembly.instantiateStreaming !== 'function') {
    throw new Error('WebAssembly.instantiateStreaming is not supported');
  }

  if (typeof window.fetch !== 'function') {
    throw new Error('window.fetch is not supported');
  }

  const req = window.fetch("/module929b.wasm");
  return WebAssembly.instantiateStreaming(req, importObject).then(res => res.instance.exports);
}

instantiate().then(({addTwo}) => {
    console.log("addTwo(1, 2)", addTwo(1, 2));
});
