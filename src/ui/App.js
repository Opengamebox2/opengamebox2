import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import bootstrap from '../../assets/css/bootstrap.min.css';

import PlayerList from './PlayerList.react';
import StartDialog from './StartDialog.react';
import Favorites from './Favorites.react';

export default {
  init: (store) => {
    ReactDOM.render(
      <Provider store={store.getReduxStore()}>
        <div>
          <PlayerList />
          <StartDialog />
          <Favorites />
        </div>
      </Provider>,
      document.getElementById('app')
    );
  },
}
