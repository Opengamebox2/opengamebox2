function lastActionReducer(state = {}, action) {
  Object.freeze(state);
  return Object.assign({}, state, action);
}

export default lastActionReducer;
