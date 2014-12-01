var invariant     = require('./invariant');
var waitForStream = require('./waitForStream');


var stateSubscriptions = [];

var StateStreamMixin = {
  getInitialState: function () {
    invariant(
      typeof this.getStateStream === 'function',
      'When using the StateStreamMixin you must provide a `getStateStream` function in spec'
    );
    
    var stateStream = this.getStateStream(this.props);
    var initializing = true;
    var streamResolved = false;
    var initialState = null;
    
    this.__stateSubscription = stateStream.subscribe(function (val) {
      initialState = val;
      streamResolved = true;
      if (!initializing) {
        this.setState(val);
      }
    }.bind(this));
    
    if (!streamResolved) {
      waitForStream(stateStream);
    }
    
    initializing = false;

    stateSubscriptions.push(this.__stateSubscription);
    
    return initialState;
  }
};


module.exports = StateStreamMixin;