import Phaser from 'phaser'

export default class extends Phaser.Sprite {

  constructor ({entity, game, socketClientId}) {
    super(game, entity.pos.x, entity.pos.y, 'mushroom');

    this.game = game;
    this.anchor.setTo(0.5);
    this.entity = entity;
    this.inputEnabled = true;
    this.socketClientId = socketClientId;

    // callbacks set by caller
    this.onDeleteRequest = () => {};
    this.onSelectRequest = () => {};

    this.initEventListeners();
  }

  initEventListeners() {
    this.events.onInputDown.add((entitySprite) => {
    	if (entitySprite.entity.selectedClientId === null) {
    		this.onSelectRequest(entitySprite.entity.id);
    	}
    }, this);
  }

  update () {
  	if (this.entity.selectedClientId === this.socketClientId) {
  		this.tint = 0xccffff;
  	} else if (this.entity.selectedClientId !== null) {
  		this.tint = 0xffccff;
  	} else {
  		this.tint = 0xffffff;
  	}
  }

  updateEntity(entity) {
  	Object.assign(this.entity, entity);
  }

}
