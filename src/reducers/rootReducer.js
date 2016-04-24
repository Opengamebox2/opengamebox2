import settingsReducer from './settingsReducer';
import playersReducer from './playersReducer';
import {reducer as formReducer} from 'redux-form';

import { combineReducers } from 'redux';

const rootReducer = combineReducers({
	settings: settingsReducer,
	players: playersReducer,
	form: formReducer,
});

export default rootReducer;
