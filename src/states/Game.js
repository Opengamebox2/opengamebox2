import _ from 'lodash';
import Phaser from 'phaser';
import AssetLoader from '../AssetLoader';
import EntitySprite from '../sprites/EntitySprite';

export default class extends Phaser.State {
  create () {
    this.assetLoader = new AssetLoader(this.game);
    this.entities = {};

    this.game.stage.disableVisibilityChange = true;
    this.group = this.game.add.group();
    this.load.crossOrigin = 'anonymous';

    this.addInputCallbacks();

    this.game.store.dispatch('CONNECT');

    this.game.store.subscribe(() => {
      const lastAction = this.game.store.getState().lastAction;
      const entities = this.getGameState().entities;
      _.forOwn(entities, (entity, id) => {
        if (!this.entities[id]) {
          this.handleEntityCreate(entity);
        }
      });

      _.forOwn(this.entities, (entity, id) => {
        if (!entities[id]) {
          entity.destroy();
          delete this.entities[id];
        }
      });

      _.forOwn(this.entities, entity => entity.updateEntity());

      this.group.sort();
    });
  }

  getGameState() {
    return this.game.store.getState().game;
  }

  addInputCallbacks() {
    this.input.keyboard.onDownCallback = event => {
      switch (event.keyCode) {
      case 46: {
        const selection = _(this.entities)
                          .map(x => x.entity)
                          .pickBy({selectedClientId: this.getGameState().clientId})
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

  handleEntityCreate(entity) {
    let entitySprite = new EntitySprite({
      entity,
      game: this.state.game,
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
