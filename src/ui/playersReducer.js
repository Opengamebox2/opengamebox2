import { types } from '../../protocol/protocol';

const assignToEmpty = (oldObject, newObject) => {
  return Object.assign({}, oldObject, newObject);
};

function playersReducer(state = {}, action) {
  Object.freeze(state);
  switch (action.type) {
    case types.PLAYER_JOIN:
    {
      let players = {};
      action.data.forEach(player => {
        players[player.id] = player;
      });
      return assignToEmpty(state, players);
    }
    case types.PLAYER_LEAVE:
    {
      let players = assignToEmpty(state, {});
      action.data.forEach(player => {
        delete players[player.id];
      });
      return players;
    }
    default:
      return state;
  }
}

export default playersReducer;
