import _ from 'lodash';

function playersReducer(state = {}, action) {
  Object.freeze(state);
  switch (action.type) {
    case 'PLAYER_JOIN': {
      let players = {};
      action.data.forEach(player => {
        players[player.id] = player;
        players[player.id].hue = (player.color * 0.381966 + 0.604878) % 1.0;
      });

      return _.assign({}, state, players);
    }

    case 'PLAYER_LEAVE': {
      let players = _.clone(state);
      action.data.forEach(player => {
        delete players[player.id];
      });

      return players;
    }

    case 'PLAYER_UPDATE': {
      let player = _.assign({}, state[action.data.id], action.data);

      return _.assign({}, state, {
        [action.data.id]: player
      });
    }

    default:
      return state;
  }
}

export default playersReducer;
