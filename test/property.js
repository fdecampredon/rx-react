var test     = require('tape');
var Property = require('../lib/property');
var Rx       = require('rx');
var sinon    = require('sinon');


test('Property test', function (t) {
    t.test('create', function (t) {
        t.plan(2);
        var value = {};
        var property = Property.create(value);
        
        t.ok(property instanceof Rx.Observable, 'it should produce an Rx Observable');
        property.subscribe(function () {
           t.equal(value, value, 'the value of the observer should be the value passed to create'); 
        });
    });
    
    t.test('value', function (t) {
        var value = {};
        var property = Property.create(value);
        t.plan(2);
        t.equal(property.value, value, 'the property value should be the one passed to create');
        property.subscribe(function () {
           t.pass('when a new value is the the observers should be notified');
        });
        t.value = {};
    });
    
    t.test('dispose', function (t) {
        var value = {};
        var property = Property.create(value);
        t.plan(6);
        
        function handler() {
           t.pass('an observer that has not been disposed should be notified');
        }
        
        var disposable = property.subscribe(handler);
        
        t.ok(typeof disposable.dispose === 'function', 'it should return a disposable');
        
        property.subscribe(handler);
        property.subscribe(handler).dispose();
        property.value = {};
    });
    
    
    t.test('applyOperation', function (t) {
        
        t.test('basic', function (t) {
            var value = { hello: 'world' };
            var newValue = { foo: 'bar' };
            var property = Property.create(value);
            var spy = sinon.spy();

            t.plan(3);
            
            property.subscribe(spy);
            
            property.applyOperation(function (val) { 
                t.deepEqual(val, value, 'the value held by the property should be passed to the function operation');
                return newValue; 
            }, true);


            t.equal(property.value, newValue, 'the value held by the property ' + 
                        'should be the one returned by the function passed to \'applyOperation\'');
            
            t.equal(spy.getCall(1).args[0], newValue, 'observers should have been notified with the new value');
            
        });
        
        t.test('immutable helpers', function (t) {
            var property = Property.create({ hello: 'world' });
            t.plan(1);
            
            
            property.applyOperation({$merge : { foo: 'bar'}}, true);


            t.deepEqual({ foo: 'bar',  hello: 'world'}, property.value, 'if an object is passed to \'applyOperation\''+ 
                        'it should be applied on the current value as a React immutability helpers command');
            
        });
        
        t.test('operations canceling', function (t) {
            t.test('basic', function (t) {
                var value = {};
                var newValue = {};
                var property = Property.create(value);
                var spy = sinon.spy();

                t.plan(3);

                property.subscribe(spy);

                var operation = property.applyOperation(function () {
                    return newValue;
                });

                operation.cancel();

                t.deepEqual(property.value, value, 'the value held by the property ' + 
                            'should be the one before the operation as applied');
                
                t.equal(spy.getCall(1).args[0], newValue, 'observers should have been notified with the new value');
                t.equal(spy.getCall(2).args[0], value, 'observers should have been notified about the canceling');
            });
            
            t.test('nesting', function (t) {
                var property = Property.create([]);
                var operationSpy = sinon.spy(function (val) {
                    return val.concat('bar');
                });
                
                t.plan(2);
                
                var operation = property.applyOperation({$push: ['foo']});
                property.applyOperation(operationSpy, true);
                
                operation.cancel();
                
                t.equal(operationSpy.callCount, 2, 'the operation should have been applied 2 times');
                t.deepEqual(property.value, ['bar'], 'the value held by the property should be the result of ' + 
                            'applying the second operation on the old value');
                
            });
            
            
            t.test('already canceled/confirmed operation', function (t) {
                var property = Property.create([]);
                var operation1 = property.applyOperation({$push: ['foo']});
                operation1.cancel();
                var operation2 = property.applyOperation({$push: ['foo']});
                operation2.confirm();
                
                t.plan(4);

                t.throws(function () {
                    operation1.cancel();
                }, 'an operation already canceled shoul throw an error when canceled again');
                
                
                t.throws(function () {
                    operation1.confirm();
                }, 'an operation already canceled shoul throw an error when confirmed');
                
                
                t.throws(function () {
                    operation2.cancel();
                }, 'an operation already confirmed shoul throw an error when canceled again');
                
                
                t.throws(function () {
                    operation2.confirm();
                }, 'an operation already confirmed shoul throw an error when confirmed');
            });
        });
        
    });
});