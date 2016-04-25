import settingsReducer from './settingsReducer';
import gameReducer from './gameReducer';
import lastActionReducer from './lastActionReducer';
import {reducer as formReducer} from 'redux-form';

import { combineReducers } from 'redux';

const rootReducer = combineReducers({
	settings: settingsReducer,
	game: gameReducer,
	lastAction: lastActionReducer,
	form: formReducer,
});

export default rootReducer;
