var testUtils               = require('./testUtils');
var test                    = require('tape');
var React                   = require('react');
var LifecycleMixin          = require('../').LifecycleMixin;
var sinon                   = require('sinon');


test('LifecycleMixin', function (t) {
  
   
  var component;
  var lifecycleSpies;
  var state = {};
  
  var Component = React.createClass({
    mixins: [LifecycleMixin],
    getInitialState: function () {
      return state;
    },
    componentWillMount: function () {
      lifecycleSpies = Object.keys(this.lifecycle).reduce(function (spies, key) {
        spies[key] = {
          onNext: sinon.spy(),
          onError: sinon.spy(),
          onComplete: sinon.spy()
        };
        this.lifecycle[key].subscribe(spies[key].onNext, spies[key].onError, spies[key].onComplete);
        return spies;
      }.bind(this), {});
    },
    render: function () {
      return null;
    }
  });
 
  function isObservable(obj) {
    return obj && typeof obj.subscribe === 'function';
  }
  
  t.test('setup', function (t) {
    component = testUtils.render(React.createElement(Component));
    
    t.end();
  });

  
  t.test('lifecycle object', function (t) {
    
    t.ok(component.lifecycle, 'it should expose a lifecycle object on the component');
    t.ok(isObservable(component.lifecycle.componentWillMount), 'it should expose a componentWillMount observable');
    t.ok(isObservable(component.lifecycle.componentDidMount), 'it should expose a componentDidMount observable');
    t.ok(isObservable(component.lifecycle.componentWillReceiveProps), 'it should expose a componentWillReceiveProps observable');
    t.ok(isObservable(component.lifecycle.componentWillUpdate), 'it should expose a componentWillUpdate observable');
    t.ok(isObservable(component.lifecycle.componentDidUpdate), 'it should expose a componentDidUpdate observable');
    t.ok(isObservable(component.lifecycle.componentWillUnmount), 'it should expose a componentWillUnmount observable');
    
    t.end();
  
  });
  
  t.test('lifecycle observables behavior', function (t) {
    t.ok(lifecycleSpies.componentDidMount.onNext.called, 'componentDidMount should have been called');
    t.notOk(lifecycleSpies.componentWillReceiveProps.onNext.called, 'componentWillReceiveProps should not have been called yet');
    t.notOk(lifecycleSpies.componentWillUpdate.onNext.called, 'componentWillUpdate should not have been called yet');
    t.notOk(lifecycleSpies.componentDidUpdate.onNext.called, 'componentDidUpdate should not have been called yet');
    
    var props = { prop: { foo: 'bar'} };
    
    component.setProps(props);
    
    t.ok(lifecycleSpies.componentWillReceiveProps.onNext.calledWith(props), 'componentWillReceiveProps should have been called after setProps');
    t.ok(lifecycleSpies.componentWillUpdate.onNext.called, 'componentWillUpdate should have been called after setProps');

    var componentWillUpdateParameter = lifecycleSpies.componentWillUpdate.onNext.getCall(0).args[0];
    t.deepEquals(componentWillUpdateParameter.nextProps, props, 'the componentWillUpdate observable should emit { nextProps, nextState }');
    t.equals(componentWillUpdateParameter.nextState, state, 'the componentWillUpdate observable should emit { nextProps, nextState }');

    t.ok(lifecycleSpies.componentDidUpdate.onNext.called, 'componentDidUpdate should have been called after setProps');
    var componentDidUpdateParameter = lifecycleSpies.componentDidUpdate.onNext.getCall(0).args[0];
    t.deepEquals(componentDidUpdateParameter.prevProps, {}, 'the componentDidUpdate observable should emit { prevProps, prevState }');
    t.equals(componentDidUpdateParameter.prevState, state, 'the componentWillUpdate observable should emit { prevProps, prevState }');

    Object.keys(lifecycleSpies).forEach(function (key) {
       t.notOk(lifecycleSpies[key].onComplete.called, 'onComplete for observable \''+ key + '\' should not have been called yet');
    });

    t.notOk(lifecycleSpies.componentWillUnmount.onNext.called, 'componentWillUnmount should not have been called yet');

    testUtils.unmount();

    Object.keys(lifecycleSpies).forEach(function (key) {
      t.ok(lifecycleSpies.componentWillUnmount.onNext.called, 'componentWillUnmount should have been called after unmounting');
      t.ok(lifecycleSpies[key].onComplete.called, 'onComplete for observable \''+ key + '\' should have been called after unmounting');
    });


    Object.keys(lifecycleSpies).forEach(function (key) {
       t.notOk(lifecycleSpies[key].onError.called, 'no error shouild have been reported for \''+ key + '\'');
    });

    t.end();
  });
  
  
  t.test('teardown', function (t) {
    component = null;
    
    t.end();
  });

});
