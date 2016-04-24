import _ from 'lodash';
import Phaser from 'phaser'
import {store} from '../ui/App.js'

export default class extends Phaser.Sprite {

  constructor ({entity, game, clientId}) {
    super(game, entity.pos.x, entity.pos.y, 'mushroom');

    this.game = game;
    this.anchor.setTo(0.5);
    this.entity = entity;
    this.inputEnabled = true;
    this.clientId = clientId;

    this.pointerDown = null;
    this.tween = null;
    // callbacks set by caller
    this.onDeleteRequest = () => {};
    this.onSelectRequest = () => {};
    this.onMoveRequest = () => {};

    this.initEventListeners();
    this.updateEntity(entity);
  }

  initEventListeners() {
    this.events.onInputDown.add((entitySprite, pointer) => {
      const selectedClientId = entitySprite.entity.selectedClientId;
      if (selectedClientId === null || selectedClientId === this.clientId) {
        if (this.tween) {
          this.tween.stop();
        }
        this.pointerDown = {pointer, x: pointer.x, y: pointer.y};
      }

      if (selectedClientId === null) {
        this.onSelectRequest({id: entitySprite.entity.id});
      }
    }, this);

    this.events.onInputUp.add((entitySprite, pointer) => {
      this.pointerDown = null;
    }, this);

    this.events.onDragStop.add(entitySprite => {
      const x = entitySprite.x;
      const y = entitySprite.y;
      this.onMoveRequest({id: entitySprite.entity.id, pos: {x, y}});
    }, this);

    // TODO: Only update color when store->players changes
    store.subscribe(() => { this.updateColor() });
  }

  update() {}

  updateEntity(entity) {
    Object.assign(this.entity, entity);

    if (entity.pos) {
      this.tween = this.game.add.tween(this).to(this.entity.pos, 300);
      this.tween.start();
    }

    if (_.has(entity, 'selectedClientId')) {
      this.updateColor();

      if (this.entity.selectedClientId === this.clientId) {
        this.input.enableDrag();
        if (this.pointerDown) {
          this.x += this.pointerDown.pointer.x - this.pointerDown.x;
          this.y += this.pointerDown.pointer.y - this.pointerDown.y;
          this.input.startDrag(this.pointerDown.pointer);
        }
      } else {
        this.input.disableDrag();
      }
    }

    this.z = this.entity.depth;
  }

  updateColor() {
    if (this.entity.selectedClientId !== null) {
      const player = store.getState().players[this.entity.selectedClientId];
      if (player) {
        this.tint = Phaser.Color.HSLtoRGB(player.hue, 1.0, 0.9).color;
      } else {
        this.tint = 0xcccccc;
      }
    } else {
      this.tint = 0xffffff;
    }
  }
}
