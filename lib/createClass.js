var React = require('react/addons');
var shallowEqual = require('react/lib/shallowEqual');
var Rx = require('rx');
var waitForStream = require('./waitForStream');


var subscriptions = [];

function defaultShouldComponentUpdate(nextProps, nextState) {
  return !shallowEqual(this.props, nextProps) ||
    !shallowEqual(this.state, nextState);
}


function initComponent(comp, spec) {
  comp.__lifecycle = {
    componentWillMount: new Rx.Subject(),
    componentDidMount: new Rx.Subject(),
    componentWillReceiveProps: new Rx.Subject(),
    componentWillUpdate: new Rx.Subject(),
    componentDidUpdate: new Rx.Subject(),
    componentWillUnmount: new Rx.Subject(),
  };

  var state;
  if (spec.getInitialState) {
    state = spec.getInitialState(comp.props);
  }
  if (spec.getStateStream) {
    var stateStream = spec.getStateStream();
    var initializing = true;
    comp.__stateSubscription = stateStream.subscribe(function (val) {
      if (!state) {
        state = val;
      }
      if (!initializing) {
        comp.setState(val);
      }
    });
    if (!state) {
      waitForStream(stateStream);
    }
    initializing = false;

    subscriptions.push(comp.__stateSubscription);
  }

  if (spec.init) {
    var lifecycle = Object.keys(comp.__lifecycle).reduce(function (lifecycle, prop) {
      if (prop !== 'componentWillUnmount') {
        lifecycle[prop] = comp.__lifecycle[prop].takeUntil(comp.__lifecycle.componentWillUnmount);
      } else {
        lifecycle[prop] = comp.__lifecycle[prop].take(1);
      }
      return lifecycle;
    }, {});



    comp.__rxEventsHandler = spec.init(comp, lifecycle);
  }

  return state || {};
}


function cleanComponent(comp) {
  Object.keys(comp.__lifecycle).forEach(function (key) {
    comp.__lifecycle[key].onCompleted();
  });

  if (comp.__stateSubscription) {
    var index = subscriptions.indexOf(comp.__stateSubscription);
    if (index !== -1) {
      subscriptions.splice(index, 1);
    }
    comp.__stateSubscription.dispose();
  }
}




module.exports = function createClass(spec) {
  var render = spec.render;


  var reactSpec = {

    getInitialState: function () {
      return initComponent(this, spec);
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
      cleanComponent(this);
    },


    render: function () {
      return render(this.props, this.state, this.__rxEventsHandler);
    }
  };

  if (spec.shouldComponentUpdate) {
    reactSpec.shouldComponentUpdate = function (nextProps, nextState) {
      return spec.shouldComponentUpdate({
        props: this.props,
        state: this.state
      }, {
          nextProps: nextProps,
          nextState: nextState
        });
    };
  } else if (!spec.mixins ||
    !spec.mixins.some(function (mixin) {
      return typeof mixin.shouldComponentUpdate === 'function';
    })
    ) {
    reactSpec.shouldComponentUpdate = defaultShouldComponentUpdate;
  }


  ['getDefaultProps', 'mixins', 'propTypes', 'statics', 'displayName'].forEach(function (key) {
    if (spec.hasOwnProperty(key)) {
      reactSpec[key] = spec[key];
    }
  });


  return React.createClass(reactSpec);
};

Object.defineProperty(module.exports, 'cleanAllSubscriptions', {
  value: function () {
    subscriptions.forEach(function (subscription) {
      subscription.dispose();
    });
  }
});
