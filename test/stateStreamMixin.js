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
var StateStreamMixin = require('../').StateStreamMixin;
var Rx = require('rx');
var sinon = require('sinon');



test('StateStreamMixin', function (t) {
  
  t.test('setup', function (t) {
    t.end();
  });

  
  t.test('errors', function (t) {
    
    var Component = React.createClass({
      displayName: 'Component',
      mixins: [StateStreamMixin],
      render: function () {
        return null;
      }
    });
    
    t.throws(
      function () {
        testUtils.render(React.createElement(Component));
      }, 
      /Component use the StateStreamMixin it should provide a 'getStateStream' function/,
      'it should throw an error if getStateStream is not defined'
    );
    
    
    Component = React.createClass({
      displayName: 'Component',
      mixins: [StateStreamMixin],
      getStateStream: function () {
        return { hello: 'string'};
      },
      render: function () {
        return null;
      }
    });
    
    t.throws(
      function () {
        testUtils.render(React.createElement(Component));
      }, 
      /'Component.getStateStream' should return an Rx.Observable, given : \[object Object\]/,
      'it should throw an error if getStateStream does not return an observable'
    );
    
    Component = React.createClass({
      displayName: 'Component',
      mixins: [StateStreamMixin],
      getStateStream: function () {
        return Rx.Observable.of(1);
      },
      render: function () {
        return null;
      }
    });
    
    t.throws(
      function () {
        testUtils.render(React.createElement(Component));
      }, 
      /The observable returned by 'Component.getStateStream' should publish Objects or null given : 1/,
      'it should throw an error if the Observable returned by getStateStream does not not resolve with an object or null'
    );
    
    t.end();
  
  });
  
  t.test('behavior', function (t) {
    var stateStream = new Rx.BehaviorSubject({ foo: 'bar'});
    var getStateSteamSpy = sinon.spy(function () {
      return stateStream;
    });
    var Component = React.createClass({
      displayName: 'Component',
      mixins: [StateStreamMixin],
      getStateStream: getStateSteamSpy,
      render: function () {
        return null;
      }
    });
    
    var component = testUtils.render(React.createElement(Component));
    
    t.ok(getStateSteamSpy.called, 'it should have called getStateStreamSpy');
    
    t.deepEquals(component.state, { foo: 'bar'}, 'state should have been merged with the value of stateStream');
    
    stateStream.onNext({hello: 'world'});
    
    t.deepEquals(component.state, { foo: 'bar', hello: 'world'}, 'state should have been merged with the new value of stateStream');
    
    testUtils.unmount();
    
    t.notOk(stateStream.hasObservers(), 'the subscrition to stateStream should have been cleaned after that the component has been unmounted ');
    
    t.end();
  });
  
  
  t.test('initialState', function (t) {
    var stateStream = Rx.Observable.of({ foo: 'bar'});
    
    var fakeComponent = {
      setState: sinon.spy(),
      getStateStream: function () {
        return stateStream;
      }
    };
    
    t.deepEquals({ foo: 'bar'}, StateStreamMixin.getInitialState.call(fakeComponent), 
                 'if the stateStream resolve synchronously the getInitialState function should return the value of the stream');
    
    t.notOk(fakeComponent.setState.called, 'the setState Method should not have been called during the getInitialState execution');
    
    stateStream = Rx.Observable.interval(1000).map(function () {
      return {};
    });
    
    
    t.equals(null, StateStreamMixin.getInitialState.call(fakeComponent), 
                 'if the stateStream does not resolve synchronously the getInitialState function should return null');
    fakeComponent.__stateSubscription.dispose();
    t.end();
  });
  
  t.test('teardown', function (t) {
    t.end();
  });

});
