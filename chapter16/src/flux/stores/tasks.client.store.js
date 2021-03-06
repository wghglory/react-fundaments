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