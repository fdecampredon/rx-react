#v0.3.0

- Remove Deprecated EventHandler
- Components do not implements `LifecycleMixin` behavior anymore
- StateStream mixin is now initialized in `componentWillMount` (previously done in `getInitialState`)
- new top level method `cleanAllSubscriptions`
- RxReact.Component 
 - methods are not enumerable anymore
 - empty function on unused lifecycle methods for consitency
- FuncSubject:
 - new map function
 - `FuncSubject.behavior`
 - `FuncSubject.replay`
 - `FuncSubject.async`
 - `FuncSubject.factory`


#v0.2

- Add `PropsMixin`
- Add `Component` Base Class
- Add `FuncSubject`
- Deprecate EventHandler (Renamed `FuncSubject`) 
