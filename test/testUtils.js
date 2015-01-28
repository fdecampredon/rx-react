var jsdom = require('jsdom').jsdom;

var doc = global.document = jsdom();
global.window = doc.parentWindow;
global.window.document = doc;
global.navigator = {
  userAgent: 'Chrome'
};
console.debug = console.log;

var React = require('react');





var div = doc.createElement('div');


exports.render = function (component) {
  return React.render(component, div);
};



exports.unmount = function () {
  return React.unmountComponentAtNode(div);
};