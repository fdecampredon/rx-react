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

var test = require('tape');
var FuncSubject = require('../').FuncSubject;
var Rx = require('rx');
var sinon = require('sinon');

test('FuncSubject', function (t) {
  
  function hasAllProperties(objA, objB) {
    var key;
    for (key in objB) {
      if (objA[key] !== objB[key]) {
        return false;
      }
    }
    return true;
  }
  
  t.test('basic', function (t) {
    t.plan(2);
    
    t.ok(hasAllProperties(FuncSubject.create(), Rx.Subject.prototype), 'it should create an Rx Subject');

    var value = {};
    var eventHandler = FuncSubject.create();

    eventHandler.subscribe(function (val) {
      t.equals(val, value, 'calling the handler as a function should invoque the \'onNext\' method ');
    });

    eventHandler(value);
  });
  
   
  t.test('behavior', function (t) {
    t.plan(3);
    t.ok(hasAllProperties(FuncSubject.behavior(), Rx.BehaviorSubject.prototype), 'it should create an Rx BehaviorSubject');

    var value = {};
    var eventHandler = FuncSubject.behavior(value);
    t.equals(eventHandler.getValue(), value, 'it should hold the initial value');
    
    var value2 = {};
    eventHandler(value2);
    eventHandler.subscribe(function (val) {
      t.equals(val, value2, 'it should hold the last value called with');
    });
  });
  
  t.test('transform function', function (t) {
    t.plan(2);
    
    var value = {};
    var value2 = {};
    
    var spy = sinon.spy(function () {
      return value2;
    });
    
    var eventHandler = FuncSubject.create(spy);
    
    eventHandler(value);
    t.ok(spy.called, 'it should call the map function event if the observable holds no subscription');
    
    eventHandler.subscribe(function (val) {
      t.equals(val, value2, 'calling the handler as a function should invoque the \'onNext\' method with mapped value');
    });

    eventHandler(value);
  });
});

