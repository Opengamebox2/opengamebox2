import Store from './Store';
import Connection from './Connection';
import Game from './game';
import App from './ui/App';

const store = new Store();
const connection = new Connection(store);
const game = new Game(store);
App.init(store);
