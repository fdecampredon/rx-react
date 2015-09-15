#v0.3

- Remove Deprecated EventHandler
- Introduce `FuncSubject.behavior'
- Components do not implements `LifecycleMixin` behavior anymore
- StateStream mixin is now initialized in `componentWillMount` (previously done in `getInitialState`)
- new top level method `cleanAllSubscriptions`
- React.Component methods are not enumerable anymore

#v0.2

- Add `PropsMixin`
- Add `Component` Base Class
- Add `FuncSubject`
- Deprecate EventHandler (Renamed `FuncSubject`) 
