import playersReducer from './playersReducer';
import {reducer as formReducer} from 'redux-form';

import { combineReducers } from 'redux';

const rootReducer = combineReducers({ 
	players: playersReducer,
	form: formReducer,
});

export default rootReducer;
