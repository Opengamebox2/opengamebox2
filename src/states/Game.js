/* globals __DEV__ */
import Phaser from 'phaser';
import EntitySprite from '../sprites/EntitySprite';
import {types, channels} from '../../protocol/protocol';
import AssetLoader from '../AssetLoader';
import uuid from 'uuid';
import io from 'socket.io-client';
import {store} from '../ui/App.js';

export default class extends Phaser.State {
  init () {
    this.assetLoader = new AssetLoader(this.game);
    this.entities = {};

    if (localStorage.player) {
      this.player = JSON.parse(localStorage.player);
    } else {
      this.player = {authToken: uuid.v4()};
      localStorage.player = JSON.stringify(this.player);
    }

    this.clientId = null;
  }
  preload () {
    this.load.crossOrigin = 'anonymous';
  }

  create () {
    this.game.stage.disableVisibilityChange = true;

    // not sure if storing socket in game state makes actual sense
    this.socket = io(`http://${window.location.hostname}:8000`);
    this.socket.on('connect', () => {
      this.socket.emit(types.HANDSHAKE, {authToken: this.player.authToken});
      console.log('CONNECTED');
    });

    this.initListeners();

    this.state.add('Socket', this.socket);

    this.input.keyboard.onDownCallback = event => {
      if (event.keyCode === 32) {
        const pos = this.input.position;
        this.socket.emit(types.ENTITY_CREATE_REQUEST, 
          [{
            pos: {x: pos.x, y: pos.y},
            imgHash: document.getElementById('imageHash').value,
            selectedClientId: null
          }]);
      } else if (event.keyCode === 46) {
        _.forOwn(this.entities, (id, entity) => {
          if (entity.selectedClientId === this.clientId) {
            this.socket.emit(types.ENTITY_DELETE_REQUEST, [{id}]);
          }
        });
      }
    };

    this.group = this.game.add.group();
  }

  render () {}

  initListeners() {
    this.socket.on(types.HANDSHAKE_REPLY, data => {
      this.clientId = data.id;
    });

    this.socket.on(types.PLAYER_JOIN, players => {
      store.dispatch({type: types.PLAYER_JOIN, data: players});
      players.forEach(player => {
        console.log(`Player '${player.id}' joined the game!`);
      });
    });

    this.socket.on(types.PLAYER_LEAVE, players => {
      store.dispatch({type: types.PLAYER_LEAVE, data: players});
      players.forEach(player => {
        console.log(`Player '${player.id}' left the game!`);
      });
    });

    this.socket.on(types.ENTITY_CREATE, entities => {
      entities.forEach(entity => {
        this.handleEntityCreate(entity);
      });
      this.group.sort();
    });

    this.socket.on(types.ENTITY_DELETE, entities => {
      entities.forEach(entity => {
        const id = entity.id;
        const sprite = this.entities[id];
        if (sprite) {
          sprite.destroy();
          delete this.entities[id];
        }
      });
    });

    this.socket.on(types.ENTITY_SELECT, entities => {
      this.updateEntities(entities);
    });

    this.socket.on(types.ENTITY_MOVE, entities => {
      this.updateEntities(entities);
    });
  }

  updateEntities(entities) {
    entities.forEach(entity => {
      this.entities[entity.id].updateEntity(entity);
    });
    this.group.sort();
  }

  handleEntityCreate(entity) {
    let entitySprite = new EntitySprite({
      entity,
      game: this.state.game,
      clientId: this.clientId
    });

    entitySprite.onSelectRequest = entity => {
      this.socket.emit(types.ENTITY_SELECT_REQUEST, [entity]);
    };

    entitySprite.onMoveRequest = entity => {
      this.socket.emit(types.ENTITY_MOVE_REQUEST, [entity]);
    };

    this.assetLoader.loadEntitySprite(entitySprite, entity.imgHash);
    this.entities[entity.id] = entitySprite;
    this.state.game.add.existing(entitySprite);
    this.group.add(entitySprite);
  }
}
