/*global document*/

var StateStreamMixin = require('rx-react').StateStreamMixin;
var React = require('react');
var Rx = require('rx');


var Timer = React.createClass({
  mixins: [StateStreamMixin],
  getStateStream: function() {
    return Rx.Observable.interval(1000).map(function (interval) {
      return {
        secondsElapsed: interval
      };
    });
  },
  render: function() {
    var secondsElapsed = this.state? this.state.secondsElapsed : 0;
    return (
      <div>Seconds Elapsed: {secondsElapsed}</div>
    );
  }
});

React.render(<Timer />, document.getElementById('timer-holder'));