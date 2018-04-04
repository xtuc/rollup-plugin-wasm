import { createFilter } from 'rollup-pluginutils';
import { writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { decode } from '@webassemblyjs/wasm-parser';
import { traverse } from '@webassemblyjs/ast';
import mkdirp from 'mkdirp';
import { getHash, printImportObject } from "./utils";

const decoderOpts = {
  ignoreCodeSection: true,
  ignoreDataSection: true,
};

const banner = (`
  if (typeof WebAssembly === 'undefined') {
    throw new Error('WebAssembly is not supported');
  }
`);

const buildLoader = ({URL, IMPORT_OBJECT, IMPORTS}) => (`
  ${IMPORTS}

  export function then(resolve) {
    if (typeof WebAssembly.instantiateStreaming !== 'function') {
      throw new Error('WebAssembly.instantiateStreaming is not supported');
    }

    if (typeof window.fetch !== 'function') {
      throw new Error('window.fetch is not supported');
    }

    const req = window.fetch('${URL}');

    WebAssembly
      .instantiateStreaming(req, ${IMPORT_OBJECT})
      .then(res => res.instance.exports)
      .then(resolve)
      .catch(resolve);
  }
`);

export default function (options = {}) {
  let state = {};
  const importObject = {};

  const filter = createFilter(['**/*.wasm'], options.exclude);

  function transform(bin, id) {
    if (!filter(id)) {
      return
    }

    const filename = 'module' + getHash(id) + '.wasm';
    const imports = [];

    const wasmAst = decode(new Buffer(bin), decoderOpts);

    traverse(wasmAst, {
      ModuleImport({node}) {
        const id = node.name;
        const from = node.module

        imports.push(`import {${id}} from '${from}'`);

        if (typeof importObject[from] === 'undefined') {
          importObject[from] = {};
        }

        importObject[from][id] = id;
      }
    });

    state = {bin, filename};

    return buildLoader({
      URL: '/' + options.outdir + filename,
      IMPORT_OBJECT: printImportObject(importObject),
      IMPORTS: imports.join('\n')
    });
  }

  function onwrite(opts) {
    const outdir = dirname(opts.file);
    const out = join(outdir, state.filename)

    mkdirp.sync(outdir);
    writeFileSync(out, new Buffer(state.bin));

    state = {};
  }

  return {
    name: 'experimental/wasm',

    banner,
    transform,
    onwrite,

    options(opts) {
      opts.experimentalDynamicImport = true;
    }
  };
}
