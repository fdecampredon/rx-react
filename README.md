#RxReact

>  [ReactJS](http://facebook.github.io/react/) for [RxJS](https://github.com/Reactive-Extensions/RxJS)


#Installation

Install this module with npm: 

```
npm install rx-react
```

#Usage: 

RxReact provides a set of utilities to work with RxJS and React : 

* The `StateStreamMixin`
* The `LifecycleMixin`
* The `EventHandler` helpers


##StateStreamMixin

The `StateStreamMixin` allows to bind a component state to an RxJS `Observable` stream. 
The way to achieve the binding is to provide a `getStateStream` method on your component that returns an RxJS `Observable`, the `StateStream` mixin will automaticly merge the state of your component with the values published by the returned observable. The subscription will be automaticly cleaned on component unmount.

Example: 

```javascript
var StateStreamMixin = require('rx-react').StateStreamMixin;
var React = require('react');
var Rx = require('rx');


var Timer = React.createClass({
  mixins: [StateStreamMixin],
  getStateStream: function () {
    return Rx.Observable.interval(1000).map(function (interval) {
      return {
        secondsElapsed: interval
      };
    });
  },
  render: function () {
    var secondsElapsed = this.state? this.state.secondsElapsed : 0;
    return (
      <div>Seconds Elapsed: {secondsElapsed}</div>
    );
  }
});

React.render(<Timer />, document.getElementById('timer-holder'));
```


##LifecycleMixin

The `LifecycleMixin` allows you to consume React components lifecycle events as RxJS `Observable`.
The `LifecycleMixin` will inject a property `lifecycle` to the component, that property contains an observable for each lifecycle events.

Example : 

```javascript
var LifecycleMixin = require('rx-react').LifecycleMixin;
var React = require('react');
var Rx = require('rx');


var Component = React.createClass({
  mixins: [LifecycleMixin],
  componentWillMount: function () {
    this.lifecycle.componentDidMount.subscribe(function () {
      console.log('componentDidMount');
    });
    
    this.lifecycle.componentWillReceiveProps.subscribe(function (props) {
      console.log('componentWillReceiveProps : ' JSON.stringify(props));
    });
    
    this.lifecycle.componentWillUpdate.subscribe(function ({nextProps, nextState}) {
      console.log('componentWillUpdate : ' JSON.stringify({nextProps, nextState}));
    });
    
    this.lifecycle.componentDidUpdate.subscribe(function ({prevProps, prevState}) {
      console.log('componentDidUpdate : ' JSON.stringify({prevProps, prevState}));
    });
    this.lifecycle.componentWillUnmount.subscribe(function () {
      console.log('componentWillUnmount');
    });
  },
  render: function() {
    //...
  }
});
```

##EventHandler
The `EventHandler` helpers allows to create RxJS `Observable` that can be injected as callback for React event handler.
To create an handler use the `create` function of `EventHandler`

```javascript
var myHandler = EventHandler.create()
```

Example: 

```javascript
var EventHandler = require('rx-react').EventHandler;
var React = require('react');
var Rx = require('rx');


var Button = React.createClass({
  componentWillMount: function () {
    this.buttonClicked = EventHandler.create();
    
    this.buttonClicked.subscribe(function (event) {
      alert('button clicked');
    })
  },
  render: function() {
    return <button onClick={this.buttonClicked} />
  }
});
```
