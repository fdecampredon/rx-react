rx-react
========

> This module povides utilitiels to works with [React](http://facebook.github.io/react/) in a [RxJS](https://github.com/Reactive-Extensions/RxJS)

### createComponent 

`createComponent(Object spec)`

This function allows you to define your react component, unlike for `React.createClass` the function defined in the spec object are not executed in any context (no `this`) and there is no way to define *method*, the specification object must contains a render function and can optionally contain other lifecycle functions described here : 


`Object getDefaultProps`: see React [`getDefaultProps`](http://facebook.github.io/react/docs/component-specs.html#getdefaultprops)

`Object getInitialState(Object props)`: similar to React [`getInitialState`](http://facebook.github.io/react/docs/component-specs.html#getinitialstate), except that the `props` object is passed as argument of the functtion

`Observable getStateStream()`: if this function is provided, it should returns a RxJS [`Observable`](https://github.com/Reactive-Extensions/RxJS/blob/master/doc/api/core/observable.md) the `state` of your component will automaticly be merged with the last value pushed by this observable


`boolean shouldComponentUpdate({Object props, Object state } actual, {Object props, Object state } next):`  Similar to React [`shouldComponentUpdate`](http://facebook.github.io/react/docs/component-specs.html#updating-shouldcomponentupdate), exept that current props/state are passed as an object on the first argument, and the next props/state are passed as an object on the second argument


`array mixins`: see React [`mixins`](http://facebook.github.io/react/docs/component-specs.html#mixins)

`Object propTypes`: see React [`propTypes`](http://facebook.github.io/react/docs/component-specs.html#proptypes)

`Object statics`: see React [`statics`](http://facebook.github.io/react/docs/component-specs.html#statics)

`displayName`: see React [`displayName`](http://facebook.github.io/react/docs/component-specs.html#displayname)

`ReactComponent render(Object props, Object state)`: this function is required unlike for React [`render`](http://facebook.github.io/react/docs/component-specs.html#render) this function is no executed with the component as `this` context, the `props` and `state` object are passed as arguments

`void init(Object component)`: this is the main point where you will implements logic the `component` Object contains methods that will allows you interact with the underlying React component.


the component Object contains the following methods/properties :

`Object lifecycle`: an object with 6 RxJS.

`Object state`: the state of the component

`Object props`: the props of the component

`setState`: see React [`setState`](http://facebook.github.io/react/docs/component-api.html#setstate)

`replaceState`: see React [`replaceState`](http://facebook.github.io/react/docs/component-api.html#replacestate)

`forceUpdate`: see React [`forceUpdate`](http://facebook.github.io/react/docs/component-api.html#forceupdate)

`getDOMNode`: see React [`getDOMNode`](http://facebook.github.io/react/docs/component-api.html#forceupdate)

`getDOMNode`: see React [`getDOMNode`](http://facebook.github.io/react/docs/component-api.html#getdomnode)

`isMounted`: see React [`isMounted`](http://facebook.github.io/react/docs/component-api.html#getdomnode)

`setProps`: see React [`setProps`](http://facebook.github.io/react/docs/component-api.html#getdomnode)

`replaceProps`: see React [`replaceProps`](http://facebook.github.io/react/docs/component-api.html#getdomnode)

`getRef`:

`event`:



