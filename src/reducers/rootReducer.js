import settingsReducer from './settingsReducer';
import gameReducer from './gameReducer';
import lastActionReducer from './lastActionReducer';
import uiReducer from './uiReducer';
import {reducer as formReducer} from 'redux-form';

import { combineReducers } from 'redux';

const rootReducer = combineReducers({
	settings: settingsReducer,
	game: gameReducer,
	lastAction: lastActionReducer,
	ui: uiReducer,
	form: formReducer,
});

export default rootReducer;
