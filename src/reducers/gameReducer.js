import _ from 'lodash';
import { combineReducers } from 'redux';
import entitiesReducer from './entitiesReducer';
import playersReducer from './playersReducer';
import cameraReducer from './cameraReducer';
import chatReducer from './chatReducer';

function playerReducer(state = {selectedEntities: []}, action) {
  switch (action.type) {
    case 'ENTITY_SELECT':
      const entities = action.data
      let filteredEntities = _.clone(state.selectedEntities)
        .filter(id => {
          const e = _.find(entities, ['id', id]);
          return !e || e.selectedClientId === state.clientId;
        });
      entities.forEach(entity => {
        if (entity.selectedClientId === state.clientId
            && filteredEntities.indexOf(entity.id) === -1) {
          filteredEntities.push(entity.id);
        }
      });
      return _.assign({}, state, {selectedEntities: filteredEntities});
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
  chat: chatReducer,
});

export default gameReducer;
