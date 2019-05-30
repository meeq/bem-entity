// See index-test.js for usage

function BemEntity(blockName, preferredMode) {
  // Handle factory usage by calling constructor
  if (!(this instanceof BemEntity)) {
    return new BemEntity(blockName, preferredMode);
  }
  this.blockName = blockName;
  this.preferredMode = preferredMode || BemEntity.CLASSNAME_MODE;
}

// joinClasses mode types
BemEntity.CLASSNAME_MODE = 'className'; // Space-separated
BemEntity.SELECTOR_MODE = 'selector'; // Dot-separated with leading dot

// BEM token separators: http://getbem.com/naming/
BemEntity.ELEMENT_TOKEN_SEPARATOR = '__';
BemEntity.MODIFIER_TOKEN_SEPARATOR = '--';
BemEntity.MODIFIER_KEY_VALUE_SEPARATOR = '-';

// Static methods

BemEntity.block = function (blockName, modifiers, mode) {
  return BemEntity.joinClasses(
    BemEntity.composeModifiers(blockName, modifiers),
    mode
  );
};

BemEntity.element = function (blockName, elementName, modifiers, mode) {
  return BemEntity.joinClasses(
    BemEntity.composeModifiers(
      BemEntity.composeElement(blockName, elementName),
      modifiers
    ),
    mode
  );
};

BemEntity.blockClassName = function (blockName, modifiers) {
  return BemEntity.block(
    blockName, modifiers,
    BemEntity.CLASSNAME_MODE
  );
};

BemEntity.blockSelector = function (blockName, modifiers) {
  return BemEntity.block(
    blockName, modifiers,
    BemEntity.SELECTOR_MODE
  );
};

BemEntity.elementClassName = function (blockName, elementName, modifiers) {
  return BemEntity.element(
    blockName, elementName, modifiers,
    BemEntity.CLASSNAME_MODE
  );
};

BemEntity.elementSelector = function (blockName, elementName, modifiers) {
  return BemEntity.element(
    blockName, elementName, modifiers,
    BemEntity.SELECTOR_MODE
  );
};

// Instance methods

BemEntity.prototype.block = function (modifiers) {
  return BemEntity.block(
    this.blockName, modifiers,
    this.preferredMode
  );
};

BemEntity.prototype.element = function (elementName, modifiers) {
  return BemEntity.element(
    this.blockName, elementName, modifiers,
    this.preferredMode
  );
};

BemEntity.prototype.blockClassName = function (modifiers) {
  return BemEntity.blockClassName(this.blockName, modifiers);
};

BemEntity.prototype.blockSelector = function (modifiers) {
  return BemEntity.blockSelector(this.blockName, modifiers);
};

BemEntity.prototype.elementClassName = function (elementName, modifiers) {
  return BemEntity.elementClassName(this.blockName, elementName, modifiers);
};

BemEntity.prototype.elementSelector = function (elementName, modifiers) {
  return BemEntity.elementSelector(this.blockName, elementName, modifiers);
};

// Utility API

BemEntity.joinClasses = function (classes, mode) {
  if (mode === BemEntity.CLASSNAME_MODE) {
    return classes.join(' ');
  }
  if (mode === BemEntity.SELECTOR_MODE) {
    if (!classes.length) {
      return '';
    }
    return '.' + classes.join('.');
  }
  throw Error('Unexpected BemEntity.joinClasses mode: ' + mode);
}

BemEntity.composeElement = function (blockName, elementName) {
  return blockName + BemEntity.ELEMENT_TOKEN_SEPARATOR + elementName;
}

BemEntity.composeModifier = function (baseName, modifier) {
  return baseName + BemEntity.MODIFIER_TOKEN_SEPARATOR + modifier;
}

BemEntity.composeModifiers = function (baseName, modifiers) {
  var affirmativeModifiers = BemEntity.parseModifiers(modifiers);
  if (affirmativeModifiers.length) {
    var modifiersWithBase = affirmativeModifiers.map(function (modifier) {
      return BemEntity.composeModifier(baseName, modifier);
    });
    return [baseName].concat(modifiersWithBase);
  }
  return [baseName];
}

BemEntity.parseModifiers = function (modifiers) {
  if (isString(modifiers)) {
    // Convert modifiers string into array
    return BemEntity.parseModifiers(modifiers.split(' '));
  }
  if (isObject(modifiers)) {
    // Convert modifiers object into array
    return BemEntity.parseModifiers(
      BemEntity.squashModifiersObject(modifiers)
    );
  }
  if (isArray(modifiers)) {
    // Prune negatory modifiers (except zero)
    return modifiers.filter(function (mod) {
      return mod === 0 || !!mod;
    });
  }
  return [];
}

BemEntity.squashModifiersObject = function (modifiers) {
  // Convert modifiers object into array of 'key'/'key-value' strings
  return Object.keys(modifiers).map(function (key) {
    var value = modifiers[key];
    if (value === false || value == null) {
      return null;
    }
    if (value === true || value === '') {
      return key;
    }
    return key + BemEntity.MODIFIER_KEY_VALUE_SEPARATOR + value;
  });
}

// Type-checking utilities

function isString(value) {
  return value && (typeof value === 'string' || value.constructor === String);
}

function isObject(value) {
  return value && typeof value === 'object' && value.constructor === Object;
}

function isArray(value) {
  return value && typeof value === 'object' && value.constructor === Array;
}

module.exports = BemEntity;
