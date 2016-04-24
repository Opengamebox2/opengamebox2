/* globals __DEV__ */
import Phaser from 'phaser';
import EntitySprite from '../sprites/EntitySprite';
import {types, channels} from '../../protocol/protocol';
import AssetLoader from '../AssetLoader';
import uuid from 'uuid';
import io from 'socket.io-client';


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
        Object.keys(this.entities).forEach(key => {
          const entity = this.entities[key].entity;
          if (entity.selectedClientId === this.clientId) {
            this.socket.emit(types.ENTITY_DELETE_REQUEST, [{id: entity.id}]);
          }
        });
      }
    };

    this.waitingSprites = {};
  }

  render () {}

  initListeners() {
    this.socket.on(types.HANDSHAKE_REPLY, data => {
      this.clientId = data.id;
    });

    this.socket.on(types.ENTITY_CREATE, entityArr => {
      entityArr.forEach(entity => {
        this.handleEntityCreate(entity);
      });
    });

    this.socket.on(types.ENTITY_DELETE, entityArr => {
      entityArr.forEach(entity => {
        const id = entity.id;
        const sprite = this.entities[id];
        if (sprite) {
          sprite.destroy();
          delete this.entities[id];
        }
      });
    });

    this.socket.on(types.ENTITY_SELECT, entityArr => {
      entityArr.forEach(entity => {
        this.entities[entity.id].updateEntity(entity);
      });
    });

    this.socket.on(types.ENTITY_MOVE, entityArr => {
      entityArr.forEach(entity => {
        this.entities[entity.id].updateEntity(entity);
      });
    });
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

    this.entities = Object.assign(this.entities, {[entity.id]: entitySprite});
    this.state.game.add.existing(entitySprite);
  }
}
