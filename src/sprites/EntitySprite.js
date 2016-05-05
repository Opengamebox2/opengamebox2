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

    // callbacks set by caller
    this.onDeleteRequest = () => {};
    this.onSelectRequest = () => {};
    this.onMoveRequest = () => {};

    this.initEventListeners();
    this.updateEntity();

    this.dragStartPos = {x: 0, y: 0};
    this.dragingObjects = [];
    this.selectRequestObjects = [];
  }

  selectEntities() {
    let sortedEntities = _.sortBy(this.entityList, function(entity) { return entity.entity.z;});
    let selectedEntities = [];
    let foundThis = false;
    sortedEntities.forEach((entity, index, array) => {
      if (!foundThis) {
        if (entity.entity.id === this.entity.id) {
          foundThis = true;
        }
        return;
      }
      if (this.overlap(entity)) {
        selectedEntities.push(entity);
        selectedEntities.concat(entity.selectEntities());
      }
    })
    return selectedEntities;
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
          let selectedEntities = []
          if (entitySprite.game.input.keyboard.isDown(Phaser.KeyCode.SHIFT)) {
            selectedEntities = [this].concat(entitySprite.selectEntities());
          } else {
            selectedEntities = [this]
          }
          entitySprite.game.store.dispatch('ENTITY_SELECT_REQUEST', _.map(_.sortBy(selectedEntities, function(entity) { return entity.entity.depth;}), 'entity'));
          this.selectRequestObjects = selectedEntities;
        }
      }
    }, this);

    this.events.onInputUp.add((entitySprite, pointer) => {
      this.pointerDown = null;
    }, this);

    this.events.onDragStop.add((entitySprite) => {
      let dragDistance = {x: entitySprite.x - entitySprite.dragStartPos.x, y: entitySprite.y - entitySprite.dragStartPos.y};
      let dragedEntities = [entitySprite];
      _.forOwn(entitySprite.entityList, (entity) => {
        if (entity.entity.selectedClientId !== entitySprite.game.store.getState().game.player.clientId) {
          return;
        }
        if (entitySprite.entity.id === entity.entity.id) {
          return;
        }
        dragedEntities.push(entity);
      });

      dragedEntities = _.sortBy(dragedEntities, function(entity) { return entity.entity.depth;});
      let entitiesToMove = [];

      _.forOwn(dragedEntities, (entity) => {
        entitiesToMove.push({
          id: entity.entity.id,
          pos: {
            x: entity.entity.pos.x + dragDistance.x,
            y: entity.entity.pos.y + dragDistance.y,
          },
        });
      });
      entitySprite.dragOffset = null;
      this.game.store.dispatch('ENTITY_MOVE_REQUEST', entitiesToMove);
      entitySprite.dragStartPos = {x: 0, y: 0};
      entitySprite.dragingObjects = [];
      entitySprite.selectRequestObjects = [];
    }, this);

    this.events.onDragStart.add((entitySprite, pointer, x, y) => {
      entitySprite.dragOffset = {x: x - entitySprite.x, y: y - entitySprite.y};
      entitySprite.dragStartPos = {x: entitySprite.entity.pos.x, y: entitySprite.entity.pos.y};
      entitySprite.dragingObjects = [];
      
      if (entitySprite.game.input.keyboard.isDown(Phaser.KeyCode.SHIFT)) {
        entitySprite.dragingObjects = entitySprite.selectEntities();
      } else {
        entitySprite.dragingObjects = entitySprite.selectRequestObjects;
        if (entitySprite.dragingObjects.length === 0) {
          _.forOwn(entitySprite.entityList, (entity, id) => {
            if (entitySprite.entity.id !== entity.entity.id) {
              if (entity.entity.selectedClientId === entitySprite.game.store.getState().game.player.clientId) {
                if (!entitySprite.entityList[id].input.isDragged) {
                  entitySprite.dragingObjects.push(entity);
                }
              }
            }
          });
        }
      }
      entitySprite.updateDragPosition(pointer, x, y);
    });

    this.events.onDragUpdate.add((entitySprite, pointer, x, y) => {
      if (pointer.button !== 0) {
        entitySprite.input.stopDrag(pointer);
        return;
      }
      entitySprite.updateDragPosition(pointer, x, y);
    }, this);
  }

  updateDragPosition(pointer, x, y) {
    const pos = this.game.input.getLocalPosition(this.parent, pointer);
    const dragOffset = this.dragOffset || {x: 0, y: 0};
    this.x = pos.x + dragOffset.x;
    this.y = pos.y + dragOffset.y;

    let dragDistance = {x: this.x - this.dragStartPos.x, y: this.y - this.dragStartPos.y};
    this.dragingObjects.forEach(entity => {
      entity.x = dragDistance.x + entity.entity.pos.x;
      entity.y = dragDistance.y + entity.entity.pos.y;
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
