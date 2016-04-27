import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import bootstrap from '../../assets/css/bootstrap.min.css';

import PlayerList from './PlayerList.react';
import StartDialog from './StartDialog.react';
import Favorites from './Favorites.react';

import Menu from './Menu.react';

export default {
  init: (store) => {
    ReactDOM.render(
      <Provider store={store.getReduxStore()}>
        <div>
          <StartDialog />
          <Menu>
            <PlayerList />
            <Favorites />
          </Menu>
        </div>
      </Provider>,
      document.getElementById('app')
    );
  },
}
