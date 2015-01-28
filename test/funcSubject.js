var test = require('tape');
var FuncSubject = require('../').FuncSubject;
var Rx = require('rx');

test('FuncSubject', function (t) {
  t.plan(2);
  function hasAllProperties(objA, objB) {
    var key;
    for (key in objB) {
      if (objA[key] !== objB[key]) {
        return false;
      }
    }
    return true;
  }
  t.ok(hasAllProperties(FuncSubject.create(), Rx.Subject.prototype) ,'it should create an Rx Subject');
  
  var value = {};
  var eventHandler = FuncSubject.create();
  
  eventHandler.subscribe(function (val) {
    t.equals(val, value, 'calling the handler as a function should invoque the \'onNext\' method ');
  });
  
  eventHandler(value);
  
});

