import _ from 'lodash';

function entitiesReducer(state = {}, action) {
  Object.freeze(state);
  switch (action.type) {
    case 'ENTITY_CREATE':
    case 'ENTITY_MOVE':
    case 'ENTITY_SELECT':
    {
      let entities = {};
      action.data.forEach(entity => {
        entities[entity.id] = _.assign({}, state[entity.id], entity);
      });
      return _.assign({}, state, entities);
    }

    case 'ENTITY_DELETE':
    {
      let entities = _.assign({}, state, {});
      action.data.forEach(entity => {
        delete entities[entity.id];
      });
      return entities;
    }

    case 'ENTITY_FREEZE':
    {
      let entities = {};
      action.data.forEach(entityId => {
        entities[entityId] = _.assign({}, state[entityId], {frozen: true});
      });
      return _.assign({}, state, entities);
    }

    case 'ENTITY_UNFREEZE':
    {
      let entities = {};
      action.data.forEach(entityId => {
        entities[entityId] = _.assign({}, state[entityId], {frozen: false});
      });
      return _.assign({}, state, entities);
    }

    default:
      return state;
  }
}

export default entitiesReducer;
