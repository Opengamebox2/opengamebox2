import React from 'react';
import {Button, FormControl, FormGroup, ControlLabel} from 'react-bootstrap';
import {connect} from 'react-redux';
import {reduxForm} from 'redux-form';
import axios from 'axios';
const ipfsGateway = 'https://gateway.ipfs.io/ipfs';

let FavoritesAdd = ({
  addFavorite, fields
}) => {
  const {imgHash} = fields;
  return (
    <div>
      <FormGroup>
        <ControlLabel>Image hash</ControlLabel>
        <FormControl type="text" {...imgHash}
                     placeholder="QmWgeQPGVn2s9akWmxqzD9UHjNzvwjayrtG2bnH4F48Cc6" />
      </FormGroup>
      <Button bsStyle="primary"
          disabled={imgHash.error !== undefined}
          onClick={() => { addFavorite(imgHash.value); }}>Create</Button>
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

const mapStateToProps = () => { return {}; };

const mapDispatchToProps = dispatch => {
  return {
    addFavorite: imgHash => {
      axios.get(`${ipfsGateway}/${imgHash}`, {
        responseType: 'blob'
      }).then(response => {
        console.log(response);
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
