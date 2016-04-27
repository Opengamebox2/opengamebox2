export default class Camera {
  constructor(camera, game) {
    this.camera = camera;
    this.game = game;

    this.zoomScale = 1;
  }

  update() {
    let zoomDir = null;

    if (this.camera.scale.x - this.zoomScale > 0.01) {
      zoomDir = -1;
    } else if (this.camera.scale.x - this.zoomScale < -0.01) {
      zoomDir = 1;
    }

    if (zoomDir !== null) {
      const time = this.game.time.elapsed;
      const zoomSpeed = 0.0006 * time;
      const newScale = zoomSpeed * zoomDir;
      this.zoomTo(newScale, this.getPointerX(), this.getPointerY());
    }
  }

  setScale(amount) {
    amount = Math.max(amount, this.getScaleMinLimit());
    amount = Math.min(amount, this.getScaleMaxLimit());
    this.zoomScale = amount;
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
    this.game.height / this.game.world.bounds.height);
  }

  getScaleMaxLimit() {
    return 2.5;
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
    this.camera.x = newCameraXPos * this.camera.scale.x;


    const newCameraHeight = this.game.height / this.camera.scale.y;
    const newCameraYPointerDistance = (cameraYPointerDistance * newCameraHeight) / cameraHeight;
    const newCameraYBorderDistanceDiff = newCameraYPointerDistance - cameraYPointerDistance;
    const newCameraYPos = cameraYBorderDistance - newCameraYBorderDistanceDiff;
    this.camera.y = newCameraYPos * this.camera.scale.y;
  }
}
