import { combineReducers } from 'redux';
import entitiesReducer from './entitiesReducer';
import playersReducer from './playersReducer';

function clientIdReducer(state = null, action) {
  if (action.type === 'HANDSHAKE_REPLY') {
    return action.data.id;
  } else {
    return state;
  }
}

const gameReducer = combineReducers({
  entities: entitiesReducer,
  players: playersReducer,
  clientId: clientIdReducer,
});

export default gameReducer;
