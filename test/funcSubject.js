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
    
    var subject = FuncSubject.create();
    t.ok(hasAllProperties(subject, Rx.Subject.prototype), 'it should create an Rx Subject');


    subject.subscribe(function (val) {
      t.equals(val, 'foo', 'calling the handler as a function should invoque the \'onNext\' method ');
    });

    subject('foo');
  });
  
   
  t.test('behavior', function (t) {
    t.plan(3);    

    var subject = FuncSubject.behavior('foo');
    t.ok(hasAllProperties(subject, Rx.BehaviorSubject.prototype), 'it should create an Rx BehaviorSubject');

    t.equals(subject.getValue(), 'foo', 'it should hold the initial value');
    
    
    subject('a');
    subject('b');
    subject('c');
    subject.subscribe(function (val) {
      t.equals(val, 'c', 'it should hold the last value called with');
    });
  });
  
  t.test('async', function (t) {
    t.plan(2); 
    
    var subject = FuncSubject.async();
    t.ok(hasAllProperties(subject, Rx.AsyncSubject.psubjectrototype), 'it should create an Rx AsyncSubject');
    
    subject('a');
    subject('b');
    subject('c');
    subject.onCompleted();
    
    subject.subscribe(function (val) {
      t.equals(val, 'c', 'it should hold the last value before completion');
    });
   
  });
  
  
  t.test('replay', function (t) {
    t.plan(3);
    
    var subject = FuncSubject.replay(2);
    t.ok(hasAllProperties(subject, Rx.ReplaySubject.prototype), 'it should create an Rx ReplaySubject');
    
    subject('a');
    subject('b');
    subject('c');
    
    var spy = sinon.spy();
    subject.subscribe(spy);
    
    t.ok(
      spy.callCount === 2 &&
      spy.calledWith('b'),
      spy.calledWith('c'),
      'it should behave like a replay subject'
    );
    
    subject('d');
    
    t.ok(spy.callCount === 3 && spy.calledWith('d'), 'it should behave like a replay subject');
    
  });
  
  
  t.test('transform function', function (t) {
    t.plan(2);
    
    var value = {};
    var value2 = {};
    
    var spy = sinon.spy(function () {
      return value2;
    });
    
    var subject = FuncSubject.create(spy);
    
    subject(value, value2);
    t.ok(spy.calledWithExactly(value, value2), 'it should call the map function event if the observable holds no subscription');
    
    subject.subscribe(function (val) {
      t.equals(val, value2, 'calling the handler as a function should invoque the \'onNext\' method with mapped value');
    });

    subject(value);
  });
  
   
  t.test('factory', function (t) {
    t.plan(5);
    
    function ReplaceSubject(replaceCount, replaceValue) {
      Rx.Subject.call(this);
      this.replaceCount = replaceCount;
      this.replaceValue = replaceValue;
    }
    
    ReplaceSubject.prototype = Object.create(Rx.Subject.prototype);
    
    ReplaceSubject.prototype.onNext = function (val) {
      if (this.replaceCount) {
        this.replaceCount--;
        Rx.Subject.prototype.onNext.call(this, this.replaceValue);
      } else {
        Rx.Subject.prototype.onNext.call(this, val);
      }
    };
    
    var subject = FuncSubject.factory(ReplaceSubject, function (val, val1) { 
      return val + val1;
    }, 2, 'foo');
    
    t.ok(
      hasAllProperties(subject, ReplaceSubject.prototype), 
      'it should create an object similar to an instance of the class passed as argument'
    );
    t.equals(subject.replaceCount, 2, 'it should pass arguments to the consturctor of the subject');
    t.equals(subject.replaceValue, 'foo', 'it should pass arguments to the consturctor of the subject');
    
    var spy = sinon.spy();
    subject.subscribe(spy);
    subject(1, 2);
    subject(3, 4);
    subject(5, 6);
    
    t.ok(spy.callCount === 3);
    t.deepEquals(spy.args, [
      ['foo'],
      ['foo'],
      [11]
    ], 'it should behave like the subject class passed as parameter, and use the mapFunction if provided');
  });
});

