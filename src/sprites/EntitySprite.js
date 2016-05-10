import _ from 'lodash';
import Phaser from 'phaser'

export default class extends Phaser.Sprite {

  constructor ({entity, game, entities}) {
    super(game, entity.pos.x, entity.pos.y, 'mushroom');

    this.game = game;
    this.anchor.setTo(0.5);
    this.entity = {id: entity.id};
    this.inputEnabled = true;

    this.entityList = entities;

    this.pointerDown = null;
    this.tween = null;
    this.players = null;

    this.effect = new Phaser.Graphics(this.game, 0, 0);
    this.addChild(this.effect);

    this.initEventListeners();
    this.updateEntity();

    this.dragStartPos = {x: 0, y: 0};
    this.draggingObjects = [];
    this.localSelection = [];
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
          this.localSelection = [entitySprite]

          if (entitySprite.game.input.keyboard.isDown(Phaser.KeyCode.SHIFT)) {
            this.localSelection = this.localSelection.concat(entitySprite.getEntitiesAbove());
          }

          const requestedEntities = _(this.localSelection)
          .sortBy(x => x.entity.z)
          .map('entity')
          .value();

          entitySprite.game.store.dispatch('ENTITY_SELECT_REQUEST', requestedEntities);
        }
      }
    }, this);

    this.events.onInputUp.add((entitySprite, pointer) => {
      this.pointerDown = null;
    }, this);

    this.events.onDragStop.add(entitySprite => {
      const dragDistance = {
        x: entitySprite.x - entitySprite.dragStartPos.x,
        y: entitySprite.y - entitySprite.dragStartPos.y,
      };

      const draggedEntities = _(entitySprite.entityList)
      .values()
      .sortBy(x => x.entity.depth)
      .map(entity => {
        return {
          id: entity.entity.id,
          pos: {
            x: entity.entity.pos.x + dragDistance.x,
            y: entity.entity.pos.y + dragDistance.y,
          },
        };
      })
      .value();

      this.game.store.dispatch('ENTITY_MOVE_REQUEST', draggedEntities);

      entitySprite.dragOffset = null;
      entitySprite.dragStartPos = {x: 0, y: 0};
      entitySprite.draggingObjects = [];
      entitySprite.localSelection = [];
    }, this);

    this.events.onDragStart.add((entitySprite, pointer, x, y) => {
      entitySprite.dragOffset = {x: x - entitySprite.x, y: y - entitySprite.y};
      entitySprite.dragStartPos = {
        x: entitySprite.entity.pos.x,
        y: entitySprite.entity.pos.y,
      };

      if (entitySprite.game.input.keyboard.isDown(Phaser.KeyCode.SHIFT)) {
        entitySprite.draggingObjects = entitySprite.getEntitiesAbove();
      } else {
        entitySprite.draggingObjects = entitySprite.localSelection;
        if (entitySprite.draggingObjects.length === 0) {
          entitySprite.draggingObjects = _(entitySprite.entityList)
          .values()
          .filter(x => x.entity.id !== entitySprite.entity.id)
          .filter(x => x.entity.selectedClientId === entitySprite.game.store.getState().game.player.clientId)
          .filter(x => !x.input.isDragged)
          .value();
        }
      }
      entitySprite.updateDragPosition(pointer, x, y);
    });

    this.events.onDragUpdate.add((entitySprite, pointer, x, y) => {
      if (pointer.button !== 0) {
        entitySprite.input.stopDrag(pointer);
      } else {
        entitySprite.updateDragPosition(pointer, x, y);
      }
    }, this);
  }

  getEntitiesAbove() {
    let selectedEntities = [];
    _(this.entityList)
    .filter(x => x.z > this.z)
    .sortBy(x => x.z)
    .filter(x => this.overlap(x))
    .forEach(entity => {
      selectedEntities.push(entity);
      selectedEntities = selectedEntities.concat(entity.getEntitiesAbove());
    });

    return _.uniqBy(selectedEntities, x => x.entity.id);
  }

  updateDragPosition(pointer, x, y) {
    const pos = this.game.input.getLocalPosition(this.parent, pointer);
    const dragOffset = this.dragOffset || {x: 0, y: 0};
    this.x = pos.x + dragOffset.x;
    this.y = pos.y + dragOffset.y;

    const dragDistance = {
      x: this.x - this.dragStartPos.x,
      y: this.y - this.dragStartPos.y,
    };

    this.draggingObjects.forEach(entity => {
      if (entity.entity.selectedClientId === this.game.store.getState().game.player.clientId) {
        entity.x = dragDistance.x + entity.entity.pos.x;
        entity.y = dragDistance.y + entity.entity.pos.y;
      }
    });
  }

  update() {}

  updateEntity() {
    const gameState = this.game.store.getState().game;
    const oldEntity = this.entity;
    this.entity = gameState.entities[this.entity.id];
    let borderNeedsUpdate = false;

    if (this.entity !== oldEntity) {
      if (this.entity.pos !== oldEntity.pos) {
        this.tween = this.game.add.tween(this).to(this.entity.pos, 300);
        this.tween.start();
      }

      if (this.entity.selectedClientId !== oldEntity.selectedClientId) {
        if (this.entity.selectedClientId === gameState.player.clientId) {
          this.input.enableDrag();
          if (this.pointerDown) {
            this.x += this.pointerDown.pointer.x - this.pointerDown.x;
            this.y += this.pointerDown.pointer.y - this.pointerDown.y;
            this.input.startDrag(this.pointerDown.pointer);
          }
        } else {
          this.input.disableDrag();
        }

        borderNeedsUpdate = true;
      }

      this.z = this.entity.depth;
    }

    if (this.players !== gameState.players) {
      this.players = gameState.players;
      borderNeedsUpdate = true;
    }

    if (borderNeedsUpdate) {
      this.drawBorder();
    }
  }

  drawBorder() {
    this.effect.clear();

    if (this.entity.selectedClientId !== null) {
      const player = this.game.store.getState().game.players[this.entity.selectedClientId];

      let color = '0xcccccc';
      if (player) {
        color = Phaser.Color.HSLtoRGB(player.hue, 1.0, 0.5).color;
      }

      const borderWidth = 4 / this.game.camera.scale.x;
      this.effect.lineStyle(borderWidth, color, 1);
      this.effect.drawRect(
        -this.width / 2 - borderWidth / 2,
        -this.height / 2 - borderWidth / 2,
        this.width + borderWidth,
        this.height + borderWidth
      );
    }
  }
}
