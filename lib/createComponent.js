var React           = require('react/addons');
var shallowEqual    = require('react/lib/shallowEqual');
var Rx              = require('rx');
var selectorMatches = require('./selector').matches;


function defaultShouldComponentUpdate(nextProps, nextState) {
    return !shallowEqual(this.props, nextProps) ||
           !shallowEqual(this.state, nextState);
}


function initComponent(comp, spec) {
    comp.__lifecycle = {
        componentWillMount: new Rx.Subject(),
        componentDidMount: new Rx.Subject(),
        componentWillReceiveProps: new Rx.Subject(),
        componentWillUpdate: new Rx.Subject(),
        componentDidUpdate: new Rx.Subject(),
        componentWillUnmount: new Rx.Subject(),
    };

    var state;
    if (spec.getInitialState) {
        state = spec.getInitialState(comp.props);
    }
    if(spec.getStateStream) {
        comp.__stateSubscription = spec.getStateStream().subscribe(function (val) {
            if (!state) {
                state = val;
            }
            comp.setState(val);
        });
    }

    var api = {
        
        lifecycle: Object.keys(comp.__lifecycle).reduce(function (lifecycle, prop) {
            if (prop !== 'componentWillUnmount') {
                lifecycle[prop] = comp.__lifecycle[prop].takeUntil(comp.__lifecycle.componentWillUnmount);
            } else {
                lifecycle[prop] = comp.__lifecycle[prop].take(1);
            }
            return lifecycle;
        }, {}),
        
        get state() {
          return comp.state;  
        },
        
        get props() {
          return comp.props;  
        },

        setState: function (state, callback) {
            comp.setState(state, callback);
        },
        replaceState: function (state, callback) {
            comp.replaceState(state, callback);
        },
        forceUpdate: function () {
            comp.forceUpdate();
        },
        getDOMNode: function () {
            return comp.getDOMNode();
        },
        isMounted: function () {
            return comp.isMounted();
        },
        transferPropsTo: function(target) {
            return comp.transferPropsTo(target);
        },
        setProps: function (props, callback) {
            comp.setProps(props, callback);
        },
        replaceProps: function (props, callback) {
            comp.replaceProps(props, callback);
        }, 

        getRef: function (ref) {
            return comp.refs[ref];
        },

        event: function (event, selector) {
            if (comp.isMounted()) {
                //todo error
            }
            var events = comp.__events || (comp.__events = {});
            var registredEvents =  events[selector] || (events[selector] = {});
            var observers = registredEvents[event] || (registredEvents[event] = []);
            return Rx.Observable.create(function (observer) {
                if (!selector) {
                    selector = '';
                }
                observers.push(observer);
                return Rx.Disposable.create(function () {
                    var index = observers.indexOf(observer);
                    if (index !== -1) {
                        observers.splice(index, 1);
                    }
                });
            }).takeUntil(comp.__lifecycle.componentWillUnmount);
        }
    };

    if (spec.init) spec.init(api);

    return state || {};
}

 
function cleanComponent(comp) {
    Object.keys(comp.__lifecycle).forEach(function (key) {
       comp.__lifecycle[key].onCompleted();
    });

    if (comp.__stateSubscription) {
        comp.__stateSubscription.dispose();
    }
}

function eventHandler(observers, event) {
    observers.forEach(function (observer) {
       observer.onNext(event); 
    });
}


function getChildren(element) {
    var children = (element && element && element.props.children) || [];
    if(!Array.isArray(children)) {
        children = [];
    }
    return children.filter(function (el) {
        return typeof el === 'object' && el;
    });
}

function getEventForElement(element, events) {
    return Object.keys(events).filter(function (selector) {
        return selectorMatches(selector, element);
    }).reduce(function(result, selector) {
        var selectorEvents = events[selector];
        Object.keys(selectorEvents).forEach(function (event) {
            result[event] = (result[event] || []).concat(selectorEvents[event]);
        });
        return result;
    }, {});
}

function injectHandler(element, events) {
    var compEvents = getEventForElement(element, events);
    
    Object.keys(compEvents).forEach(function (event) {
        element.props[event] = eventHandler.bind(undefined, compEvents[event]);
    });
    
    getChildren(element).forEach(function(element) {
        injectHandler(element, events);
    });
}


module.exports = function createComponent(spec) {
    var render = spec.render;
    
    
    var reactSpec = {
        
        getInitialState: function () {
            return initComponent(this, spec);
        },
        
        componentWillMount: function () {
            this.__lifecycle.componentWillMount.onNext();
        },
        componentDidMount: function () {
            this.__lifecycle.componentDidMount.onNext();
        },
        componentWillReceiveProps: function (nextProps) {
            this.__lifecycle.componentWillReceiveProps.onNext(nextProps);
        },
        componentWillUpdate: function (nextProps, nextState) {
            this.__lifecycle.componentWillUpdate.onNext({nextProps: nextProps, nextState: nextState });
        },
        componentDidUpdate: function (prevProps, prevState) {
            this.__lifecycle.componentDidUpdate.onNext({prevProps: prevProps, prevState: prevState});
        },
        componentWillUnmount: function () {
            this.__lifecycle.componentWillUnmount.onNext();
            cleanComponent(this);
        },
        
        
        render: function () {
            var result = render(this.props, this.state);
            if (this.__events) {
                injectHandler(result, this.__events);
            }
            return result;
        }
    };
    
    if (spec.shouldComponentUpdate) {
        reactSpec.shouldComponentUpdate = spec.shouldComponentUpdate;
    } else if (!spec.mixins ||
               !spec.mixins.some(function(mixin) { 
                   return typeof mixin.shouldComponentUpdate === 'function'; 
               })
          ){
        reactSpec.shouldComponentUpdate = defaultShouldComponentUpdate;
    }
    
    
    ['getDefaultProps', 'mixins', 'propTypes', 'statics', 'displayName'].forEach(function (key) {
       if (spec.hasOwnProperty(key)) {
           reactSpec[key] = spec[key];
       } 
    });
    
    
    return React.createClass(reactSpec);
};