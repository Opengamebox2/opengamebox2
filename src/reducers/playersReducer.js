const assignToEmpty = (oldObject, newObject) => {
  return Object.assign({}, oldObject, newObject);
};

function playersReducer(state = {}, action) {
  Object.freeze(state);
  switch (action.type) {
    case 'PLAYER_JOIN':
    {
      let players = {};
      action.data.forEach(player => {
        players[player.id] = player;
        players[player.id].hue = (player.color * 0.381966 + 0.604878) % 1.0;
      });
      return assignToEmpty(state, players);
    }

    case 'PLAYER_LEAVE':
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
