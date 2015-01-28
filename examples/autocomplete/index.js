/*global document*/

var RxReact = require('rx-react');
var FuncSubject = RxReact.FuncSubject;
var React = require('react');
var Rx    = require('rx-dom');


function searchWikipedia(term) {
    var cleanTerm = global.encodeURIComponent(term);
    var url = 'http://en.wikipedia.org/w/api.php?action=opensearch&format=json&search='+ 
        cleanTerm + '&callback=JSONPCallback';
    return Rx.DOM.jsonpRequest(url);
}


class SearchWikipedia extends RxReact.Component {
  constructor(props) {
    super(props);
    this.keyup = FuncSubject.create();
  }
  
  getStateStream() {
    return (
      this.keyup
      .map((e) => e.target.value)
      .filter(text => text.length > 2)
      .throttle(750)
      .distinctUntilChanged()
      .flatMapLatest(text => searchWikipedia(text))
      .filter(data => data.length >= 2)
      .map(results => ({results: results[1]}))
    );
  }
  
  render() {
    var results = this.state && this.state.results || [];
    return (
      <div>
        <div>Start Typing</div>
        <input type="text" id="searchtext" onKeyUp={this.keyup}/>
        <ul id="results">{
          results.map((result, index) => 
            <li key={index}>{result}</li>
          )
        }</ul>
      </div>
    );
  }
}


React.render(<SearchWikipedia />, document.getElementById('container'));