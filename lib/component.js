//   Copyright 2014-2015 François de Campredon
//
//   Licensed under the Apache License, Version 2.0 (the "License");
//   you may not use this file except in compliance with the License.
//   You may obtain a copy of the License at
//
//       http://www.apache.org/licenses/LICENSE-2.0
//
//   Unless required by applicable law or agreed to in writing, software
//   distributed under the License is distributed on an "AS IS" BASIS,
//   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
//   See the License for the specific language governing permissions and
//   limitations under the License.

'use strict';

var React = require('react');
var StateStreamMixin = require('./stateStreamMixin').StateStreamMixin;
var PropsMixin = require('./propsMixin');
var assign = require('react/lib/Object.assign');


function defineProps(target, properties) {
  for (var prop in properties) {
    if (properties.hasOwnProperty(prop)) {
      Object.defineProperty(target, prop, {
        value: properties[prop],
        enumerable: false,
        configurable: true,
        writable: true
      });
    }
  }
}

function Component(props, context) {
  React.Component.call(this, props, context);
  PropsMixin.getInitialState.call(this);
}

Component.prototype = Object.create(React.Component.prototype);

if (typeof Object.setPrototypeOf === 'function') {
  Object.setPrototypeOf(Component, React.Component);
} else if (Object.__proto__) {
  Component.__proto__ = React.Component;
} else {
  assign(Component, React.Component);
}

defineProps(Component.prototype, {
  constructor: Component,
  
  componentWillMount: function () {
    if (typeof this.getStateStream === 'function') {
      StateStreamMixin.componentWillMount.call(this); 
    }
  },
  
  componentDidMount: function () {},
  
  componentWillReceiveProps: function (nextProps) {
    PropsMixin.componentWillReceiveProps.call(this, nextProps);
  },
  
  componentWillUpdate: function () {},
  
  componentDidUpdate: function () {},
  
  componentWillUnmount: function () {
    PropsMixin.componentWillUnmount.call(this);
    if (typeof this.getStateStream === 'function') {
      StateStreamMixin.componentWillUnmount.call(this);
    }
  }
});

if (process.NODE_ENV !== 'production') {
  
  var supportGetter = (function () {
    try {
      Object.defineProperty({}, 'prop', { 
        get: function () { 
          return true;
        }
      });
    } catch(e) {
      return false;
    }

    return true;
  }());
  
  if (supportGetter) {
    Object.defineProperty(Component.prototype, 'lifecycle', {
      get: function () {
        throw new Error('lifecycle Object is not accessible anymore in RxReact Components, ' +
         'use FuncSubject as lifecycle methods instead');
      }
    });
  }
}


module.exports = Component;
