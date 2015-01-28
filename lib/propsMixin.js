//   Copyright 2014 François de Campredon
//
//   Licensed under the Apache License, Version 2.0 (the "License");
//   you may not use this file except in compliance with the License.
//   You may obtain a copy of the License at
//
//       http://www.apache.org/licenses/LICENSE-2.0
//
//   Unless required by applicable law or agreed to in writing, software
//   distributed under the License is distributed on an "AS IS" BASIS,
//   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
//   See the License for the specific language governing permissions and
//   limitations under the License.



var Rx = require('rx');

/**
 * A Mixin that exposes props as RxJS Observables
 * Component augmented with this mixin will have 
 * a 'propsStream' property, this observable will push
 * a new value each time the component publish a new props 
 */
var PropsMixin = {
  getInitialState: function () {
    this.__propsSubject = new Rx.BehaviorSubject(this.props);
    this.propsStream = this.__propsSubject.asObservable();
    
    return null;
  },
  
  componentWillReceiveProps: function (props) {
    this.__propsSubject.onNext(props);
  },
  
  componentWillUnmount: function () {
    this.__propsSubject.onCompleted();
  }
};


module.exports = PropsMixin;
