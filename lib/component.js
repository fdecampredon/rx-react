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
var LifecycleMixin = require('./lifecycleMixin');
var StateStreamMixin = require('./stateStreamMixin').StateStreamMixin;
var PropsMixin = require('./propsMixin');


function assign(target, spec) {
  for (var key in spec) {
    if (spec.hasOwnProperty(key)) {
      target[key] = spec[key];
    }
  }
}

function Component(props) {
  React.Component.call(this, props);
  LifecycleMixin.getInitialState.call(this);
  PropsMixin.getInitialState.call(this);
}

Component.prototype = Object.create(React.Component.prototype);

assign(Component.prototype, {
  constructor: Component,
  
  componentWillMount: function () {
    var state = StateStreamMixin.getInitialState.call(this);
    if (state) {
      this.setState(state);
    }
    LifecycleMixin.componentWillMount.call(this);
  },
  componentDidMount: function () {
    LifecycleMixin.componentDidMount.call(this);
  },
  componentWillReceiveProps: function (nextProps) {
    PropsMixin.componentWillReceiveProps.call(this, nextProps);
    LifecycleMixin.componentWillReceiveProps.call(this, nextProps);
  },
  componentWillUpdate: function (nextProps, nextState) {
    LifecycleMixin.componentWillUpdate.call(this, nextProps, nextState);
  },
  componentDidUpdate: function (prevProps, prevState) {
    LifecycleMixin.componentDidUpdate.call(this, prevProps, prevState);
  },
  componentWillUnmount: function () {
    LifecycleMixin.componentWillUnmount.call(this);
    PropsMixin.componentWillUnmount.call(this);
    StateStreamMixin.componentWillUnmount.call(this);
  }
});


module.exports = Component;
