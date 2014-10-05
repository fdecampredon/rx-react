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

    if (spec.init) {
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
                var eventMap = comp.__eventMap || (comp.__eventMap = {});
                var selectorToObservers =  eventMap[event] || (eventMap[event] = {});
                var observers = selectorToObservers[selector] || (selectorToObservers[selector] = []);
                return Rx.Observable.create(function (observer) {
                    if (!selector) {
                        selector = '';
                    }
                    observers.push(observer);
                    return function () {
                        var index = observers.indexOf(observer);
                        if (index !== -1) {
                            observers.splice(index, 1);
                        }
                    };
                }).takeUntil(comp.__lifecycle.componentWillUnmount);
            }
        };

        spec.init(api);
    }

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


function getChildren(element) {
    var children = (element && element && element.props.children) || [];
    if(!Array.isArray(children)) {
        children = [children];
    }
    return children.filter(function (el) {
        return typeof el === 'object' && el;
    });
}

function eventHandler(selectorToObservers, event) {
    Object.keys(selectorToObservers).reduce(function (observers, selector) {
        return observers.concat(selectorToObservers[selector]);
    }, []).forEach(function (observer) {
       observer.onNext(event); 
    });
}


function getEventHandler(eventName, selectorToObservers, comp) {
    var cachedHandlers = comp.__eventHandlers || (comp.__eventHandlers = {});
    var hash = eventName + Object.keys(selectorToObservers).join();
    var cachedHandler = cachedHandlers[hash] || (cachedHandlers[hash] = function (event) {
        eventHandler(selectorToObservers, event);
    });
    
    return cachedHandler;
}

function injectHandler(element, comp, isRoot) {
    if (!comp.handlers) {
        comp.handlers = {};
    }
    
    var eventMap = comp.__eventMap;
    
    Object.keys(eventMap).forEach(function (eventName) {
        var hasMatch = false;
        var selectorToObservers = Object.keys(eventMap[eventName]).reduce(function (selectors, selector) {
            if ( (!selector && isRoot) || selectorMatches(selector, element)) {
                hasMatch = true;
                selectors[selector] = eventMap[eventName][selector];
            }
            return selectors;
        }, {});
        
        if (hasMatch) {
            element.props[eventName] = getEventHandler(eventName, selectorToObservers, comp);
            Object.defineProperty(element.props[eventName], '__isUsed', {
                value: true,
                enumerable: false,
                writable: false,
                configurable: true
            });
        }
    });
    
    getChildren(element).forEach(function(element) {
        injectHandler(element, comp);
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
            var eventHandlers = this.__eventHandlers;
            
            if (eventHandlers) {
                Object.keys(eventHandlers).forEach(function (hash) {
                    Object.defineProperty(eventHandlers[hash], '__isUsed', {
                        value: false,
                        enumerable: false,
                        writable: false,
                        configurable: true
                    });
                });
            }
            
            var result = render(this.props, this.state);
            if (this.__eventMap) {
                injectHandler(result, this, true);
            }
            
            if (eventHandlers) {
                Object.keys(eventHandlers).forEach(function (hash) {
                    if (!eventHandlers[hash].__isUsed) {
                        delete eventHandlers[hash];
                    }
                });
            }
            
            return result;
        }
    };
    
    if (spec.shouldComponentUpdate) {
        reactSpec.shouldComponentUpdate = function (nextProps, nextState) {
            return spec.shouldComponentUpdate({
                props: this.props,
                state: this.state
            }, {
                nextProps: nextProps,
                nextState: nextState
            });
        };
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