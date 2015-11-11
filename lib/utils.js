'use strict';
var assign = require('react/lib/Object.assign');

function inherits(Class, BaseClass, methods) {
  Class.prototype = Object.create(BaseClass.prototype);

  if (typeof Object.setPrototypeOf === 'function') {
    Object.setPrototypeOf(Class, BaseClass);
  } else if (Object.__proto__) {
    Class.__proto__ = BaseClass;
  } else {
    assign(Class, BaseClass);
  }
  
  methods = assign({ constructor: BaseClass }, methods);
  
  for (var prop in methods) {
    if (methods.hasOwnProperty(prop)) {
      Object.defineProperty(Class.prototype, prop, {
        value: methods[prop],
        enumerable: false,
        configurable: true,
        writable: true
      });
    }
  } 
}

exports.inherits = inherits;
