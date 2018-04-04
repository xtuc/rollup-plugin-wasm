import wasm from "../../src/index"

const outdir = './dist/';

export default {
  input: 'src/index.js',
  output: {
    file: outdir + 'bundle.js',
    format: 'cjs'
  },
  plugins: [
    wasm({outdir})
  ]
};
