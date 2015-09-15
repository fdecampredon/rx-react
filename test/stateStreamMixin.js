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
var cleanAllSubscriptions = require('../').cleanAllSubscriptions;
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
  
  t.test('cleanAllSubscriptions', function (t) {
    var stateStream = new Rx.BehaviorSubject({ foo: 'bar'});
    var Component = React.createClass({
      displayName: 'Component',
      mixins: [StateStreamMixin],
      getStateStream: function () {
        return stateStream;
      },
      render: function () {
        return null;
      }
    });
    
    var component = testUtils.render(React.createElement(Component));
    cleanAllSubscriptions();
    stateStream.onNext({ hello: 'world'});
    t.deepEquals(component.state, { foo: 'bar'}, 'the state should not been bound anymore to stateStream after a call to `cleanAllSubscriptions`');
    t.notOk(stateStream.hasObservers(), 'the subscrition to stateStream should have been cleaned after a call tp `cleanAllSubscriptions` ');
    t.end();
  });
  

});
