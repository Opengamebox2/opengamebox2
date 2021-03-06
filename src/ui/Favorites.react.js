import _ from 'lodash';
import React from 'react';
import {ListGroup, ListGroupItem, Button, ButtonGroup, Image, Row, Col} from 'react-bootstrap';
import {connect} from 'react-redux';
import FavoritesAdd from './FavoritesAdd.react';

const Favorite = ({
  img, camera, createEntity, deleteFavorite
}) => {
  return (
    <ListGroupItem>
      <Row>
        <Col xs={3}>
          <Image src={img.thumbnail} responsive />
        </Col>
        <Col xs={9} className="extra_small">
          <p>{img.imgHash}</p>
          <ButtonGroup>
          <Button bsStyle="primary" onClick={() => { createEntity(img.imgHash, {x: camera.x, y: camera.y}); }}>
            Create
          </Button>
          <Button bsStyle="danger" onClick={() => { deleteFavorite(img.imgHash); }}>
            Delete
          </Button>
          </ButtonGroup>
        </Col>
      </Row>
    </ListGroupItem>
  );
};

const Favorites = ({
  createEntity, deleteFavorite, images, camera
}) => {
  let favoriteTxt;
  if (images.length === 0) {
    favoriteTxt = 'No favorites';
  } else if (images.length === 1) {
    favoriteTxt = '1 favorite';
  } else {
    favoriteTxt = `${images.length} favorites`;
  }

  return (
    <div>
      <h4>Add new favorite</h4>
      <FavoritesAdd />
      <hr />
      <h4>{favoriteTxt}</h4>
      <ListGroup>
        {
          images.map(img => {
            return (<Favorite key={img.imgHash}
                              img={img}
                              camera={camera}
                              deleteFavorite={deleteFavorite}
                              createEntity={createEntity} />);
          })
        }
      </ListGroup>
    </div>
  );
};

const mapStateToProps = state => {
  const images = [];
  Object.keys(state.settings.images).forEach(imgHash => {
    images.push({imgHash, thumbnail: state.settings.images[imgHash].thumbnail});
  });
  return {
    images,
    camera: state.game.camera
  }
};

const mapDispatchToProps = (dispatch) => {
  return {
    createEntity: (imgHash, pos) => {
      dispatch({
        type: 'ENTITY_CREATE_REQUEST',
        data: [{
          pos,
          imgHash,
          selectedClientId: null
        }]
      });
    },
    deleteFavorite: imgHash => {
      dispatch({
        type: 'FAVORITE_DELETE',
        data: [imgHash]
      });
    }
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Favorites);
