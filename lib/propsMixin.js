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


var PropsMixin = {
  getInitialState: function () {
    this.__propsSubject = new Rx.Subject();
    this.propsStream = 
      Rx.Observable
      .of(this.props)
      .merge(this.__propsSubject);
  },
  
  componentWillReceiveProps: function (props) {
    this.__propsSubject.onNext(props);
  },
  
  componentWillUnmount: function () {
    this.__propsSubject.onComplete();
  }
};


module.exports = PropsMixin;
