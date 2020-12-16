const G = this;
const override = importModule('override');

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

const Widget = {
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
    
    const widget = override(this.base.addStack(), Widget);
    setStackAxis[axis].call(widget);
    setStackAlignment[alignment].call(widget);
  
    if (typeof callback === 'function') callback(widget);
    return widget;
  },

  addText(text, options = {}) {
    const widget = this.base.addText(text);
    if (options.alignment !== undefined) setTextAlignment[options.alignment].call(widget);
    if (options.color !== undefined) widget.textColor = options.color;
    if (options.font !== undefined) widget.font = options.font;
  
    return widget;
  },

  setPadding(top, leading, bottom, trailing) {
    if (arguments.length === 1) {
      leading = bottom = trailing = top;
    }
    
    this.base.setPadding(top, leading, bottom, trailing);
  },
};

module.exports = {
  createWidget() {
    return override(new G.ListWidget(), Widget);
  }
};