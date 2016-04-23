import Phaser from 'phaser'

export default class extends Phaser.Sprite {

  constructor ({entity, game}) {
    super(game, entity.pos.x, entity.pos.y, 'mushroom');

    this.game = game;
    this.anchor.setTo(0.5);
    this.entityId = entity.id;
    this.inputEnabled = true;

    // callbacks set by caller
    this.onDeleteRequest = () => {};

    this.initEventListeners();
  }

  initEventListeners() {
    this.events.onInputDown.add((entity) => {
    	this.onDeleteRequest(entity.entityId);
    }, this);
  }

  update () {
  }

}
