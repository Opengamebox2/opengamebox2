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

  init() {
    this.game.scale.scaleMode = Phaser.ScaleManager.RESIZE;
    this.game.world.setBounds(0, 0, 5000, 5000);
  }

  getGameState() {
    return this.game.store.getState().game;
  }

  update() {
    this.updateCamera();
  }

  updateCamera() {
    const time = this.game.time.elapsed;
    const scrollSpeed = 1;
    const zoomSpeed = 0.01;

    const scrollKeys = [
      {key: Phaser.Keyboard.UP, y: -1, x: 0},
      {key: Phaser.Keyboard.RIGHT, y: 0, x: 1},
      {key: Phaser.Keyboard.DOWN, y: 1, x: 0},
      {key: Phaser.Keyboard.LEFT, y: 0, x: -1},
      {key: Phaser.Keyboard.W, y: -1, x: 0},
      {key: Phaser.Keyboard.D, y: 0, x: 1},
      {key: Phaser.Keyboard.S, y: 1, x: 0},
      {key: Phaser.Keyboard.A, y: 0, x: -1},
      {key: Phaser.Keyboard.Q, zoom: 1},
      {key: Phaser.Keyboard.E, zoom: -1},
    ];

    scrollKeys.forEach(value => {
      if (this.input.keyboard.isDown(value.key)) {
        this.camera.x += value.x ? value.x * time * scrollSpeed : this.camera.x;
        this.camera.y += value.y ? value.y * time * scrollSpeed : this.camera.y;
        if (value.zoom) {
          let scale = this.camera.scale.x;
          scale += value.zoom * zoomSpeed;
          scale = Phaser.Math.clamp(scale, 0.25, 2);
          this.camera.scale.setTo(scale);
        }
      }
    });
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
