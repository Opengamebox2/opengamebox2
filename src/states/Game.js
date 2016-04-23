/* globals __DEV__ */
import Phaser from 'phaser';
import EntitySprite from '../sprites/EntitySprite';
import {types, channels} from '../../protocol/protocol';
import AssetLoader from '../AssetLoader';
import socketCluster from 'socketcluster-client';
const socketOptions = {
    port: 8000
};

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
    this.socket = socketCluster.connect(socketOptions);
    this.socket.on('connect', () => {
        console.log('CONNECTED');
    });


    const gameChannel = this.socket.subscribe(channels.GAME);


    this.socket.on(channels.GAME, packet => { this.handlePacket(packet); });
    gameChannel.watch(packet => { this.handlePacket(packet); });

    this.state.add('Socket', this.socket);

    this.input.keyboard.onDownCallback = event => {
      if (event.keyCode === 32) {
        const pos = this.input.position;
        this.socket.emit(channels.GAME, {
          type: types.ENTITY_CREATE_REQUEST,
          data: {
            pos: {x: pos.x, y: pos.y},
            imgHash: document.getElementById('imageHash').value
          }
        });
      }
    };

    this.waitingSprites = {};
  }

  render () {}

  handlePacket(packet) {
    console.log('GOT PACKET', packet);
    switch (packet.type) {
        case types.ENTITY_CREATE:
          packet.data.forEach(entity => {
            this.handleEntityCreate(entity);
          });
        break;
        case types.ENTITY_DELETE:
        const id = packet.data.id;
        const sprite = this.entities[id];
        if (sprite) {
          sprite.destroy();
          delete this.entities[id];
        }
        break;
    }
  }

  handleEntityCreate(entity) {

    let entitySprite = new EntitySprite({
      entity,
      game: this.state.game,
      socket: this.socket
    });

    entitySprite.onDeleteRequest = entityId => {
      this.socket.emit(channels.GAME, {
        type: types.ENTITY_DELETE_REQUEST,
        data: {id: entityId}
      });
    };

    this.assetLoader.loadEntitySprite(entitySprite, entity.imgHash);

    this.entities = Object.assign(this.entities, {[entity.id]: entitySprite});
    this.state.game.add.existing(entitySprite);
  }
}
