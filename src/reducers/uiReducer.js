import _ from 'lodash';

function uiReducer(state = {
  menuVisible: false
}, action) {
  Object.freeze(state);
  switch (action.type) {
    case 'UI_MENU_TOGGLE': {
      return _.assign({}, state, {menuVisible: !state.menuVisible});
    }

    default:
      return state;
  }
}

export default uiReducer;
