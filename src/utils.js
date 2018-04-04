import { createHash } from 'crypto';

export function getHash(str) {
  const hash = createHash('md4');
  hash.update(str);

  return hash.digest('hex').substr(0, 4);
};

export function printImportObject(o) {
  let out = '{';

  Object.keys(o).forEach(ok1 => {
    out += JSON.stringify(ok1) + ':';
    out += '{';

    Object.keys(o[ok1]).forEach(ok2 => {
      out += JSON.stringify(ok2) + ':';
      out += o[ok1][ok2] + ',';
    });

    out += '},';
  });

  out += '}';

  return out;
}
