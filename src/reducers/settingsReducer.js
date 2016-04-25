import _ from 'lodash';

function settingsReducer(state = {}, action) {
  Object.freeze(state);
  switch (action.type) {
    case 'PLAYER_UPDATE':
    {
      return _.assign({}, state, action.data);
    }

    default:
      return state;
  }
}

export default settingsReducer;
