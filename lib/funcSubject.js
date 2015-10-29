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


var Rx = require('rx');


/**
 * Create a simple 'function' that is also a RxJS Subject. 
 * Calling the function will be equivalent to calling
 * the 'onNext' method.
 * 
 * example:
 * 
 * var eventHandler = FuncSubject.create();
 * eventHandler.subscribe(function (val) {
 *   console.log(val);
 * });
 * 
 * eventHandler('hello'); // log hello
 * eventHandler.onNext('world'); // log world
 * 
 */
function create(mapFunction) {
  function subject(value) {
    if (typeof mapFunction === 'function') {
      value = mapFunction.apply(undefined, arguments);
    } else if (typeof mapFunction !== 'undefined') {
      value = mapFunction;
    }
    subject.onNext(value);
  }
  
  for (var key in Rx.Subject.prototype) {
    subject[key] = Rx.Subject.prototype[key];
  }

  Rx.Subject.call(subject);

  return subject;
}

exports.create = create;


/**
 * Create a simple 'function' that is also a RxJS BehaviorSubject. 
 * Calling the function will be equivalent to calling
 * the 'onNext' method.
 * 
 * example:
 * 
 * var eventHandler = FuncSubject.behavior('hello');
 * eventHandler.subscribe(function (val) {
 *   console.log(val);
 * }); // log hello
 * 
 * eventHandler.onNext('world'); // log world
 * 
 * eventHandler.subscribe(function (val) {
 *   console.log(val);
 * }); // log world
 * 
 */
function behavior(initialValue, mapFunction) {
  function subject(value) {
    if (typeof mapFunction === 'function') {
      value = mapFunction.apply(undefined, arguments);
    } else if (typeof mapFunction !== 'undefined') {
      value = mapFunction;
    }
    subject.onNext(value);
  }
  
  for (var key in Rx.BehaviorSubject.prototype) {
    subject[key] = Rx.BehaviorSubject.prototype[key];
  }

  Rx.BehaviorSubject.call(subject, initialValue);

  return subject;
}

exports.behavior = behavior;
