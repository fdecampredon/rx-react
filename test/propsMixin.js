
var testUtils               = require('./testUtils');
var test                    = require('tape');
var React                   = require('react');
var PropsMixin              = require('../').PropsMixin;
var sinon                   = require('sinon');


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
