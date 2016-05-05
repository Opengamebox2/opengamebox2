import _ from 'lodash';

export default class Camera {
  constructor(camera, game) {
    this.camera = camera;
    this.game = game;

    this.zoomScale = 1;
    this.zoomEndTime = null;

    this.absoluteMinimum = 0.023;

    this.dispatchCameraMove = _.throttle(data => {
      this.dispatch('CAMERA_MOVE', data);
    }, 500);

    this.onScaleChange = () => {};
  }

  update() {
    const zoomLeft = this.zoomScale - this.camera.scale.x;

    if (Math.abs(zoomLeft) > 0) {
      const timeLeft  =  this.zoomEndTime - Date.now();
      const time = this.game.time.elapsed;
      let adjust = zoomLeft;
      if (timeLeft > 10) {
        adjust = time * zoomLeft / timeLeft;
      }

      this.zoomTo(adjust, this.getPointerX(), this.getPointerY());
      this.onScaleChange();
    }
  }

  setScale(amount) {
    amount = Math.max(amount, this.getScaleMinLimit());
    amount = Math.min(amount, this.getScaleMaxLimit());
    this.zoomScale = amount;
    this.zoomEndTime = Date.now() + 100;
  }

  getScale() {
    return this.zoomScale;
  }

  getPointerX() {
    return this.game.input.worldX / this.camera.scale.x;
  }

  getPointerY() {
    return this.game.input.worldY / this.camera.scale.y;
  }

  getScaleMinLimit() {
    return Math.max(this.game.width / this.game.world.bounds.width,
    this.game.height / this.game.world.bounds.height, this.absoluteMinimum);
  }

  getScaleMaxLimit() {
    return 2.5;
  }

  move(x, y) {
    this.setPosition(this.camera.x + x, this.camera.y + y);
  }

  getCameraWidth() {
    return this.game.width / this.camera.scale.x;
  }

  getCameraHeight() {
    return this.game.height / this.camera.scale.y;
  }

  setPosition(x, y) {
    this.camera.x = x;
    this.camera.y = y;
    this.dispatchCameraMove({
      x: this.camera.x / this.camera.scale.x + this.getCameraWidth() / 2,
      y: this.camera.y / this.camera.scale.y + this.getCameraHeight() / 2
    });
  }

  dispatch(type, data) {
    this.game.store.dispatch(type, data);
  }

  zoomTo(amount, x, y) {
    const scaleMinLimit = this.getScaleMinLimit();
    const scaleMaxLimit = this.getScaleMaxLimit();

    const cameraXBorderDistance = (this.camera.x / this.camera.scale.x);
    const cameraXPointerDistance = x - cameraXBorderDistance;
    const cameraWidth = this.game.width / this.camera.scale.x;
    let scaleX = this.camera.scale.x;
    scaleX += amount;
    scaleX = Phaser.Math.clamp(scaleX, scaleMinLimit, scaleMaxLimit);

    const cameraYBorderDistance = (this.camera.y / this.camera.scale.y);
    const cameraYPointerDistance = y - (this.camera.y / this.camera.scale.y);
    const cameraHeight = this.game.height / this.camera.scale.y;
    let scaleY = this.camera.scale.y;
    scaleY += amount;
    scaleY = Phaser.Math.clamp(scaleY, scaleMinLimit, scaleMaxLimit);

    this.camera.scale.setTo(scaleX, scaleY);

    const newCameraWidth = this.game.width / this.camera.scale.x;
    const newCameraXPointerDistance = (cameraXPointerDistance * newCameraWidth) / cameraWidth;
    const newCameraXBorderDistanceDiff = newCameraXPointerDistance - cameraXPointerDistance;
    const newCameraXPos = cameraXBorderDistance - newCameraXBorderDistanceDiff;


    const newCameraHeight = this.game.height / this.camera.scale.y;
    const newCameraYPointerDistance = (cameraYPointerDistance * newCameraHeight) / cameraHeight;
    const newCameraYBorderDistanceDiff = newCameraYPointerDistance - cameraYPointerDistance;
    const newCameraYPos = cameraYBorderDistance - newCameraYBorderDistanceDiff;

    this.setPosition(newCameraXPos * this.camera.scale.x, newCameraYPos * this.camera.scale.y);
  }
}
