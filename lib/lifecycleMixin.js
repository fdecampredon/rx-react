
var Rx = require('rx');

/**
 * A Mixin that exposes lifecycle as RxJS Observables
 */
var LifecycleMixin = {
  getInitialState: function () {
    this.__lifecycle = {
      componentWillMount: new Rx.Subject(),
      componentDidMount: new Rx.Subject(),
      componentWillReceiveProps: new Rx.Subject(),
      componentWillUpdate: new Rx.Subject(),
      componentDidUpdate: new Rx.Subject(),
      componentWillUnmount: new Rx.Subject(),
    };
    
    this.lifecycle = Object.keys(this.__lifecycle).reduce(function (lifecycle, prop) {
      if (prop !== 'componentWillUnmount') {
        lifecycle[prop] = this.__lifecycle[prop].takeUntil(this.__lifecycle.componentWillUnmount);
      } else {
        lifecycle[prop] = this.__lifecycle[prop].take(1);
      }
      return lifecycle;
    }.bind(this), {});
    
    return null;
  },
  
  componentWillMount: function () {
    this.__lifecycle.componentWillMount.onNext();
  },
  componentDidMount: function () {
    this.__lifecycle.componentDidMount.onNext();
  },
  componentWillReceiveProps: function (nextProps) {
    this.__lifecycle.componentWillReceiveProps.onNext(nextProps);
  },
  componentWillUpdate: function (nextProps, nextState) {
    this.__lifecycle.componentWillUpdate.onNext({ nextProps: nextProps, nextState: nextState });
  },
  componentDidUpdate: function (prevProps, prevState) {
    this.__lifecycle.componentDidUpdate.onNext({ prevProps: prevProps, prevState: prevState });
  },
  componentWillUnmount: function () {
    this.__lifecycle.componentWillUnmount.onNext();
  },
};

module.exports = LifecycleMixin;