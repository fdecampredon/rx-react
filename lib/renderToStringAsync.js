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
