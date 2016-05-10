import _ from 'lodash';
import Phaser from 'phaser';
import AssetLoader from '../AssetLoader';
import EntitySprite from '../sprites/EntitySprite';
import Camera from '../Camera';

const LEFT_BUTTON = 0;

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

    this.game.input.onDown.add(pointer => {
      if (pointer.button === LEFT_BUTTON && !this.overlapsEntity(pointer)) {
        const x = this.cam.getPointerX();
        const y = this.cam.getPointerY();
        this.boxSelect.startPos = {x, y};
        this.boxSelect.rectangle.setTo(x, y, 0, 0);
        this.boxSelect.graphics.x = x;
        this.boxSelect.graphics.y = y;
      }
    });

    this.game.input.onUp.add(pointer => {
      if (pointer.button === LEFT_BUTTON && this.boxSelect.startPos) {
        let entities = _(this.entities)
          .filter(e => {
            const left = e.position.x - e.width / 2;
            const right = e.position.x + e.width / 2;
            const top = e.position.y - e.height / 2;
            const bottom = e.position.y + e.height / 2;
            return this.boxSelect.rectangle.intersectsRaw(left, right, top, bottom);
          })
          .sortBy(e => e.entity.depth)
          .map(e => { return {id: e.entity.id}; })
          .value();

        this.game.store.dispatch('ENTITY_SELECT_REQUEST', entities);

        this.boxSelect.startPos = null;
        this.boxSelect.rectangle.setTo(0,0,0,0);
        this.boxSelect.graphics.clear();
      }
    });

    this.boxSelect = {
      startPos: null,
      rectangle: new Phaser.Rectangle(0, 0, 0, 0),
      graphics: new Phaser.Graphics(this.game, 0, 0)
    };
    this.group.add(this.boxSelect.graphics);
  }

  overlapsEntity(pointer) {
    return _.some(this.entities, x => x.getBounds().contains(pointer.x, pointer.y));
  }

  getGameState() {
    return this.game.store.getState().game;
  }

  update() {
    this.updateCamera();
    this.cam.update();
    this.updateBoxSelect();
  }

  render() {
    this.renderBoxSelect();
  }

  renderBoxSelect() {
    if (this.boxSelect.startPos) {
      const rect = this.boxSelect.rectangle;
      const graphics = this.boxSelect.graphics;
      const xDir = rect.x < this.boxSelect.startPos.x ? -1 : 1;
      const yDir = rect.y < this.boxSelect.startPos.y ? -1 : 1;
      const borderWidth = 2;

      graphics.clear();

      graphics.beginFill('0x000000', 0.3);
      graphics.drawRect(
        xDir * -borderWidth,
        yDir * -borderWidth,
        xDir * rect.width + xDir * borderWidth * 2,
        yDir * rect.height + yDir * borderWidth * 2);
      graphics.endFill();

      graphics.beginFill('0xffffff', 0.3);
      graphics.drawRect(0, 0, xDir * rect.width, yDir * rect.height);
      graphics.endFill();
    }
  }

  updateBoxSelect() {
    if (this.boxSelect.startPos) {
      const startPos = this.boxSelect.startPos;
      const x = this.cam.getPointerX();
      const y = this.cam.getPointerY();

      this.boxSelect.rectangle.setTo(
        Math.min(x, startPos.x),
        Math.min(y, startPos.y),
        Math.abs(x - startPos.x),
        Math.abs(y - startPos.y)
      );
    }
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
    this.game.canvas.oncontextmenu = e => { e.preventDefault(); };

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
      entities: this.entities,
    });

    entitySprite.onSelectRequest = entity => {
      this.game.store.dispatch('ENTITY_SELECT_REQUEST', [entity]);
    };

    this.assetLoader.loadEntitySprite(entitySprite, entity.imgHash);
    this.entities[entity.id] = entitySprite;
    this.state.game.add.existing(entitySprite);
    this.group.add(entitySprite);
  }
}
