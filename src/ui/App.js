import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { createStore, compose} from 'redux';

import PlayerList from './PlayerList.react';
import StartDialog from './StartDialog.react';
import rootReducer from './rootReducer';

export const store = createStore(
  rootReducer,
  {},
  compose(window.devToolsExtension ? window.devToolsExtension() : f => f)
);

ReactDOM.render(
  <Provider store={store}>
    <div>
      <PlayerList />
      <StartDialog /> : ''
    </div>
  </Provider>,
  document.getElementById('app')
);

export default () => {};
