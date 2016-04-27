import _ from 'lodash';
import React from 'react';
import {ListGroup, ListGroupItem} from 'react-bootstrap';
import {connect} from 'react-redux';

const PlayerList = ({players}) => {
  return (
    <div>
      <h4>{players.length} online</h4>
      <ListGroup>
      {
        players.map(player => {
          const color = `hsl(${360.0 * player.hue}, 100%, 50%)`
          return (
            <ListGroupItem style={{color: color}} key={`playerlist-${player.id}`}>
              <strong>
                {player.name ? player.name : 'Unknown'}
              </strong> (ID: {player.id})
            </ListGroupItem>);
        })
      }
      </ListGroup>
    </div>
  );
};

const mapStateToProps = state => {
  return {
    players: _.values(state.game.players)
  };
};

export default connect(mapStateToProps)(PlayerList);
