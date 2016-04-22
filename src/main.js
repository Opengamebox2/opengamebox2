import 'pixi'
import 'p2'
import Phaser from 'phaser'

import BootState from './states/Boot'
import SplashState from './states/Splash'
import GameState from './states/Game'

import socketCluster from 'socketcluster-client';
const socketOptions = {
    port: 8000
};

class Game extends Phaser.Game {

  constructor () {
    let width = document.documentElement.clientWidth > 768 ? 768 : document.documentElement.clientWidth;
    let height = document.documentElement.clientHeight > 1024 ? 1024 : document.documentElement.clientHeight;

    super(width, height, Phaser.AUTO, 'content', null);

    this.state.add('Boot', BootState, false);
    this.state.add('Splash', SplashState, false);
    this.state.add('Game', GameState, false);

    this.state.start('Boot');

    // not sure if storing socket in game state makes actual sense
    let socket = socketCluster.connect(socketOptions);
    socket.on('connect', () => {
        console.log('CONNECTED');
    });
    socket.on('rand', (num) => {
        console.log('RANDOM', num);
    });
    this.state.add('Socket', socket);
  }
}

window.game = new Game()
