/**
 * @jsx React.DOM
 */
/*jshint quotmark:false */
/*jshint white:false */
/*jshint trailing:false */
/*jshint newcap:false */

var RxReact = require('../../../');
var React   = require('react/addons');
var Utils   = require('./utils');
var routes  = require('./routes');

var TodoFooter = RxReact.createComponent({
    render: function (props) {
        var activeTodoWord = Utils.pluralize(props.count, 'item');
        var clearButton = null;

        if (props.completedCount > 0) {
            clearButton = (
                <button
                    id="clear-completed"
                    onClick={props.onClearCompleted}>
                    Clear completed ({props.completedCount})
                </button>
            );
        }

        // React idiom for shortcutting to `classSet` since it'll be used often
        var cx = React.addons.classSet;
        var nowShowing = props.nowShowing;
        return (
            <footer id="footer">
                <span id="todo-count">
                    <strong>{props.count}</strong> {activeTodoWord} left
                </span>
                <ul id="filters">
                    <li>
                        <a
                            href="#/"
                            className={cx({selected: nowShowing === routes.ALL_TODOS})}>
                                All
                        </a>
                    </li>
                    {' '}
                    <li>
                        <a
                            href="#/active"
                            className={cx({selected: nowShowing === routes.ACTIVE_TODOS})}>
                                Active
                        </a>
                    </li>
                    {' '}
                    <li>
                        <a
                            href="#/completed"
                            className={cx({selected: nowShowing === routes.COMPLETED_TODOS})}>
                                Completed
                        </a>
                    </li>
                </ul>
                {clearButton}
            </footer>
        );
    }
});

module.exports = TodoFooter;