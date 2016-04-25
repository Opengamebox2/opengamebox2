import _ from 'lodash';

function settingsReducer(state = {
  images: {}
}, action) {
  Object.freeze(state);
  switch (action.type) {
    case 'PLAYER_UPDATE_REQUEST': {
      return _.assign({}, state, action.data);
    }

    case 'ENTITY_CREATE': {
      const images = _.clone(state.images);
      action.data.forEach(entity => {
        if (!images[entity.imgHash]) {
        images[entity.imgHash] = {};
        }
      });
      return _.assign({}, state, {images});
    }

    default:
      return state;
  }
}

export default settingsReducer;
