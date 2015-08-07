'use strict';

const React = require('react');
const Rx = require('rx');
const RxReact = require('rx-react');
const ReactDOM = require('react-dom');

class TodoList {
  render() {
    const { items } = this.props;
    return (
      <ul>{items.map((itemText, index) => 
        <li key={index + itemText}>{itemText}</li>
      )}</ul>
    );
  }
}

const TodoApp = RxReact.createClass(function TodoApp() {
  
  const onChange = RxReact.FuncSubject.create();
  
  const handleSubmit = RxReact.FuncSubject.create(function (e) {
    e.preventDefault();
  });
  
  const inputValueStream = (
    onChange
    .map(e => e.target.value)
    .startWith('')
  );
  
  const itemsStream = (
      handleSubmit
      .withLatestFrom(inputValueStream, (_, text) => text )
      .scan((items, text) => items.concat(text), [])
      .startWith([])
  );
  
  const textStream = inputValueStream.merge(handleSubmit.map(''));
  
  const stateStream = Rx.Observable.combineLatest(
    textStream,
    itemsStream,
    (text, items) => ({ text, items })
  );

  function render({state: {items, text}}) {
    return (
      <div>
        <h3>TODO</h3>
        <TodoList items={items} />
        <form onSubmit={handleSubmit}>
          <input onChange={onChange} value={text} />
          <button>{'Add #' + (items.length + 1)}</button>
        </form>
      </div>
    );
  }
  return {render, stateStream};
});

ReactDOM.render(<TodoApp />, document.getElementById('container'));
