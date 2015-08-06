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
var PropsMixin = require('../').PropsMixin;
var sinon = require('sinon');


test('PropsMixin', function (t) {
  
  var component;
  var onNextSpy = sinon.spy();
  var onCompleteSpy = sinon.spy();
  var props = { foo: 'bar' };
  
  var Component = React.createClass({
    mixins: [PropsMixin],
    componentWillMount: function () {
      this.propsStream.subscribe(onNextSpy, null, onCompleteSpy);
    },
    render: function () {
      return null;
    }
  });
 
  function isObservable(obj) {
    return obj && typeof obj.subscribe === 'function';
  }
  
  t.test('setup', function (t) {
    component = testUtils.render(React.createElement(Component, props));
    
    t.end();
  });

  
  t.test('propsStream object', function (t) {
    
    t.ok(isObservable(component.propsStream), 'it should expose a propsStream observable on the component');
    t.end();
  
  });
  
  t.test('propsStream observables behavior', function (t) {
    t.ok(onNextSpy.calledWith(props), 'onNext should have been called with initial props');
    
    var props2 = { prop: { foo: 'bar'} };
    
    
    component = testUtils.render(React.createElement(Component, props2));
    t.ok(onNextSpy.calledWith(props2), 'onNext should have been called with new props after rerender');
      
    
    t.notOk(onCompleteSpy.called, 'onComplete should not have been called before the component has been unmounted');
    testUtils.unmount();

    t.ok(onCompleteSpy.called, 'onComplete should have been called after the component has been unmounted');

    t.end();

  });
  
  
  t.test('teardown', function (t) {
    component = null;
    t.end();
  });

});
