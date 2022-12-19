async function retry({ factory, tries, interval }) {
  for (let attempt = 0; attempt < tries; attempt += 1) {
    try {
      return await factory();
    } catch (error) {
      await new Promise(resolve => Timer.schedule(interval, false, resolve));
    }
  }

  return null;
}

module.exports = {
  async fetchJSON({ url, tries = 3 } = {}) {
    return await retry({
      factory: async () => new Request(url).loadJSON(),
      tries: tries,
      interval: 100,
    });
  }
}