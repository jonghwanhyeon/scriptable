function mod(n, m) {
  return ((n % m) + m) % m;
}

class Color {
  constructor(red, green, blue) {
    this.red = red; this.green = green; this.blue = blue;
  }

  darken(ratio) {
    const hsl = this.toHSL();
    return new HSL(hsl.hue, hsl.saturate, (1 - ratio) * hsl.lightness);
  }

  lighten(ratio) {
    const hsl = this.toHSL();
    return new HSL(hsl.hue, hsl.saturate, (1 + ratio) * hsl.lightness);
  }

  saturate(ratio) {
    const hsl = this.toHSL();
    return new HSL(hsl.hue, (1 + ratio) * hsl.saturate, hsl.lightness);
  }

  desaturate(ratio) {
    const hsl = this.toHSL();
    return new HSL(hsl.hue, (1 - ratio) * hsl.saturate, hsl.lightness);
  }

  toHSL() {
    const [red, green, blue] = [this.red / 255, this.green / 255, this.blue / 255];
    const M = Math.max(red, green, blue);
    const m = Math.min(red, green, blue);
    const C = M - m;

    let hue = 0;
    switch (M) {
      case red:
        hue = mod((green - blue) / C, 6);
        break;
      case green:
        hue = ((blue - red) / C) + 2;
        break;
      case blue:
        hue = ((red - green) / C) + 4;
        break;
    }
    hue *= 60;

    let lightness = (M + m) / 2;
    let saturation = (lightness == 0 || lightness == 1) ? 0 : C / (1 - Math.abs(2 * lightness - 1));

    return new HSL(hue, saturation, lightness);
  }

  toHSV() {
    const [red, green, blue] = [this.red / 255, this.green / 255, this.blue / 255];
    const M = Math.max(red, green, blue);
    const m = Math.min(red, green, blue);
    const C = M - m;

    let hue = 0;
    switch (M) {
      case red:
        hue = mod((green - blue) / C, 6);
        break;
      case green:
        hue = ((blue - red) / C) + 2;
        break;
      case blue:
        hue = ((red - green) / C) + 4;
        break;
    }
    hue *= 60;

    let value = M;
    let saturation = (value == 0) ? 0 : C / value;

    return new HSV(hue, saturation, value);
  }

  toRGB() {
    return new RGB(this.red, this.green, this.blue);
  }
}

class RGB extends Color {
  static fromHex(hex) {
    const match = hex.toUpperCase().match(/#([0-9A-F]{2})([0-9A-F]{2})([0-9A-F]{2})/);
    return new RGB(Number.parseInt(match[1], 16), Number.parseInt(match[2], 16), Number.parseInt(match[3], 16));
  }
}

class HSL extends Color {
  constructor(hue, saturation, lightness) {    
    const C = (1 - Math.abs(2 * lightness - 1)) * saturation;
    const X = C * (1 - Math.abs(mod(hue / 60, 2) - 1))

    let [red, green, blue] = [0, 0, 0];
    if (hue <= 60) {
      [red, green, blue] = [C, X, 0];
    } else if ((hue <= 120)) {
      [red, green, blue] = [X, C, 0];
    } else if ((hue <= 180)) {
      [red, green, blue] = [0, C, X];
    } else if ((hue <= 240)) {
      [red, green, blue] = [0, X, C];
    } else if ((hue <= 300)) {
      [red, green, blue] = [X, 0, C];
    } else if ((hue <= 360)) {
      [red, green, blue] = [C, 0, X];
    }

    const m = lightness - (C / 2);
    [red, green, blue] = [red + m, green + m, blue + m];

    this.hue = hue; this.saturate = saturation; this.lightness = lightness;
    this.red, this.green, this.blue = Math.round(red * 255), Math.round(green * 255), Math.round(blue * 255);
  }
}

class HSV extends Color {
  constructor(hue, saturation, value) {
    const C = value * saturation;
    const X = C * (1 - Math.abs(mod(hue / 60, 2) - 1))

    let [red, green, blue] = [0, 0, 0];
    if (hue <= 60) {
      [red, green, blue] = [C, X, 0];
    } else if ((hue <= 120)) {
      [red, green, blue] = [X, C, 0];
    } else if ((hue <= 180)) {
      [red, green, blue] = [0, C, X];
    } else if ((hue <= 240)) {
      [red, green, blue] = [0, X, C];
    } else if ((hue <= 300)) {
      [red, green, blue] = [X, 0, C];
    } else if ((hue <= 360)) {
      [red, green, blue] = [C, 0, X];
    }

    const m = value - C;
    [red, green, blue] = [red + m, green + m, blue + m];

    this.hue = hue; this.saturate = saturation; this.value = value;
    this.red, this.green, this.blue = Math.round(red * 255), Math.round(green * 255), Math.round(blue * 255);
  }
}

module.exports = {
  RGB,
  HSL,
  HSV,
}