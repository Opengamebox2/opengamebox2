import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import bootstrap from '../../assets/css/bootstrap.min.css';

import StartDialog from './StartDialog.react';

import Menu from './Menu.react';

export default {
  init: (store) => {
    ReactDOM.render(
      <Provider store={store.getReduxStore()}>
        <div>
          <StartDialog />
          <Menu />
        </div>
      </Provider>,
      document.getElementById('app')
    );
  },
}
