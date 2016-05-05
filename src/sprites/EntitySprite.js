import _ from 'lodash';
import Phaser from 'phaser'

export default class extends Phaser.Sprite {

  constructor ({entity, game}) {
    super(game, entity.pos.x, entity.pos.y, 'mushroom');

    this.game = game;
    this.anchor.setTo(0.5);
    this.entity = {id: entity.id};
    this.inputEnabled = true;

    this.pointerDown = null;
    this.tween = null;
    this.players = null;

    // callbacks set by caller
    this.onDeleteRequest = () => {};
    this.onSelectRequest = () => {};
    this.onMoveRequest = () => {};

    this.initEventListeners();
    this.updateEntity();
  }

  initEventListeners() {
    this.events.onInputDown.add((entitySprite, pointer) => {
      if (pointer.button === 0) {
        const selectedClientId = entitySprite.entity.selectedClientId;
        if (selectedClientId === null || selectedClientId === this.game.store.getState().game.player.clientId) {
          if (this.tween) {
            this.tween.stop();
          }
          this.pointerDown = {pointer, x: pointer.x, y: pointer.y};
        }

        if (selectedClientId === null) {
          this.onSelectRequest({id: entitySprite.entity.id});
        }
      }
    }, this);

    this.events.onInputUp.add((entitySprite, pointer) => {
      this.pointerDown = null;
    }, this);

    this.events.onDragStop.add(entitySprite => {
      const x = entitySprite.x;
      const y = entitySprite.y;
      this.onMoveRequest({id: entitySprite.entity.id, pos: {x, y}});
      entitySprite.dragOffset = null;
    }, this);

    this.events.onDragStart.add((entitySprite, pointer, x, y) => {
      entitySprite.dragOffset = {x: x - entitySprite.x, y: y - entitySprite.y};
      entitySprite.updateDragPosition(pointer);
    });

    this.events.onDragUpdate.add((entitySprite, pointer, x, y) => {
      if (pointer.button !== 0) {
        entitySprite.input.stopDrag(pointer);
      } else {
        entitySprite.updateDragPosition(pointer);
      }
    }, this);
  }

  updateDragPosition(pointer) {
    const pos = this.game.input.getLocalPosition(this.parent, pointer);
    const dragOffset = this.dragOffset || {x: 0, y: 0};
    this.x = pos.x + dragOffset.x;
    this.y = pos.y + dragOffset.y;
  }

  update() {}

  updateEntity() {
    const gameState = this.game.store.getState().game;
    const newEntity = gameState.entities[this.entity.id];
    let colorNeedsUpdate = false;

    if (newEntity !== this.entity) {
      if (newEntity.pos !== this.entity.pos) {
        this.tween = this.game.add.tween(this).to(newEntity.pos, 300);
        this.tween.start();
      }

      if (newEntity.selectedClientId !== this.entity.selectedClientId) {
        if (newEntity.selectedClientId === gameState.player.clientId) {
          this.input.enableDrag();
          if (this.pointerDown) {
            this.x += this.pointerDown.pointer.x - this.pointerDown.x;
            this.y += this.pointerDown.pointer.y - this.pointerDown.y;
            this.input.startDrag(this.pointerDown.pointer);
          }
        } else {
          this.input.disableDrag();
        }

        colorNeedsUpdate = true;
      }

      this.z = newEntity.depth;
      this.entity = newEntity;
    }

    if (this.players !== gameState.players) {
      this.players = gameState.players;
      colorNeedsUpdate = true;
    }

    if (colorNeedsUpdate) {
      this.updateColor();
    }
  }

  updateColor() {
    if (this.entity.selectedClientId !== null) {
      const player = this.game.store.getState().game.players[this.entity.selectedClientId];
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
