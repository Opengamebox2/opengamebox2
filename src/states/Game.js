/* globals __DEV__ */
import Phaser from 'phaser';
import Mushroom from '../sprites/Mushroom';
import {types, channels} from '../../protocol/protocol';
import socketCluster from 'socketcluster-client';
const socketOptions = {
    port: 8000
};

export default class extends Phaser.State {
  init () {}
  preload () {}

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
      const pos = this.input.position;
      this.socket.emit(channels.GAME, {
        type: types.ENTITY_CREATE_REQUEST,
        data: {
          pos: {x: pos.x, y: pos.y},
          imgHash: 'kakaka'
        }
      });
    };
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
    let mushroom = new Mushroom({
      game: this.state.game,
      x: entity.pos.x,
      y: entity.pos.y,
      asset: 'mushroom'
    });
    mushroom._id = entity.id;

    mushroom.inputEnabled = true;
    mushroom.events.onInputDown.add((entity) => {
      const id = entity._id;
      this.socket.emit(channels.GAME, {
        type: types.ENTITY_DELETE_REQUEST,
        data: {id}
      });

    }, this);

    if (!this.entities) { this.entities = {} }
    this.entities = Object.assign(this.entities, {[entity.id]: mushroom});
    this.state.game.add.existing(mushroom);
  }
}
