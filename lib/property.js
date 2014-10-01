var Rx      = require('rx');
var React   = require('react/addons');
var update  = React.addons.update; 


function deepFreeze(object) {
    if ( typeof object === "object") {
        if (object && !Object.isFrozen(object)) {
            Object.freeze(object);
        }
        Object.keys(object).forEach(function (key) {
            deepFreeze(object[key]);
        });
        return object;
    }
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
    
    function operationAlreadyValidatedOrCanceled() {
        throw new Error('the operation has already been validated or canceled');
    }
    
    function cancelOperation(uid) {
        if (!operationsMap.hasOwnProperty(uid)) {
            operationAlreadyValidatedOrCanceled();
        }
        
        var oldValue = operationsMap[uid].oldValue;
        var index = operationsStack.indexOf(uid);
        
        value = deepFreeze(operationsStack.slice(index + 1).reduce(function (value, descriptor) {
            return update(value, descriptor.operation);
        }, oldValue));
        operationsStack.splice(index, 1);
        delete operationsMap[uid];
        notifyObservers();
    }
    
    function validateOperation(uid) {
        if (!operationsMap.hasOwnProperty(uid)) {
            operationAlreadyValidatedOrCanceled();
        }
        operationsMap[uid].validated = true;
        var lastIndex = -1;
        operationsStack.every(function (uid, index) {
            if (operationsMap[uid].validated) {
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
    
    function applyOperation(operation, validate) {
        if (typeof operation === 'function') {
            operation = { $apply: operation};
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
        if (!validate) {
            return {
                cancel: function () { 
                    cancelOperation(uid); 
                },
                validate: function () { 
                    validateOperation(uid);
                }
            };
        } else {
            validateOperation(uid);
            return { 
                cancel: operationAlreadyValidatedOrCanceled,
                validate: operationAlreadyValidatedOrCanceled
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