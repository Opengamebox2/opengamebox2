import _ from 'lodash';
import Phaser from 'phaser';
import AssetLoader from '../AssetLoader';
import EntitySprite from '../sprites/EntitySprite';
import Camera from '../Camera';

export default class extends Phaser.State {
  init() {
    this.game.scale.scaleMode = Phaser.ScaleManager.RESIZE;
    this.game.world.setBounds(0, 0, Math.pow(2, 52), Math.pow(2, 52));
    this.game.input.mouse.mouseWheelCallback = this.mouseWheel.bind(this);
  }

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
    this.cam.setPosition(this.game.store.getState().game.camera.x,
      this.game.store.getState().game.camera.y);
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

    if (this.game.input.mouse.wheelDelta === Phaser.Mouse.WHEEL_UP) {
      direction = 1;
    } else {
      direction = -1;
    }

    this.cam.setScale(this.cam.getScale() * (1 + direction * 0.15));
  }

  updateCamera() {
    const time = this.game.time.elapsed;
    const scrollSpeed = 1;
    const zoomSpeed = 0.0012;

    [
      {key: Phaser.Keyboard.LEFT,  x: -1},
      {key: Phaser.Keyboard.RIGHT, x: 1},
      {key: Phaser.Keyboard.UP,    y: -1},
      {key: Phaser.Keyboard.DOWN,  y: 1},

      {key: Phaser.Keyboard.A,     x: -1},
      {key: Phaser.Keyboard.D,     x: 1},
      {key: Phaser.Keyboard.W,     y: -1},
      {key: Phaser.Keyboard.S,     y: 1},

      {key: Phaser.Keyboard.E,     zoom: -1},
      {key: Phaser.Keyboard.Q,     zoom: 1},
    ].forEach(value => {
      if (this.input.keyboard.isDown(value.key)) {
        if (value.x || value.y) {
          this.cam.move(_.get(value, 'x', 0) * time * scrollSpeed,
                        _.get(value, 'y', 0) * time * scrollSpeed);
        }

        if (value.zoom) {
          const factor = Math.pow(1 + value.zoom * zoomSpeed, time);
          this.cam.setScale(this.cam.getScale() * factor);
        }
      }
    });

    const ap = this.input.activePointer;
    if (ap.middleButton.isDown) {
      if (this.lastActivePointer && this.lastActivePointer.timeDown === ap.timeDown) {
        const amountX = this.lastActivePointer.x - ap.x;
        const amountY = this.lastActivePointer.y - ap.y;
        this.cam.move(amountX, amountY);
      }

      this.lastActivePointer = {
        x: ap.x,
        y: ap.y,
        timeDown: ap.timeDown,
      }
    }
  }

  addInputCallbacks() {
    this.input.keyboard.onDownCallback = event => {
      switch (event.keyCode) {
      case 46: {
        const selection = _(this.entities)
                          .map(x => x.entity)
                          .pickBy({selectedClientId: this.getGameState().player.clientId})
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
