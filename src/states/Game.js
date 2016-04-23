/* globals __DEV__ */
import Phaser from 'phaser';
import EntitySprite from '../sprites/EntitySprite';
import {types, channels} from '../../protocol/protocol';
import AssetLoader from '../AssetLoader';

import io from 'socket.io-client';


export default class extends Phaser.State {
  init () {
    this.assetLoader = new AssetLoader(this.game);
    this.entities = {};
  }
  preload () {
    this.load.crossOrigin = 'anonymous';
  }

  create () {
    this.game.stage.disableVisibilityChange = true;

    // not sure if storing socket in game state makes actual sense
    this.socket = io(`http://${window.location.hostname}:8000`);
    this.socket.on('connect', () => {
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
        console.log(this.socket.id);

        Object.keys(this.entities).forEach(key => {
          console.log(this.entities[key].entity);
          const entity = this.entities[key].entity;
          if (entity.selectedClientId === this.socket.id) {
            this.socket.emit(types.ENTITY_DELETE_REQUEST, [{id: entity.id}]);
          }
        });
      }
    };

    this.waitingSprites = {};
  }

  render () {}

  initListeners() {
    this.socket.on(types.ENTITY_CREATE, entityArr => {
      entityArr.forEach(entity => {
        console.log(entity);
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
  }

  handleEntityCreate(entity) {
    let entitySprite = new EntitySprite({
      entity,
      game: this.state.game,
      socketClientId: this.socket.id
    });

    entitySprite.onSelectRequest = entityId => {
      this.socket.emit(types.ENTITY_SELECT_REQUEST, [{id: entityId}]);
    };

    this.assetLoader.loadEntitySprite(entitySprite, entity.imgHash);

    this.entities = Object.assign(this.entities, {[entity.id]: entitySprite});
    this.state.game.add.existing(entitySprite);
  }
}
