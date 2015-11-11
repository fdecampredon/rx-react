'use strict';

var React = require('react');
var StateStreamMixin = require('./stateStreamMixin').StateStreamMixin;
var PropsMixin = require('./propsMixin');
var LifecycleMixin = require('./lifecycleMixin');
var assign = require('react/lib/Object.assign');
var invariant = require('fbjs/lib/invariant');


function rxComponent(specFactory, options, Component) {
  if (!options) {
    options = {};
  }
  
  var withRef = (
    typeof options.withRef !== 'undefined' ? 
      options.withRef : 
      false
  ); 
  var needPropsStream = (
    typeof options.needPropsStream !== 'undefined' ? 
      options.needPropsStream : 
      specFactory.length > 0
  );
  var needLifecycle = (
    typeof options.needLifecycle !== 'undefined' ? 
      options.needLifecycle : 
      specFactory.length > 1
  );
  
  var mixins = [];
  if (needPropsStream) {
    mixins.push(PropsMixin);
  }
  if (needLifecycle) {
    mixins.push(LifecycleMixin);
  }
  mixins.push(StateStreamMixin);
  
  var componentFactory = function (Component) {
    var displayName = 'RxComponentContainer(' + (Component.displayName || Component.name || 'UnknownComponent') + ')';
    
    return React.createClass({
      mixins: mixins,
      displayName: displayName,

      componentWillMount: function () {
        this._observable = specFactory.call(this, this.propsStream, this.lifecycle);
      },

      getStateStream: function () {
        return this._observable.map(function (value) {
          return { childProps: value };
        });
      },

      getWrappedInstance: function () {
        invariant(withRef,
          'To access the wrapped instance, you need to specify ' +
          '{ withRef: true } as the fourth argument of the RxComponent() call.'
        );

        return this.refs.wrappedInstance;
      },

      shouldComponentUpdate: function (nextProps, nextState) {
        return this.state.childProps !== nextState.childProps;
      },

      render: function () {
        var ref = withRef ? 'wrappedInstance' : null;
        return React.createClass(Component, assign(this.state.childProps, { ref: ref }));
      }
    });
  };
  
  return (
    typeof Component !== 'undefined' ? 
      componentFactory(Component) : 
      componentFactory
  );
}

module.exports = rxComponent;
