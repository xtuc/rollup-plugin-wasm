import { createFilter } from 'rollup-pluginutils'
import { createHash } from 'crypto'
import { writeFileSync } from 'fs'
import { decode } from "@webassemblyjs/wasm-parser";
import { traverse } from "@webassemblyjs/ast";

function getHash(str) {
  const hash = createHash('md4');
  hash.update(str);

  return hash.digest('hex').substr(0, 4);
};

function generateImportObject(o) {
  let out = "{";

  Object.keys(o).forEach(ok1 => {
    out += JSON.stringify(ok1) + ":";
    out += "{";

    out += "\n";

    Object.keys(o[ok1]).forEach(ok2 => {
      out += JSON.stringify(ok2) + ":";
      out += o[ok1][ok2] + ",";

      out += "\n";
    });

    out += "}";
    out += ",\n";
  });

  out += "}";

  return out;
}

const buildLoader = ({URL, IMPORT_OBJECT, IMPORTS}) => (`
  ${IMPORTS}

  export default function instantiate() {
    if (typeof WebAssembly === 'undefined') {
      throw new Error('WebAssembly is not supported');
    }

    if (typeof WebAssembly.instantiateStreaming !== 'function') {
      throw new Error('WebAssembly.instantiateStreaming is not supported');
    }

    if (typeof window.fetch !== 'function') {
      throw new Error('window.fetch is not supported');
    }

    const req = window.fetch("${URL}");

    return WebAssembly
      .instantiateStreaming(req, ${IMPORT_OBJECT})
      .then(res => res.instance.exports);
  }
`);

const decoderOpts = {
  ignoreCodeSection: true,
  ignoreDataSection: true,
};

export default function (options = {}) {
  let state = {};
  let importObject = {};

  function transform(bin, id) {
    const filter = createFilter(['**/*.wasm'], options.exclude);

    if (!filter(id)) {
      return
    }

    const filename = "module" + getHash(id) + ".wasm";
    const imports = [];

    const wasmAst = decode(new Buffer(bin), decoderOpts);

    traverse(wasmAst, {
      ModuleImport({node}) {
        const id = node.name;
        const from = node.module

        imports.push(`import {${id}} from "${from}"`);

        if (typeof importObject[from] === "undefined") {
          importObject[from] = {};
        }

        importObject[from][id] = id;
      }
    });

    state = {bin, filename};

    return buildLoader({
      URL: '/' + filename,
      IMPORT_OBJECT: generateImportObject(importObject),
      IMPORTS: imports.join("\n")
    });
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
