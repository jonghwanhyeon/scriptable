// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: blue; icon-glyph: magic;
module.exports = {
  choose(sequence) {
    return sequence[Math.floor(Math.random() * sequence.length)];
  },

  async retry(tries, promise, interval) {
    for (let attempt = 0; attempt < tries; attempt += 1) {
      try {
        return await promise;
      } catch (error) {
        await new Promise(resolve => Timer.schedule(interval, false, resolve));
      }
    }

    return null;
  },
  
  toAsyncFunction(func) {
    if (func.constructor.name === 'AsyncFunction') return func;
    return async (...parameters) => func(...parameters);
  },

  sum(iterable) {
    return iterable.reduce((accumulator, value) => accumulator + value, 0);
  }
}