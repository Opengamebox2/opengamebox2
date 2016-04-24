import _ from 'lodash';
import Phaser from 'phaser';
import AssetLoader from '../AssetLoader';
import EntitySprite from '../sprites/EntitySprite';

export default class extends Phaser.State {
  create () {
    this.assetLoader = new AssetLoader(this.game);
    this.entities = {};
    this.clientId = null;

    this.game.stage.disableVisibilityChange = true;
    this.group = this.game.add.group();
    this.load.crossOrigin = 'anonymous';

    this.initListeners();
    this.addInputCallbacks();

    this.game.store.dispatch('CONNECT');
  }

  initListeners() {
    if (localStorage.player) {
      this.player = JSON.parse(localStorage.player);
    } else {
      this.player = {authToken: uuid.v4()};
      localStorage.player = JSON.stringify(this.player);
    }

    this.game.store.on('CONNECTED', () => {
      this.game.store.dispatch('HANDSHAKE', {authToken: this.player.authToken});
    });

    this.game.store.on('HANDSHAKE_REPLY', data => {
      this.clientId = data.id;
    });

    this.game.store.on('PLAYER_JOIN', players => {
      players.forEach(player => {
        console.log(`Player '${player.id}' joined the game!`);
      });
    });

    this.game.store.on('PLAYER_LEAVE', players => {
      players.forEach(player => {
        console.log(`Player '${player.id}' left the game!`);
      });
    });

    this.game.store.on('ENTITY_CREATE', entities => {
      entities.forEach(entity => {
        this.handleEntityCreate(entity);
      });
      this.group.sort();
    });

    this.game.store.on('ENTITY_DELETE', entities => {
      entities.forEach(entity => {
        const id = entity.id;
        const sprite = this.entities[id];
        if (sprite) {
          sprite.destroy();
          delete this.entities[id];
        }
      });
    });

    this.game.store.on('ENTITY_SELECT', entities => {
      this.updateEntities(entities);
    });

    this.game.store.on('ENTITY_MOVE', entities => {
      this.updateEntities(entities);
    });
  }

  addInputCallbacks() {
    this.input.keyboard.onDownCallback = event => {
      switch (event.keyCode) {
      case 32: {
        const pos = this.input.position;
        this.game.store.dispatch('ENTITY_CREATE_REQUEST',
          [{
            pos: {x: pos.x, y: pos.y},
            imgHash: document.getElementById('imageHash').value,
            selectedClientId: null,
          }]
        );
      } break

      case 46: {
        const selection = _(this.entities)
                          .map(x => x.entity)
                          .pickBy({selectedClientId: this.clientId})
                          .values()
                          .map(entity => { return {id: entity.id}; })
                          .value();

        if (selection.length > 0) {
          this.game.store.dispatch('ENTITY_DELETE_REQUEST', selection);
        }
      } break;
      }
    }
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
      this.game.store.dispatch('ENTITY_SELECT_REQUEST', [entity]);
    };

    entitySprite.onMoveRequest = entity => {
      this.game.store.dispatch('ENTITY_MOVE_REQUEST', [entity]);
    };

    this.assetLoader.loadEntitySprite(entitySprite, entity.imgHash);
    this.entities[entity.id] = entitySprite;
    this.state.game.add.existing(entitySprite);
    this.group.add(entitySprite);
  }
}
