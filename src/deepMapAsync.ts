import { isArray, isPlainObject } from "./utils";

let deepMapCount = 0;

// returns a copy, unless inPlace is true
// depth-first traversal, unless depthFirst is false
// avoids circular references, unless avoidCircular is false
// NOTE: ignores symbol keys; not an issue for json-stash because symbol-keyed objects are converted to arrays
export function deepMapAsync(
  fn: (v: unknown, path: string) => unknown,
  inPlace = true,
  depthFirst = true,
  avoidCircular = true,
) {
  const seen = new WeakSet();

  async function recurse(node: unknown, path: string): Promise<unknown> {
    // don't recurse infinitely on circular references
    if (avoidCircular && (isArray(node) || isPlainObject(node))) {
      if (seen.has(node)) return node;
      seen.add(node);
    }

    // breadth-first? then do callback function before recursing
    if (!depthFirst) node = await fn(node, path);

    // recurse if node is an array or object
    if (isArray(node)) {
      const array = inPlace ? node : [...node];
      for (let i = 0; i < array.length; i++) {
        array[i] = await recurse(array[i], path ? `${path}.${i}` : `${i}`);
      }
      node = array;
    }
    if (isPlainObject(node)) {
      // we ignore symbol keys; not an issue for json-stash because symbol-keyed objects are converted to arrays
      const obj = inPlace ? node : { ...node };
      for (const k in obj) {
        obj[k] = await recurse(obj[k], path ? `${path}.${k}` : `${k}`);
      }
      node = obj;
    }

    // depth-first? then do callback function after recursing
    if (depthFirst) node = await fn(node, path);

    return node;
  }

  return async (value: unknown) => {
    return recurse(value, "");
  };
}
