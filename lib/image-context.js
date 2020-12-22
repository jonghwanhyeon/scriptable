const G = this;

const WebViewContext = importModule('webview-context');
const {mediaTypeOf} = importModule('media-type');
const utils = importModule('utils');

function gaussian(radius, std) {
  const vector = [];
  for (let x = -radius; x <= radius; x += 2) {
    vector.push(Math.exp(-(x**2 / (2 * std**2))));
  }

  const kernel = [];
  const scale = 1.0 / utils.sum(vector);
  for (let i = 0; i < vector.length; i += 1) {
    for (let j = 0; j < vector.length; j += 1) {
      kernel.push((scale * vector[i])* (scale * vector[j]));
    }
  }

  return kernel;
}


module.exports = class ImageContext {
  constructor() {
    this.context = new WebViewContext();
  }

  static async create(data) {
    const self = new ImageContext();
    await self.context.evaluate(() => {
      G.canvas = document.createElement('canvas');
    });

    if (typeof data !== undefined) {
      await self.load(data);
    }

    return self;
  }

  async load(data) {
    await this.context.evaluate(async (data, mediaType) => {
      const image = await new Promise(resolve => {
        const element = new Image();
        element.onload = () => resolve(element);
        element.src = `data:${mediaType};base64,${data}`;
      });

      G.canvas.width = image.naturalWidth;
      G.canvas.height = image.naturalHeight;
      G.canvas.getContext('2d').drawImage(image, 0, 0);
    }, data.toBase64String(), mediaTypeOf(data));
  }

  static async fromURL(url) {
    return this.create(await new Request(url).load());
  }

  async toData() {
    const dataURL = await this.context.evaluate(() => G.canvas.toDataURL('image/png'));
    return G.Data.fromBase64String(dataURL.slice('data:image/png;base64,'.length));
  }

  async toImage() {
    return G.Image.fromData(await this.toData());
  }

  async clone() {
    return await ImageContext.create(await this.toData());
  }

  async convolve(filter) {
    await this.context.evaluate(filter => {
      const dimension = Math.sqrt(filter.length);
      const half = Math.floor(dimension / 2);
      
      const width = G.canvas.width;
      const height = G.canvas.height;

      const context = G.canvas.getContext('2d');
      const input = context.getImageData(0, 0, width, height);
      const output = context.createImageData(input);

      for (let currentY = 0; currentY < height; currentY += 1) {
        for (let currentX = 0; currentX < width; currentX += 1) {
          const currentIndex = (currentX + (currentY * width)) * 4;
          
          let red = 0, green = 0, blue = 0, alpha = 0;
          for (let filterY = 0; filterY < dimension; filterY += 1) {
            for (let filterX = 0; filterX < dimension; filterX += 1) {
              const targetY = Math.min(height - 1, Math.max(0, currentY + filterY - half));
              const targetX = Math.min(width - 1, Math.max(0, currentX + filterX - half));
              const targetIndex = (targetX + (targetY * width)) * 4;
              const weight = filter[filterX + (filterY * dimension)];

              red += input.data[targetIndex + 0] * weight;
              green += input.data[targetIndex + 1] * weight;
              blue += input.data[targetIndex + 2] * weight;
              alpha += input.data[targetIndex + 3] * weight;
            }
          }
          
          output.data[currentIndex + 0] = red;
          output.data[currentIndex + 1] = green;
          output.data[currentIndex + 2] = blue;
          output.data[currentIndex + 3] = alpha;
        }
      }

      context.putImageData(output, 0, 0);
    }, filter);

    return this;
  }

  async blur(radius, std = 3) {
    const kernel = gaussian(radius, std);

    await this.context.evaluate((radius, kernel) => {
      const context = G.canvas.getContext('2d');

      let index = 0;
      for (let y = -radius; y <= radius; y += 2) {
        for (let x = -radius; x <= radius; x += 2) {
          context.globalAlpha = radius * kernel[index];
          context.drawImage(G.canvas, x, y);
          index += 1;
        }
      }
      context.globalAlpha = 1.0;
    }, radius, kernel);

    return this;
  }

  async darken(alpha = 0.3) {
    await this.context.evaluate(alpha => {
      const context = G.canvas.getContext('2d');

      context.fillStyle = `rgba(0, 0, 0, ${alpha})`;
      context.fillRect(0, 0, G.canvas.width, G.canvas.height);
    }, alpha);

    return this;
  }

  get width() {
    return this.context.evaluate(() => G.canvas.width);
  }

  get height() {
    return this.context.evaluate(() => G.canvas.height);
  }
};