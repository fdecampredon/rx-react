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

var utils = require('./utils');
var isObservable = utils.isObservable;
var invariant = utils.invariant;

var stateSubscriptions = [];


/**
 * A Mixin for explicitly boudn the state of a component to an RxJS Observable,
 * subscrition will be disposed on unmount.
 * 
 * var Timer = React.createClass({
 *   mixins: [StateStreamMixin],
 *   getStateStream: function() {
 *     return Rx.Observable.interval(1000).map(function (interval) {
 *       return {
 *         secondsElapsed: interval
 *       };
 *     });
 *   },
 *   render: function(props, state) {
 *     var secondsElapsed = this.state? this.state.secondsElapsed : 0;
 *     return (
 *       <div>Seconds Elapsed: {secondsElapsed}</div>
 *     );
 *   }
 * });
 */
var StateStreamMixin = {
  componentWillMount: function () {
    
    var displayName = this.constructor.displayName || this.constructor.name || '';
    invariant(
      typeof this.getStateStream === 'function',
      '%s use the StateStreamMixin it should provide a \'getStateStream\' function',
      displayName
    );
    
    this.stateStream = this.getStateStream(this.props);
    
    invariant(
      isObservable(this.stateStream),
      '\'%s.getStateStream\' should return an Rx.Observable, given : %s', 
      displayName, this.stateStream
    );
    
    var self = this;
    this.__stateSubscription = this.stateStream.subscribe(function (val) {
      invariant(
        typeof val === 'object',
        'The observable returned by \'%s.getStateStream\' should publish Objects or null given : %s', 
        displayName, val
      );
      
      self.setState(val);
    });

    stateSubscriptions.push(this.__stateSubscription);
  },
  
  componentWillUnmount: function () {
    if (this.__stateSubscription) {
      this.__stateSubscription.dispose();
      var index = stateSubscriptions.indexOf(this.__stateSubscription);
      if (index !== -1) {
        stateSubscriptions.splice(index, 1);
      }
    }
  }
};


module.exports = {
  StateStreamMixin: StateStreamMixin,
  cleanAllSubscriptions: function () {
    stateSubscriptions.forEach(function (subscription) {
      subscription.dispose();
    });
    stateSubscriptions = [];
  }
};
