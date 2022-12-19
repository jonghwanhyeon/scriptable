module.exports = {
  override(base, definitions) {
    for (const [property, method] of Object.entries(definitions)) {
      base[property] = method;
    }

    base['base'] = new Proxy(base, {
      get(target, property) {
        if (typeof target[property] === 'function') {
          return Object.getPrototypeOf(target)[property].bind(target);
        } else {
          return target[property];
        }
      },
    });

    return base;
  },

  ensureAsyncFunction(func) {
    if (func.constructor.name === 'AsyncFunction') return func;
    return async (...parameters) => func(...parameters);
  },
};