import _ from 'lodash';

function cameraReducer(state = {
  x: Math.pow(2, 51) / 2, y: Math.pow(2, 51) / 2
}, action) {
  Object.freeze(state);
  switch (action.type) {
    case 'CAMERA_MOVE':
      return _.assign({}, state, {x: action.data.x, y: action.data.y});
    default:
      return state;
  }

}

export default cameraReducer;
