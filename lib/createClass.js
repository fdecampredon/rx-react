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

var assign = require('react/lib/Object.assign');
var shouldPureComponentUpdate = require('react-pure-render/function');
var Component = require('./component');
var utils = require('./utils');
var isObservable = utils.isObservable;
var invariant = utils.invariant;

var LifecyleMethods = {
  componentWillMount: null,
  componentDidMount: null,
  componentWillReceiveProps: null,
  componentWillUpdate: null,
  componentDidUpdate: null,
  componentWillUnmount: null
};


function createClass(displayName, specFunction) {
  if (typeof displayName === 'function') {
    specFunction = displayName;
    displayName = specFunction.name;
  }
  
  displayName = displayName || 'RxReactComponent';
  
  invariant(
    typeof specFunction === 'function',
    '`RxReact.createClass(...)` should be called with a function as argument, given %s ',
    specFunction
  );
  
  return assign(function (props, context) {
    var result = Object.create(Component.prototype);
    Component.call(result, props, context);
    
    var spec = specFunction(result.propsStream, result, context);
    
    invariant(
      Object(spec) === spec, 
      '`RxReact.createClass(...)` the function defintition passed as argument should return and object, given %s', 
      spec
    );
    
    invariant(
      typeof spec.render === 'function',
      '`RxReact.createClass(...)` the object returned by the function defintition should contain a render method'
    );
    
    invariant(
      !spec.stateStream || isObservable(spec.stateStream),
      '`RxReact.createClass(...)` the `stateStream` property of the  object returned by the function definition should be an observable'
    );
    
    invariant(
      !spec.dataStream || isObservable(spec.dataStream),
      '`RxReact.createClass(...)` the `stateStream` property of the  object returned by the function definition should be an observable'
    );
    
    result.render = function () {
      return spec.render({ props: this.props, state: this.state });
    };
    
    if (spec.stateStream) {
      result.getStateStream = function () {
        return spec.stateStream;
      };
    }
    if (spec.dataStream) {
      result.getDataStream = function () {
        return spec.dataStream;
      };
    }
    
    
    for (var method in LifecyleMethods) {
      if (LifecyleMethods.hasOwnProperty(method) && spec.hasOwnProperty(method)) {
        if (Component.prototype.hasOwnProperty(method)) {
          result[method] = function () {
            return Component.prototype.apply(result, arguments);
          };
        } else {
          result[method] = spec[method];
        }
      }
    }
    
    if (spec.shouldComponentUpdate) {
      result.shouldComponentUpdate = function (nextProps, nextState) {
        spec.shouldComponentUpdate({props: this.props, state: this.state}, {props: nextProps, state: nextState});
      };
    } else {
      result.shouldComponentUpdate = shouldPureComponentUpdate;
    }
    
    if (spec.shouldComponentUpdateAfterDataChange) {
      result.shouldComponentUpdateAfterDataChange = spec.shouldComponentUpdateAfterDataChange;
    }
    
    return result;
  }, { displayName: displayName});
}

module.exports = createClass; 
