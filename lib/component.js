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

assign(Component.prototype,{
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
