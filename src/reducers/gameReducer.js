import _ from 'lodash';
import { combineReducers } from 'redux';
import entitiesReducer from './entitiesReducer';
import playersReducer from './playersReducer';
import cameraReducer from './cameraReducer';

function playerReducer(state = {selectedEntities: []}, action) {
  switch (action.type) {
    case 'ENTITY_SELECT':
      const entities = action.data
        .filter(entity => entity.selectedClientId === state.clientId)
        .map(entity => entity.id);
      return _.assign({}, state, {selectedEntities: entities});
    case 'ENTITY_DELETE':
      let selectedEntities = _.clone(state.selectedEntities)
        .filter(entityId => {
          return _.findIndex(action.data, ['id', entityId]) === -1;
        });
      return _.assign({}, state, {selectedEntities});
    case 'HANDSHAKE_REPLY':
      return _.assign({}, state, {clientId: action.data.id});
    default:
      return state;
  }
}

const gameReducer = combineReducers({
  entities: entitiesReducer,
  players: playersReducer,
  camera: cameraReducer,
  player: playerReducer,
});

export default gameReducer;
