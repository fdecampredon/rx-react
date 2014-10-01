/**
 * @jsx React.DOM
 */
/*global document*/
/*jshint quotmark:false */
/*jshint white:false */
/*jshint trailing:false */
/*jshint newcap:false */



var ReactRx     = require('../../../');
var React       = require('react/addons');
var Router      = require('director').Router;
var Rx          = require('rx');
var TodoFooter  = require('./footer.jsx');
var TodoItem    = require('./todoItem.jsx');
var TodoModel   = require('./todoModel');
var routes      = require('./routes');



var ENTER_KEY = 13;


var currentRoute = new Rx.BehaviorSubject('');

var router = Router({
    '/': function () {
      currentRoute.onNext(routes.ALL_TODOS); 
    },
    '/active': function () {
      currentRoute.onNext(routes.ACTIVE_TODOS); 
    },
    '/completed':function () {
      currentRoute.onNext(routes.COMPLETED_TODOS); 
    },
});

router.init('/');



var TodoApp = ReactRx.createComponent({
    getStateStream: function() {
        return TodoModel.todos.combineLatest(
                currentRoute,
                function (todos, currentRoute) { 
                    return {
                        todos: todos,
                        nowShowing: currentRoute
                    };
                }
        );
    },
    
    init: function(comp) {
        comp.event('onKeyDown', '#new-todo')
        .filter(function (event) {
            return event.which === ENTER_KEY;
        })
        .subscribe(function (event) {
            var input = event.target;

            var val = input.value.trim();

            if (val) {
                TodoModel.addTodo(val);
                input.value = '';
            }

            event.preventDefault();
        });
        
        
        comp.event('onChange', '#toggle-all').subscribe(function (event) {
            var checked = event.target.checked;
            TodoModel.toggleAll(checked);
        });
        
        comp.event('onToggle', '.todoItem').subscribe(function (todo) {
            TodoModel.toggle(todo);
        });
        
        comp.event('onDestroy', '.todoItem').subscribe(function (todo) {
            TodoModel.destroy(todo);
        });
        
        comp.event('onEdit', '.todoItem').subscribe(function (todo) {
            comp.setState({editing: todo.id});
        });
        
        comp.event('onSave', '.todoItem').subscribe(function (event) {
            TodoModel.save(event.todo, event.text);
            comp.setState({editing: null});
        });
        
        comp.event('onCancel', '.todoItem').subscribe(function () {
            comp.setState({editing: null});
        });
        
        comp.event('onClearCompleted', '.footer').subscribe(function () {
           TodoModel.clearCompleted(); 
        });
    },
    
    render: function (props, state) {
        var footer;
        var main;
        var todos = state.todos;

        var shownTodos = todos.filter(function (todo) {
            switch (state.nowShowing) {
            case routes.ACTIVE_TODOS:
                return !todo.completed;
            case routes.COMPLETED_TODOS:
                return todo.completed;
            default:
                return true;
            }
        }, this);

        var todoItems = shownTodos.map(function (todo) {
            return (
                <TodoItem
                    className='todoItem'
                    key={todo.id}
                    todo={todo}
                    editing={state.editing === todo.id}
                />
            );
            
        }, this);

        var activeTodoCount = todos.reduce(function (accum, todo) {
            return todo.completed ? accum : accum + 1;
        }, 0);

        var completedCount = todos.length - activeTodoCount;

        if (activeTodoCount || completedCount) {
            footer =
                <TodoFooter
                    className='footer'
                    count={activeTodoCount}
                    completedCount={completedCount}
                    nowShowing={state.nowShowing}
                />;
        }

        if (todos.length) {
            main = (
                <section id="main">
                    <input
                        id="toggle-all"
                        type="checkbox"
                        checked={activeTodoCount === 0}
                    />
                    <ul id="todo-list">
                        {todoItems}
                    </ul>
                </section>
            );
        }

        return (
            <div>
                <header id="header">
                    <h1>todos</h1>
                    <input
                        ref="newField"
                        id="new-todo"
                        placeholder="What needs to be done?"
                        autoFocus={true}
                    />
                </header>
                {main}
                {footer}
            </div>
        );
    }
});


TodoModel.init('react-todos');

React.renderComponent(
    <TodoApp/>,
    document.getElementById('todoapp')
);