import React from 'react';
import {connect} from 'react-redux';

const PlayerList = ({players}) => {
	return (
		<div>
			<h2>Players</h2>
			{
				players.map(player => {
          const color = `hsl(${360.0 * player.hue}, 100%, 50%)`
          return (<div style={{color: color}} key={`playerlist-${player.id}`}>
                    {player.id}
                  </div>);
				})
			}
		</div>
	);
};

const mapStateToProps = state => {
	const players = [];
	Object.keys(state.players).forEach(key => {
		players.push(state.players[key]);
	});
	return {
		players
	};
};

export default connect(mapStateToProps)(PlayerList);
