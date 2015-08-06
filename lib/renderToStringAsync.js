//   Copyright 2014-2015 François de Campredon
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

'use strict';

/* eslint-disable new-cap */

var React = require('react');
var cleanAllSubscriptions = require('./stateStreamMixin').cleanAllSubscriptions;


function renderToStringAsync(component, cb) {

  var Fiber;
  try {
    Fiber = require('fibers');
  } catch (err) {
    console.error('install fibers: npm install fibers');
    throw err;
  }

  Fiber(function () {
    try {
      Fiber.current.__rxReactAsyncRendering = true;
      var markup = React.renderToString(component);
      delete Fiber.current.__rxReactAsyncRendering;
      cb(null, markup);
    } catch (e) {
      cb(e);
    } finally {
      cleanAllSubscriptions();
    }
  }).run();
}

module.exports = renderToStringAsync;
