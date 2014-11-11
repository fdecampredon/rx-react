function waitForStream(stream) {
  var Fiber;
  try {
    Fiber = require('fibers');
  } catch (e) {

  }
  if (Fiber === undefined || Fiber.current === undefined) {
    return;
  }

  var Future = require('fibers/future');
  var future = new Future();
  var subscription = stream.subscribe(function () {
    future.return();
  });
  future.wait();
  subscription.dispose();
  return;
}

module.exports = waitForStream;
