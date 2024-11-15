export async function asyncify<T>(
  fn: () => T,
  expire = 0,
  delay = 0,
): Promise<T> {
  let done = false;
  return new Promise<T>((resolve, reject) => {
    if (expire)
      setTimeout(() => {
        if (!done) {
          done = true;
          reject(`expired after ${expire}ms`);
        }
      }, expire);
    setTimeout(() => {
      if (!done) {
        done = true;
        resolve(fn());
      }
    }, delay);
  });
}
