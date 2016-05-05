import React from 'react';
import {connect} from 'react-redux';
import {Button, ButtonGroup} from 'react-bootstrap';
import gamecontrolsCss from './gamecontrols.css';

const GameControls = ({
  selectedEntities,
  freeze,
  unfreeze
}) => (
  <ButtonGroup className="gamecontrols__container">
    <Button disabled={selectedEntities.length === 0}
            onClick={() => { freeze(selectedEntities); } }>
      Freeze
    </Button>
    <Button disabled={selectedEntities.length === 0}
            onClick={() => { unfreeze(selectedEntities); } }>
      Unfreeze
    </Button>
  </ButtonGroup>
);

const mapStateToProps = state => {
  return {
    selectedEntities: state.game.player.selectedEntities
  };
};

const mapDispatchToProps = dispatch => {
  return {
    freeze: entities => {
      dispatch({
        type: 'ENTITY_FREEZE_REQUEST',
        data: entities
      });
    },
    unfreeze: entities => {
      dispatch({
        type: 'ENTITY_UNFREEZE_REQUEST',
        data: entities
      });
    }
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(GameControls);
