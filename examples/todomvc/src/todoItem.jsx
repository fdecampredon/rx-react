/**
 * @jsx React.DOM
 */
/*jshint quotmark: false */
/*jshint white: false */
/*jshint trailing: false */
/*jshint newcap: false */

var ESCAPE_KEY = 27;
var ENTER_KEY = 13;

var RxReact = require('../../../');
var React   = require('react/addons');

var TodoItem = RxReact.createComponent({
    
    getInitialState: function (props) {
        return {
            editText: props.todo.title
        };
    },
    
    init: function (comp) {
        
        comp.event('onChange', '.edit').subscribe(function (event) {
            comp.setState({editText: event.target.value});
        });
        
        comp.event('onKeyDown', '.edit')
        .filter(function (event) {
            if (event.which === ESCAPE_KEY) {
                comp.setState({editText: comp.props.todo.title});
                comp.props.onCancel();
            } 
            return event.which === ENTER_KEY;
        })
        .merge(comp.event('onBlur', '.edit'))
        .subscribe(function () {
            var val = comp.state.editText.trim();
            if (val) {
                comp.props.onSave({ todo: comp.props.todo, text: val});
                comp.setState({editText: val});
            } else {
                comp.props.onDestroy(comp.props.todo);
            }
            return false;
        });
        
        comp.event('onDoubleClick', '.todoLabel').subscribe(function () {
            comp.props.onEdit(comp.props.todo);
            comp.setState({editText: comp.props.todo.title});
        });
        
        comp.lifecycle.componentDidUpdate
        .filter(function (prev) {
            return comp.props.editing && !prev.prevProps.editing;
        })
        .subscribe(function() {
            var node = comp.getRef('editField').getDOMNode();
            node.focus();
            node.value = comp.props.todo.title;
            node.setSelectionRange(node.value.length, node.value.length);
        });
    },
    
    
    render: function (props, state) {
        return (
            <li className={React.addons.classSet({
                completed: props.todo.completed,
                editing: props.editing
            })}>
                <div className="view">
                    <input
                        className="toggle"
                        type="checkbox"
                        checked={props.todo.completed}
                        onChange={props.onToggle.bind(undefined, props.todo)}
                    />
                    <label className='todoLabel' >
                        {props.todo.title}
                    </label>
                    <button className="destroy" onClick={props.onDestroy.bind(undefined, props.todo)} />
                </div>
                <input
                    ref="editField"
                    className="edit"
                    value={state.editText}
                />
            </li>
        );
    }
    
});

module.exports = TodoItem;