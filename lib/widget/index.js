const G = this;
const { override, ensureAsyncFunction } = importModule('utils');

const setStackAxis = {
  'horizontal': G.WidgetStack.prototype.layoutHorizontally,
  'vertical': G.WidgetStack.prototype.layoutVertically,
};

const setStackAlignment = {
  'top': G.WidgetStack.prototype.topAlignContent,
  'center': G.WidgetStack.prototype.centerAlignContent,
  'bottom': G.WidgetStack.prototype.bottomAlignContent,
};

const setTextAlignment = {
  'left': G.WidgetText.prototype.leftAlignText,
  'center': G.WidgetText.prototype.centerAlignText,
  'right': G.WidgetText.prototype.rightAlignText,
};

const setDateAlignment = {
  'left': G.WidgetDate.prototype.leftAlignText,
  'center': G.WidgetDate.prototype.centerAlignText,
  'right': G.WidgetDate.prototype.rightAlignText,
};

const setDateStyle = {
  'time': G.WidgetDate.prototype.applyTimeStyle,
  'date': G.WidgetDate.prototype.applyDateStyle,
  'relative': G.WidgetDate.prototype.applyRelativeStyle,
  'offset': G.WidgetDate.prototype.applyOffsetStyle,
  'timer': G.WidgetDate.prototype.applyTimerStyle,
};

const resolve = {
  addStack(axis = 'horizontal', alignment = 'top', callback) {
    if (typeof axis === 'function') {
      callback = axis
      axis = 'horizontal';
      alignment = 'top';
    } else if (typeof alignment === 'function') {
      callback = alignment
      axis = (axis in setStackAxis) ? axis : 'horizontal';
      alignment = (alignment in setStackAlignment) ? alignment : 'top';
    }
    return [axis, alignment, callback];
  },

  setPadding(top, leading, bottom, trailing) {
    if (arguments.length === 1) leading = bottom = trailing = top;
    return [top, leading, bottom, trailing];
  }
}

const Widget = {
  addStack(...parameters) {
    let [axis, alignment, callback] = resolve.addStack(...parameters);

    const widget = override(this.base.addStack(), Widget);
    setStackAxis[axis].call(widget);
    setStackAlignment[alignment].call(widget);

    if (typeof callback === 'function') callback(widget);
    return widget;
  },

  async addStackAsync(...parameters) {
    let [axis, alignment, callback] = resolve.addStack(...parameters);
    const widget = this.addStack(axis, alignment);

    if (typeof callback === 'function') {
      callback = ensureAsyncFunction(callback);
      await callback(widget);
    }
    return widget;
  },

  addText(text, options = {}) {
    const widget = this.base.addText(text);
    if (options.alignment !== undefined) setTextAlignment[options.alignment].call(widget);
    if (options.color !== undefined) widget.textColor = options.color;
    if (options.font !== undefined) widget.font = options.font;
    if (options.shadowColor !== undefined) widget.shadowColor = options.shadowColor;
    if (options.shadowRadius !== undefined) widget.shadowRadius = options.shadowRadius;
    if (options.shadowOffset !== undefined) widget.shadowOffset = options.shadowOffset;

    return widget;
  },

  addDate(date, options = {}) {
    const widget = this.base.addDate(date);
    if (options.alignment !== undefined) setDateAlignment[options.alignment].call(widget);
    if (options.style !== undefined) setDateStyle[options.style].call(widget);
    if (options.color !== undefined) widget.textColor = options.color;
    if (options.font !== undefined) widget.font = options.font;

    return widget;
  },

  setPadding(...parameters) {
    let [top, leading, bottom, trailing] = resolve.setPadding(...parameters);
    this.base.setPadding(top, leading, bottom, trailing);
  },
};

module.exports = {
  createWidget() {
    return override(new G.ListWidget(), Widget);
  }
};