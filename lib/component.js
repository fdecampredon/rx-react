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

defineProps(Component.prototype, {
  constructor: Component,
  
  componentWillMount: function () {
    StateStreamMixin.componentWillMount.call(this);
  },
  componentWillReceiveProps: function (nextProps) {
    PropsMixin.componentWillReceiveProps.call(this, nextProps);
  },
  componentWillUnmount: function () {
    PropsMixin.componentWillUnmount.call(this);
    StateStreamMixin.componentWillUnmount.call(this);
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
