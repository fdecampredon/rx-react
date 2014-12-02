/*global document*/

var EventHandler = require('rx-react').EventHandler;
var React = require('react');
var Rx    = require('rx-dom');


function searchWikipedia(term) {
    var cleanTerm = global.encodeURIComponent(term);
    var url = 'http://en.wikipedia.org/w/api.php?action=opensearch&format=json&search='+ 
        cleanTerm + '&callback=JSONPCallback';
    return Rx.DOM.jsonpRequest(url);
}



var SearchWikipedia = React.createClass({
  
  getInitialState: function () {
    return {
      results: []
    };
  },
  componentWillMount: function () {
    this.keyup = EventHandler.create();
    
    // Get all distinct key up events from the input and only fire if long enough and distinct
    this.keyup
    .map(function (e) {
      return e.target.value;
    })
    .filter(function (text) {
        return text.length > 2; // Only if the text is longer than 2 characters
    })
    .throttle(
        750 // Pause for 750ms
    )
    .distinctUntilChanged()
    .select(function (text) { 
        return searchWikipedia(text); // Search wikipedia
    })
    .switchLatest()// Ensure no out of order results
    .filter(function (data) {
      return data.length === 2; 
    })
    .subscribe(function (results) {
      this.setState({results: results[1]});
    }.bind(this));
  },
  render: function () {
    var results = this.state.results.map(function (result, index) {
      return <li key={index}>{result}</li>;
    });
    return (
      <div>
        <div>Start Typing</div>
        <input type="text" id="searchtext" onKeyUp={this.keyup}/>
        <ul id="results">
          {results}
        </ul>
      </div>
    );
  }
});

React.render(<SearchWikipedia />, document.getElementById('container'));