var Rx      = require('rx');
var React   = require('react/addons');
var update  = React.addons.update; 


function deepFreeze(object) {
    if (object && typeof object === "object") {
        if (!Object.isFrozen(object)) {
            Object.freeze(object);
        }
        Object.keys(object).forEach(function (key) {
            deepFreeze(object[key]);
        });
    }
    return object;
}


function create(initialValue) {
    var value = deepFreeze(initialValue);
    var uidHelper = 0;
    var operationUid = 0;
    var observers = {};
    var operationsStack = [];
    var operationsMap = {};
    
    function notifyObservers() {
        Object.keys(observers).forEach(function (uid) {
            observers[uid].onNext(value);
        });
    }
    
    function operationAlreadyConfirmdOrCanceled() {
        throw new Error('the operation has already been confirmed or canceled');
    }
    
    function cancelOperation(uid) {
        if (!operationsMap.hasOwnProperty(uid)) {
            operationAlreadyConfirmdOrCanceled();
        }
        
        var oldValue = operationsMap[uid].oldValue;
        var index = operationsStack.indexOf(uid);
        
        value = deepFreeze(operationsStack.slice(index + 1).reduce(function (value, uid) {
            var descriptor = operationsMap[uid];
            return update(value, descriptor.operation);
        }, oldValue));
        operationsStack.splice(index, 1);
        delete operationsMap[uid];
        notifyObservers();
    }
    
    function confirmOperation(uid) {
        if (!operationsMap.hasOwnProperty(uid)) {
            operationAlreadyConfirmdOrCanceled();
        }
        operationsMap[uid].confirmed = true;
        var lastIndex = -1;
        operationsStack.every(function (uid, index) {
            if (operationsMap[uid].confirmed) {
                delete operationsMap[uid];
                lastIndex = index;
                return true;
            }
        });
        
        operationsStack = operationsStack.slice(lastIndex + 1);
    }
    
    function subscribe(observer) {
        var uid = (uidHelper++);
        observers[uid] = observer;
        observer.onNext(value);
        
        return function () {
            delete observers[uid];
        };
    }
    
    var observable = Rx.Observable.create(subscribe);
    
    function applyOperation(operation, confirm) {
        if (typeof operation === 'function') {
            operation = { $apply: operation };
        }
        
        var oldValue = value;
        value = deepFreeze(update(value, operation));
        notifyObservers();
        
        
        var uid = (operationUid++);
        operationsMap[uid] = {
            operation: operation,
            oldValue: oldValue
        };
        operationsStack.push(uid);
        if (!confirm) {
            return {
                cancel: function () { 
                    cancelOperation(uid); 
                },
                confirm: function () { 
                    confirmOperation(uid);
                }
            };
        } else {
            confirmOperation(uid);
            return { 
                cancel: operationAlreadyConfirmdOrCanceled,
                confirm: operationAlreadyConfirmdOrCanceled
            };
        }
    }
    observable.applyOperation = applyOperation;
    
    
    Object.defineProperty(observable,'value', {
        get: function() {
            return value;
        },
        set: function (val) {
            value = deepFreeze(val);
            notifyObservers();
        }
    });
    
    return observable;
}

exports.create = create;