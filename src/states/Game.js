import _ from 'lodash';
import Phaser from 'phaser';
import AssetLoader from '../AssetLoader';
import EntitySprite from '../sprites/EntitySprite';
import Camera from '../Camera';

export default class extends Phaser.State {
  create () {
    this.assetLoader = new AssetLoader(this.game);
    this.entities = {};
    this.cam = new Camera(this.camera, this.game);

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
    this.game.world.setBounds(0, 0, 10000, 10000);
    this.game.input.mouse.mouseWheelCallback = this.mouseWheel.bind(this);
  }

  getGameState() {
    return this.game.store.getState().game;
  }

  update() {
    this.updateCamera();
    this.cam.update();
  }


  mouseWheel(event) {
    event.preventDefault();
    let direction;
    const zoomSpeed = 0.1;

    if (this.game.input.mouse.wheelDelta === Phaser.Mouse.WHEEL_UP) {
      direction = 1;
    } else {
      direction = -1;
    }

    this.cam.setScale(this.cam.getScale() + direction * 0.05);
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
        if (value.zoom) {
          this.cam.setScale(this.cam.getScale() + value.zoom * zoomSpeed);
        } else {
          this.cam.camera.x += value.x * time * scrollSpeed;
          this.cam.camera.y += value.y * time * scrollSpeed;
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
