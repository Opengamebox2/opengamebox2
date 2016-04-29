import _ from 'lodash';

function settingsReducer(state = {
  images: {}
}, action) {
  Object.freeze(state);
  switch (action.type) {
    case 'PLAYER_UPDATE_REQUEST': {
      return _.assign({}, state, action.data);
    }

    case 'FAVORITE_ADD': {
      const images = _.clone(state.images);
      images[action.data.imgHash] = {thumbnail: action.data.thumbnail};
      return _.assign({}, state, {images});
    }

    case 'FAVORITE_DELETE': {
      const images = _.clone(state.images);
      action.data.forEach(imgHash => {
        if (images[imgHash]) {
          delete images[imgHash];
        }
      });
      return _.assign({}, state, {images});
    }

    default:
      return state;
  }
}

export default settingsReducer;
