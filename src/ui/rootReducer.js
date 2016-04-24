import playersReducer from './playersReducer';

import { combineReducers } from 'redux';

const rootReducer = combineReducers({ 
	players: playersReducer, 
});

export default rootReducer;
