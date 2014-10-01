var Utils   = require('./utils');
var RxReact = require('../../../');

var storeKey;
var todos = RxReact.Property.create([]);

todos.subscribe(function (value) {
    Utils.store(storeKey, value);
});

module.exports = {
    get todos() {
        return todos;
    },
    
    init: function (key) {
        storeKey = key;
        todos.value = Utils.store(key);
    },
    
    addTodo: function (title) {
        todos.applyOperation({ 
            $push: [{
                id: Utils.uuid(),
                title: title,
                completed: false
            }]
        }).validate();
    },
    
    toggleAll: function (checked) {
        todos.applyOperation(function (todos) {
            return todos.map(function (todo) {
                return Utils.extend({}, todo, { completed: checked });
            }); 
        }).validate();
    },
    
    toggle: function (todoToToggle) {
        todos.applyOperation(function (todos) {
            return todos.map(function (todo) {
                return todo !== todoToToggle ?
                    todo :
                    Utils.extend({}, todo, {completed: !todo.completed});
            });
        }).validate();
    },
    
    destroy: function (todo) {
        todos.applyOperation(function (todos) {
            return todos.filter(function (candidate) {
                return candidate !== todo;
            });
        }).validate();
    },
    
    save: function (todoToSave, text) {
        todos.applyOperation(function (todos) {
            return todos.map(function (todo) {
                return todo !== todoToSave ? todo : Utils.extend({}, todo, {title: text});
            });
        }).validate();
    },
    
    clearCompleted: function () {
        todos.applyOperation(function (todos) {
            return todos.filter(function (todo) {
                return !todo.completed;
            });
        }).validate();
    }
};
