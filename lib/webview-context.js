function compile(literals, ...substitutions) {
  let compiled = '';

  for (let index = 0; index < substitutions.length; index += 1) {
    compiled += literals[index];

    const substitution = substitutions[index];
    if (typeof substitution === 'function') {
      let code = substitution.toString();
      if (substitution.constructor.name !== 'AsyncFunction') {
        code = `async (...parameters) => (${code})(...parameters)`;
      }
      compiled += code;
    } else {
      compiled += JSON.stringify(substitution);
    }
  }
  compiled += literals[literals.length - 1];

  return compiled;
}

module.exports = class WebViewContext {
  constructor() {
    this.view = new WebView();
    this.initialized = false;
  }

  async evaluate(func, ...parameters) {
    if (!this.initialized) await this.initialize();

    return await this.view.evaluateJavaScript(compile`
      Reflect.apply(
        ${func},
        undefined,
        ${parameters},
      ).then(completion).catch(error => {
        logError(error);
        completion(null);
      });
      undefined; // A result of the last statement cannot be a instance of Promise
    `, true);
  }

  async initialize() {
    await this.view.evaluateJavaScript(`
      const G = this;
    `);
    this.initialized = true;
  }
};