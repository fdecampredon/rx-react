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

var testUtils = require('./testUtils');
var test = require('tape');
var React = require('react');
var Rx = require('rx');
var assign = require('react/lib/Object.assign');
var RxReactComponent = require('../').Component;
var sinon = require('sinon');

test('Component', function (t) {
  function renderComponent(spec, props) {
    function Component() {
      RxReactComponent.apply(this, arguments);
    }
    Component.prototype = Object.create(RxReactComponent.prototype);
    assign(Component.prototype, spec);
    Component.prototype.constructor = Component;
    Component.__proto__ = RxReactComponent;
    return testUtils.render(React.createElement(Component, props));
  }
 
  function isObservable(obj) {
    return obj && typeof obj.subscribe === 'function';
  }
  
  t.test('extends React Component', function (t) {
    var component = renderComponent({
      render: function () {
        return null;
      }
    });
    
    t.ok(component instanceof React.Component, 'RxReact Components should extends React.Component');
    t.end();
  });
  
  t.test('propsStream', function (t) {
    var props = { foo: 'bar'};
    var props2 = { hello: 'world'};
    var spy = sinon.spy();
    var component = renderComponent({
      render: function () {
        return null;
      }
    }, props);
    
    t.ok(isObservable(component.propsStream), 'RxReact Components should expose propsStream observable');
    component.propsStream.subscribe(spy);
    testUtils.render(React.createElement(component.constructor, props2));
    t.ok(spy.calledWith(props) && spy.calledWith(props2), 'propsStream should be bounds to props');
    t.end();
  });
  
  t.test('stateStream', function (t) {
    var state = { foo: 'bar'};
    var component = renderComponent({
      render: function () {
        return null;
      },
      getStateStream: function () {
        return Rx.Observable.of(state);
      }
    });
    
    t.deepEquals(component.state, state, 'state should be bounds to the observable returned by `getStateStream` if implemented');
    t.end();
  });
});
