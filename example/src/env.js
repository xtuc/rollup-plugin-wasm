export const number = 10;

export const mem = new WebAssembly.Memory({ initial: 1 });
const i32 = new Uint32Array(mem.buffer);
i32[0] = 11;

export function logfoo() {
  console.log("foo")
}
