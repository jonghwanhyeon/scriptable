const G = this;

module.exports = class Storage {
  constructor(name) {
    this.name = name;
    this.data = {};

    this.manager = G.FileManager.local();
    this.directory = this.manager.joinPath(this.manager.documentsDirectory(), 'storage');
    this.path = this.manager.joinPath(this.directory, `${this.name.replace(/\//g, '-')}.json`);
    if (!this.manager.fileExists(this.directory)) this.manager.createDirectory(this.directory);
    this.update();
  }

  get(property, defaultValue) {
    this.update();
    return (property in this.data) ? this.data[property] : defaultValue;
  }

  set(property, value) {
    this.data[property] = value;
    this.commit();
  }

  remove(property) {
    this.update();
    delete this.data[property];
    this.commit();
  }

  clear() {
    this.data = {}
    this.commit();
  }

  has(property) {
    this.update();
    return property in this.data;
  }

  keys() {
    this.update();
    return Object.keys(this.data);
  }

  empty() {
    return this.length === 0;
  }

  get length() {
    return this.keys().length;
  }

  update() {
    if (this.manager.fileExists(this.path)) {
      this.data = JSON.parse(this.manager.readString(this.path));
    } else {
      this.data = {};
    }
  }

  commit() {
    if (Object.keys(this.data).length > 0) {
      this.manager.writeString(this.path, JSON.stringify(this.data));
    } else {
      this.manager.remove(this.path);
    }
  }

  static create(...parameters) {
    return new Proxy(new Storage(...parameters), {
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
}