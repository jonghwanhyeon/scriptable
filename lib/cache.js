const G = this;

const dateutils = importModule('dateutils');
const TimeDelta = dateutils.TimeDelta;

class Record {
  constructor(property, value, cachedAt, expiresAfter) {
    this.property = property;
    this.value = value;
    this.cachedAt = cachedAt;
    this.expiresAfter = expiresAfter;
  }

  get expired() {
    if (this.expiresAfter === null) return false;

    const expiresAt = this.expiresAfter.dateAfter(this.cachedAt);
    return dateutils.passed(expiresAt);
  }

  write(path) {
    const manager = G.FileManager.local();
    console.log(`Write ${this.toJSON()}`);
    manager.writeString(path, this.toJSON());
  }

  toJSON() {
    return JSON.stringify({
      property: this.property,
      value: this.value,
      cachedAt: this.cachedAt.getTime(),
      expiresAfter: this.expiresAfter.getTime(),
    });
  }

  static readFrom(path) {
    const manager = G.FileManager.local();
    if (manager.fileExists(path)) {
      return Record.fromJSON(manager.readString(path));
    } else {
      return null;
    }
  }

  static fromJSON(json) {
    const record = JSON.parse(json);
    return new Record(
      record.property,
      record.value,
      new Date(record.cachedAt),
      new TimeDelta(record.expiresAfter),
    );
  }
}

module.exports = class Cache {
  constructor(name, expiresAfter = new TimeDelta({ hours: 1 })) {
    this.name = name;
    this.defaultExpiresAfter = expiresAfter;

    this.manager = G.FileManager.local();
    this.directory = this.manager.joinPath(this.manager.cacheDirectory(), this.name.replace(/\./g, '/'));
    if (!this.manager.fileExists(this.directory)) {
      this.manager.createDirectory(this.directory, true);
    }
  }

  get(property, defaultValue = null) {
    const record = Record.readFrom(this.pathFor(property));
    if (record === null) return defaultValue;

    if (record.expired) {
      this.manager.remove(this.pathFor(property));
      return defaultValue;
    }

    return record.value;
  }

  set(property, value, expiresAfter = this.defaultExpiresAfter) {
    new Record(property, value, new Date(), expiresAfter).write(this.pathFor(property));
  }

  has(property) {
    const record = Record.readFrom(this.pathFor(property));
    return (record !== null) && !record.expired;
  }

  info(property) {
    const record = Record.readFrom(this.pathFor(property));
    return {
      cachedAt: record.cachedAt,
      expiresAfter: record.expiresAfter,
      expiresAt: record.expiresAfter.dateAfter(record.cachedAt),
    };
  }

  pathFor(property) {
    return this.manager.joinPath(this.directory, `${property}.json`);
  }

  static create(...parameters) {
    return new Proxy(new Cache(...parameters), {
      get(target, property) {
        if (property in target) {
          return target[property];
        } else {
          return target.get(property);
        }
      },
      set(target, property, value) {
        if (property in target) {
          target[property] = value;
        } else {
          target.set(property, value);
        }
        return true;
      },
      has(target, property) {
        return target.has(property);
      },
    });
  }
};