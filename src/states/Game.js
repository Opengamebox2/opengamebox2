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
    this.game.world.setBounds(0, 0, 10000, 10000);
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
        if (value.zoom) {
            const scaleMinLimit = Math.max(this.game.width / this.game.world.bounds.width,
                this.game.height / this.game.world.bounds.height);
            const scaleMaxLimit = 2.5;

            const cameraXBorderDistance = (this.camera.x / this.camera.scale.x);
            const cameraXPointerDistance = (this.game.input.worldX / this.camera.scale.x) - cameraXBorderDistance;
            const cameraWidth = this.game.width / this.camera.scale.x;
            let scaleX = this.camera.scale.x;
            scaleX += value.zoom * zoomSpeed;
            scaleX = Phaser.Math.clamp(scaleX, scaleMinLimit, scaleMaxLimit);

            const cameraYBorderDistance = (this.camera.y / this.camera.scale.y);
            const cameraYPointerDistance = (this.game.input.worldY / this.camera.scale.y) - (this.camera.y / this.camera.scale.y);
            const cameraHeight = this.game.height / this.camera.scale.y;
            let scaleY = this.camera.scale.y;
            scaleY += value.zoom * zoomSpeed;
            scaleY = Phaser.Math.clamp(scaleY, scaleMinLimit, scaleMaxLimit);

            this.camera.scale.setTo(scaleX, scaleY);


            const newCameraWidth = this.game.width / this.camera.scale.x;
            const newCameraXPointerDistance = (cameraXPointerDistance * newCameraWidth) / cameraWidth;
            const newCameraXBorderDistanceDiff = newCameraXPointerDistance - cameraXPointerDistance;
            const newCameraXPos = cameraXBorderDistance - newCameraXBorderDistanceDiff;
            this.camera.x = newCameraXPos * this.camera.scale.x;


            const newCameraHeight = this.game.height / this.camera.scale.y;
            const newCameraYPointerDistance = (cameraYPointerDistance * newCameraHeight) / cameraHeight;
            const newCameraYBorderDistanceDiff = newCameraYPointerDistance - cameraYPointerDistance;
            const newCameraYPos = cameraYBorderDistance - newCameraYBorderDistanceDiff;
            this.camera.y = newCameraYPos * this.camera.scale.y;
        } else {
            this.camera.x += value.x !== undefined ? value.x * time * scrollSpeed : this.camera.x;
            this.camera.y += value.y !== undefined ? value.y * time * scrollSpeed : this.camera.y;
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
