import _ from 'lodash';
import React from 'react';
import {Button, FormControl, FormGroup, ControlLabel, ButtonGroup} from 'react-bootstrap';
import {connect} from 'react-redux';
import {reduxForm} from 'redux-form';
import axios from 'axios';
const ipfsGateway = 'https://gateway.ipfs.io/ipfs';

let FavoritesAdd = ({
  addFavorite, fields, selectedEntities
}) => {
  const {imgHash} = fields;
  const addFavorites = () => {
    selectedEntities.forEach(entity => {
      addFavorite(entity.imgHash);
    });
  };
  return (
    <div>
      <FormGroup>
        <ControlLabel>Image hash</ControlLabel>
        <FormControl type="text" {...imgHash}
                     placeholder="QmWgeQPGVn2s9akWmxqzD9UHjNzvwjayrtG2bnH4F48Cc6" />
      </FormGroup>
      <ButtonGroup>
        <Button bsStyle="primary"
            disabled={imgHash.error !== undefined}
            onClick={() => { addFavorite(imgHash.value); }}>Create</Button>
        <Button bsStyle="primary"
                className="pull-right"
                disabled={selectedEntities.length === 0}
                onClick={() => { addFavorites(selectedEntities); }}>
          Add selection
        </Button>
      </ButtonGroup>
    </div>
  );
};

const validate = values => {
  const errors = {};
  if (!values.imgHash || values.imgHash.length !== 46) {
    errors.imgHash = 'Required';
  }
  return errors;
};

FavoritesAdd = reduxForm({
  form: 'favoritesAdd',
  fields: ['imgHash'],
  validate
})(FavoritesAdd);

const mapStateToProps = (state) => {
  const selectedEntities = state.game.player.selectedEntities
    .filter(entityId => {
      const entity = state.game.entities[entityId];
      return !state.settings.images[entity.imgHash];
    })
    .map(entityId => state.game.entities[entityId]);
  return {
    selectedEntities
  };
};

const mapDispatchToProps = dispatch => {
  return {
    addFavorite: imgHash => {
      axios.get(`${ipfsGateway}/${imgHash}`, {
        responseType: 'blob'
      }).then(response => {
        const reader  = new FileReader();
        reader.onloadend = () => {
          dispatch({
            type: 'FAVORITE_ADD',
            data: {imgHash, thumbnail: reader.result}
          });
        };

        reader.readAsDataURL(response.data);
      }).catch(err => {
        console.log('Failed to fetch image', err);
      });
    }
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(FavoritesAdd);
