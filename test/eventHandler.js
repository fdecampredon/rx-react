var test = require('tape');
var EventHandler = require('../').EventHandler;
var Rx = require('rx');

test('EventHandler', function (t) {
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
  t.ok(hasAllProperties(EventHandler.create(), Rx.Subject.prototype) ,'it should create an Rx Subject');
  
  var value = {};
  var eventHandler = EventHandler.create();
  
  eventHandler.subscribe(function (val) {
    t.equals(val, value, 'calling the handler as a function should invoque the \'onNext\' method ');
  });
  
  eventHandler(value);
  
});

