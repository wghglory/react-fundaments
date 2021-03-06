# FLux

## MVC

Pros:

* perfect for one to one mapping: 20 views <=> 20 controllers <=> 20 models 
* good separation of concerns
* easy to maintain and test

Cons:

Sometimes your view may show several kinds of models, so it's hard to manage the relationship between view and model mappings. i.e, At first, you have a product view showing only product list. When project gets larger, this view may need include user model, comment model, etc. And other views may have the same issue. These dependencies are difficult to manage, and maybe there're cyclic dependencies. In Asp.net MVC, the solution is create a viewModel. But you have to write extra code about viewModel.

2nd, losing control of your data flow. In general the data flow is bi-directional. The user input in one component can affect other components and vice versa. By using Redux we’re solving this problem by introducing a central data store in our application. The store contains the state of the application and is the source of truth for components. By using the store concept you do not need to synchronize state between components manually. Instead you can fully rely on the Redux store at any time.

## Flux architecture

Due to the MVC shortcomings, Facebook has a view including message list, a small message window, message indicator on right conner. They use flux to manage the message state.

flux one way data flow just as react:

view(jsx) --> actions --> dispatcher(singleton, make sure action is handler one by one) --> stores(read only) --> back to view

In Flux, application state data is managed outside of React components in stores. Stores hold and change the data, and are the only thing that can update a view in Flux. If a user were to interact with a web page. Say, click a button or submit a form—then an action would be created to represent the user’s request. An action provides the instructions and data required to make a change. Actions are dispatched using a central control component called the dispatcher. The dispatcher is designed to queue up our actions and dispatch them to the appropriate store. Once a store receives an action, it will use it as instructions to modify state and update the view. Data flows in one direction: action to a dispatcher to the store and finally to the view.

### Flow in detail

1. component element click event --> eventHandler calls action
1. action function sends ajax to server, callback calls dispatcher
1. dispatcher sends actionType and data to store
1. store manages data internally according to the actionType, data from dispatcher, then emit event.
1. Component listener, registered in componentDidMount, notices that and setState, which calls store getTasks(). State update will re-render.

<img src="http://om1o84p1p.bkt.clouddn.com/flux.png"  />

## Implement a to-do list by flux

1. create reusable bootstrap/Button.js component
1. create Tasks.js and Task.js components
1. create flux folder, action, store, constants, dispatcher

constants.js

```javascript
export const ADD_TASK = 'addTask';
export const INIT_TASKS = 'initTasks';
export const REMOVE_TASK = 'removeTask';
```

dispatcher.js

```jsx
import { Dispatcher } from 'flux';
export default new Dispatcher();
```

tasks.client.action.js

```jsx
/**
 * action directly talks with dispatcher (tells it what action you need to notify store, and pass data)
 */

import dispatcher from '../dispatcher';
import * as ACT from '../constants';

export function initTasks() {
  dispatcher.dispatch({ type: ACT.INIT_TASKS, payload: null });
}

export function addTask(packt) {
  addTaskSync(packt);
}

export function addTaskSync(packt) {
  // transform data if needed
  dispatcher.dispatch({ type: ACT.ADD_TASK, payload: packt });
}

export function removeTask(packt) {
  dispatcher.dispatch({ type: ACT.REMOVE_TASK, payload: packt });
}
```

tasks.client.store.js

