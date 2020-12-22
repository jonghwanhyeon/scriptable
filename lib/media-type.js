class MediaType {
  constructor(identifier, signature, offset = 0) {
    this.identifier = identifier;
    this.signature = signature;
    this.offset = offset;
  }

  matches(data) {
    const bytes = data.getBytes();

    for (let index = this.offset; index < (this.offset + this.signature.length); index += 1) {
      if (this.signature[index] === undefined) continue;
      if (this.signature[index] !== bytes[index]) return false;
    }
    return true;
  }

  toString() {
    return this.identifier;
  }
}

const mediaTypes = [
  new MediaType('image/png', [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]),
  new MediaType('image/jpeg', [0xFF, 0xD8, 0xFF, 0xDB]),
  new MediaType('image/jpeg', [0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46, 0x49, 0x46, 0x00, 0x01]),
  new MediaType('image/jpeg', [0xFF, 0xD8, 0xFF, 0xEE]),
  new MediaType('image/jpeg', [0xFF, 0xD8, 0xFF, 0xE1, undefined, undefined, 0x45, 0x78, 0x69, 0x66, 0x00, 0x00]),
  new MediaType('image/gif', [0x47, 0x49, 0x46, 0x38, 0x37, 0x61]),
  new MediaType('image/gif', [0x47, 0x49, 0x46, 0x38, 0x39, 0x61]),
  new MediaType('image/bmp', [0x42, 0x4D]),
  new MediaType('application/octet-stream', []),
];

module.exports = {
  mediaTypeOf(data) {
    for (const mediaType of mediaTypes) {
      if (mediaType.matches(data)) return mediaType.toString();
    }
  }
}