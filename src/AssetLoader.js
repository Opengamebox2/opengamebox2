const ipfsGateway = 'https://gateway.ipfs.io/ipfs';

class AssetLoader {
	constructor(game) {
		this.game = game;
		this.waiting = {};
	}

	/**
	 * sets the image of the sprite
	 * @param  {EntitySprite} sprite
	 * @param  {String} imgHash
	 */
	loadEntitySprite(sprite, imgHash) {
		const cacheKey = getCacheKey(imgHash);
		
    if (!this.game.cache.checkImageKey(cacheKey)) {
      if (!this.waiting[cacheKey]) {
      	this._fetchAsset(sprite, imgHash)
      } else {
        this.waiting[cacheKey].push(sprite);
      }
    } else {
      sprite.loadTexture(cacheKey);
    }
	}

	_fetchAsset(sprite, imgHash) {
		const cacheKey = getCacheKey(imgHash);
    this.waiting[cacheKey] = [sprite];

    const loader = new Phaser.Loader(this.game);
    loader.onFileComplete.add(this._onFetchDone.bind(this));
		loader.crossOrigin = 'anonymous';
    loader.image(cacheKey, `${ipfsGateway}/${imgHash}`);
    loader.start();
	}

	_onFetchDone(progress, cacheKey, success, totalLoaded, totalFiles) {
    if (this.waiting[cacheKey]) {
    	let texture = cacheKey;
    	if (!success) {
    		console.warn(`FAILED TO LOAD cacheKey: ${cacheKey}`);
    		texture = 'mushroom';
    	}

      this.waiting[cacheKey].forEach(sprite => sprite.loadTexture(texture));
      delete this.waiting[cacheKey];
    }
	}
}

export default AssetLoader;

function getCacheKey(imgHash) {
	return `ipfs-${imgHash}`;
}
