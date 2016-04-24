import _ from 'lodash';
import * as redux from 'redux';
import rootReducer from './reducers/rootReducer';

export default class Store {
  constructor() {
    const devTools = window.devToolsExtension ? window.devToolsExtension() : x => x;
    const enhancer = redux.compose(devTools, redux.applyMiddleware(this.middleware.bind(this)));
    this.store = redux.createStore(rootReducer, {}, enhancer);
    this.actionHandlers = [];
  }

  middleware() {
    return (next) => container => {
      if (container.type === 'PERFORM_ACTION') {
        this.actionHandlers.forEach(handler => {
          if (_.includes(handler.types, container.action.type)) {
            handler.handler(container.action.data, container.action.type);
          }
        });
      }

      return next(container);
    }
  }

  on(types, handler) {
    if (!_.isArray(types)) {
      types = [types];
    }

    this.actionHandlers.push({ types, handler });
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
