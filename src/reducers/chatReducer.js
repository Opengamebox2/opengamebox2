import _ from 'lodash';

function chatReducer(state = {
  messages: []
}, action) {
  Object.freeze(state);
  switch (action.type) {
    case 'CHAT_MESSAGE':
      const messages = [...state.messages, action.data];
      return _.assign({}, state, {messages});
    default:
      return state;
  }
}

export default chatReducer;
