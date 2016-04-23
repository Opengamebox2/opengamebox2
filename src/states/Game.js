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
    const loader = new Phaser.Loader(this);

    let entitySprite = new Mushroom({
      game: this.state.game,
      x: entity.pos.x,
      y: entity.pos.y,
      asset: 'mushroom'
    });

    entitySprite._id = entity.id;
    entitySprite.inputEnabled = true;
    entitySprite.events.onInputDown.add((entity) => {
      const id = entity._id;
      this.socket.emit(channels.GAME, {
        type: types.ENTITY_DELETE_REQUEST,
        data: {id}
      });

    }, this);

    loader.onFileComplete.add((progress, cacheKey, success, totalLoaded, totalFiles) => {
      if (this.waitingSprites[cacheKey]) {
        console.log(`LOADED ${cacheKey} ${progress}`);
        this.waitingSprites[cacheKey].forEach(sprite => {
          sprite.loadTexture(cacheKey);
        });
        document.getElementById('imageHashes').innerHTML += cacheKey + '\n';
        delete this.waitingSprites[cacheKey];
      };
    });

    if (!this.cache.checkImageKey(entity.imgHash)) {
      if (!this.waitingSprites[entity.imgHash]) {
        loader.crossOrigin = 'anonymous';
        console.log(`Loading ${entity.imgHash}`);
        loader.image(entity.imgHash, `https://gateway.ipfs.io/ipfs/${entity.imgHash}`);

        this.waitingSprites[entity.imgHash] = [entitySprite];
        loader.start();
      } else {
        this.waitingSprites[entity.imgHash].push(entitySprite);
      }
    } else {
      entitySprite.loadTexture(entity.imgHash);
    }

    

    if (!this.entities) { this.entities = {} }
    this.entities = Object.assign(this.entities, {[entity.id]: entitySprite});
    this.state.game.add.existing(entitySprite);
  }
}
