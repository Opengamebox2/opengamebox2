const assignToEmpty = (oldObject, newObject) => {
  return Object.assign({}, oldObject, newObject);
};

function entitiesReducer(state = {}, action) {
  Object.freeze(state);
  switch (action.type) {
    case 'ENTITY_CREATE':
    case 'ENTITY_MOVE':
    case 'ENTITY_SELECT':
    {
      let entities = {};
      action.data.forEach(entity => {
        entities[entity.id] = assignToEmpty(state[entity.id], entity);
      });
      return assignToEmpty(state, entities);
    }

    case 'ENTITY_DELETE':
    {
      let entities = assignToEmpty(state, {});
      action.data.forEach(entity => {
        delete entities[entity.id];
      });
      return entities;
    }

    default:
      return state;
  }
}

export default entitiesReducer;
