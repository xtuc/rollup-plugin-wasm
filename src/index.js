import { createFilter } from 'rollup-pluginutils'
import template from '@babel/template';
import generate from '@babel/generator';
import * as t from '@babel/types';
import { createHash } from 'crypto'
import { writeFileSync } from 'fs'

function getHash(str) {
  const hash = createHash('md4');
  hash.update(str);

  return hash.digest('hex').substr(0, 4);
};

const buildLoader = template(`
  export default function instantiate(importObject = {}) {
    if (typeof WebAssembly === 'undefined') {
      throw new Error('WebAssembly is not supported');
    }

    if (typeof WebAssembly.instantiateStreaming !== 'function') {
      throw new Error('WebAssembly.instantiateStreaming is not supported');
    }

    if (typeof window.fetch !== 'function') {
      throw new Error('window.fetch is not supported');
    }

    const req = window.fetch(URL);

    return WebAssembly
      .instantiateStreaming(req, importObject)
      .then(res => res.instance.exports);
  }
  `);


export default function (options = {}) {
  let state = {};

  function transform(bin, id) {
    const filter = createFilter(['**/*.wasm'], options.exclude);

    if (!filter(id)) {
      return
    }

    const filename = "module" + getHash(id) + ".wasm";

    const ast = buildLoader({
      URL: t.stringLiteral('/' + filename)
    });

    state = {bin, filename};

    return generate(ast).code;
  }

  function ongenerate(opts) {
    writeFileSync(state.filename, new Buffer(state.bin));
  }

  return {
    name: 'streaming-wasm',

    transform,
    ongenerate,
  };
}
