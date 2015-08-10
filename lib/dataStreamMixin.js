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

var shallowEqual = require('react-pure-render/shallowEqual');
var assign = require('react/lib/Object.assign');
var utils = require('./utils');
var isObservable = utils.isObservable;
var invariant = utils.invariant;

var dataSubscriptions = [];


/**
 * A Mixin for sideway dataLoading
 * 
 * var List = React.createClass({
 *   mixins: [PropsStreamMixin, DataStreamMixin],
 *   getDataStream: function() {
 *     return myExternalObservableDataSource;
 *   },
 *   render: function() {
 *     var items = this.data? this.data.items : 0;
 *     return (
 *       <il>{items.map(function (item) { return <li>{item}</li>; })}</ul>
 *     );
 *   }
 * });
 */
var DataStreamMixin = {
  
  getInitialState: function () {
    return null;
  },
  
  componentWillMount: function () {
    
    var displayName = this.constructor.displayName || this.constructor.name || '';
    invariant(
      typeof this.getDataStream === 'function',
      '%s use the DataStreamMixin it should provide a \'getStateStream\' function',
      displayName
    );
    
   
    var dataStream = this.getDataStream();
    
    invariant(
      isObservable(dataStream),
      '\'%s.getDataStream\' should return an Rx.Observable, given : %s', 
      displayName, dataStream
    );
    
    var self = this;
    this.__dataSubscription = dataStream.subscribe(function (val) {
      invariant(
        typeof val === 'object',
        'The observable returned by \'%s.getDataStream\' should publish Objects or null given : %s', 
        displayName, val
      );
      
      var newData = assign({}, self.data, val);
      var shouldUpdate = (
        (typeof self.shouldComponentUpdateAfterDataChange === 'function' && 
          self.shouldComponentUpdateAfterDataChange(this.data, newData)) ||
        !shallowEqual(this.data, newData)
      );
      
      self.data = newData;
      if (shouldUpdate) {
        self.forceUpdate();
      }
    });

    dataSubscriptions.push(this.__dataSubscription);
  },
  
  componentWillUnmount: function () {
    if (this.__dataSubscription) {
      this.__DataSubscription.dispose();
      var index = dataSubscriptions.indexOf(this.__dataSubscription);
      if (index !== -1) {
        dataSubscriptions.splice(index, 1);
      }
    }
  }
};


module.exports = {
  DataStreamMixin: DataStreamMixin,
  cleanAllSubscriptions: function () {
    dataSubscriptions.forEach(function (subscription) {
      subscription.dispose();
    });
    dataSubscriptions = [];
  }
};
