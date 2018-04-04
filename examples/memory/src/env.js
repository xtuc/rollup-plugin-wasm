export const mem = new WebAssembly.Memory({ initial: 1});

const uint8View = new Uint8Array(mem.buffer);

const text = "sven";
const bytes = text
  .split("")
  .map(x => x.charCodeAt(0));

uint8View[0] = bytes[0];
uint8View[1] = bytes[1];
uint8View[2] = bytes[2];
uint8View[3] = bytes[3];
