import _ from 'lodash';
import * as redux from 'redux';
import rootReducer from './reducers/rootReducer';

export default class Store {
  constructor() {
    const devTools = window.devToolsExtension ? window.devToolsExtension() : x => x;
    this.store = redux.createStore(rootReducer, {}, devTools);
    this.actionHandlers = [];

    this.store.subscribe(() => {
      const action = this.store.getState().lastAction;
      this.actionHandlers.forEach(handler => {
        if (_.includes(handler.types, action.type)) {
          handler.handler(action.data, action.type);
        }
      });
    });
  }

  on(types, handler) {
    if (!_.isArray(types)) {
      types = [types];
    }

    this.actionHandlers.push({ types, handler });
  }

  subscribe(callback) {
    return this.store.subscribe(callback);
  }

  dispatch(type, data = {}) {
    this.store.dispatch({type, data});
  }

  getState() {
    return this.store.getState();
  }

  getReduxStore() {
    return this.store;
  }
}