```jsx
/**
 * place to store data, and then bind to react state
 * 1. action sends action and data to dispatcher, 
 * 2. dispatcher registers store's data operation command
 * 3. store operates its data center based on the action and data from action and dispatcher
 */

import EventEmitter from 'events';
import dispatcher from '../dispatcher';
import * as ACT from '../constants/tasks.actionTypes';

class TasksStore extends EventEmitter {
  constructor() {
    super();

    this.tasks = [];

    this.operate = this.operate.bind(this);
  }

  addChangeListener(cb) {
    this.on('change', cb);
  }

  removeChangeListener(cb) {
    this.removeListener('change', cb);
  }

  initTasks(tasks) {
    if (tasks) {
      this.tasks = tasks;
    }
    this.emit('change');
  }

  getTasks() {
    return this.tasks;
  }

  addTask(task) {
    const temp = this.tasks.length === 0 ? [] : this.tasks.slice(0);   // copy a new arr, don't modify original since we need keep track of changes
    temp.push(task);
    this.tasks = temp;
    this.emit('change');
  }

  removeTask({ _id }) {
    this.tasks = this.tasks.filter((task) => task._id !== _id);
    this.emit('change');
  }

  operate({ type, payload }) {
    switch (type) {
      case ACT.ADD_TASK:
        this.addTask(payload);
        break;
      case ACT.INIT_TASKS:
        this.initTasks(payload);
        break;
      case ACT.REMOVE_TASK:
        this.removeTask(payload);
        break;
    }
  }

}

const store = new TasksStore();

dispatcher.register(store.operate);

export default store;
```

Tasks.js

```jsx
/**
 * includes both action and store
 * action: click event calls relative action 
 * store: bind to react state
 */
import React from 'react';
import Task from './task';
import Button from '../bootstrap/Button';
import taskStore from '../flux/stores/tasks.client.store';
import { addTask, initTasks } from '../flux/actions/tasks.client.action';

export default class Tasks extends React.Component {
  constructor(props) {
    super(props);

    initTasks();

    this.state = {
      tasks: taskStore.getTasks()
    };

    this.addNewTask = this.addNewTask.bind(this);
    this._onChange = this._onChange.bind(this);
  }

  _onChange() {
    this.setState({ tasks: taskStore.getTasks() });
  }

  // after each action, store should emit an event, here react setState and get latest data from store
  componentDidMount() {
    taskStore.addChangeListener(this._onChange);
  }

  componentWillUnmount() {
    // taskStore.removeListener('change', this.getData.bind(this));   //this doesn't work, why?
    taskStore.removeChangeListener(this._onChange);
  }

  addNewTask() {
    const tasks = this.state.tasks.length === 0 ? [] : this.state.tasks.slice(0);
    /*
    1. call action with data. 
    2. action sends ajax post request to db, in callback dispatcher sends actionType, data to store
    3. store manages data internally, emit 'change' event
    4. Then 'change' event is triggered
    5. componentDidMount listens that event, and setState according to store
    */
    addTask({ label: this.input.value, _id: tasks.length });
  }

  render() {
    const { tasks } = this.state;
    let taskArr = [];

    for (let { _id, label } of tasks) {
      taskArr.push(<Task key={_id} id={_id}>{label}</Task>);
    }

    return (
      <div>
        <div className="addTask">
          <input className="form-control" ref={(a) => { this.input = a; }} type="text" />
          <Button className="-secondary" onClick={this.addNewTask}>Add Task</Button>
        </div>
        {taskArr}
      </div>
    );
  }
}
```

Task.js

```javascript
import React from 'react';
const PropTypes = require('prop-types');
import Button from '../bootstrap/Button';
import { removeTask } from '../flux/actions/tasks.client.action';

export default class Task extends React.Component {
	constructor(props) {
		super(props);

		this.removeHandler = this.removeHandler.bind(this);
	}

	removeHandler() {
		removeTask({ _id: this.props.id });
	}
  render() {
		return (
			<p className="alert alert-danger clear">
				{this.props.children}
				<Button onClick={this.removeHandler} className="-primary -sm floatRight">remove</Button>
			</p>
		);
	}
}

Task.propTypes = {
  id: PropTypes.number.isRequired,
  children: PropTypes.string.isRequired
};
```

bootstrap/Button.js

```jsx
/**
 * reusable bootstrap button
 */

import React from 'react';
const PropTypes = require('prop-types');

export default class Button extends React.Component {
	render() {
		//<Button onClick={this.onClick} className="-primary -lg -block">{this.props.children}</Button>;
		const { className, children, ...rest } = this.props;
		const cn = ("btn " + className).split(" -").join(" btn-");

		return <button type="button" className={cn} {...rest}>{children}</button>;
	}
}

Button.propTypes = {
	className: PropTypes.string.isRequired,
	children: PropTypes.string.isRequired
};
```