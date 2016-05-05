import _ from 'lodash';
import React from 'react';
import {connect} from 'react-redux';
import {reduxForm} from 'redux-form';
import {Button, FormControl, InputGroup} from 'react-bootstrap';
import chatCss from './chat.css';
import ChatMessages from './ChatMessages.react';

let Chat = ({
  messages, fields, sendMessage
}) => {
  const {content} = fields;

  const handleSendMessage = event => {
    event.preventDefault();
    sendMessage(content.value);
    content.onChange('');
  };

  return (
    <div className="chat__container">
      <h4>Chat</h4>
      <ChatMessages messages={messages} />
      <form>
        <InputGroup bsSize="small">
          <FormControl type="text" {...content}
                       placeholder="Type a message here" />
          <InputGroup.Button>
            <Button type="submit"
                bsStyle="primary"
                disabled={content.error !== undefined}
                onClick={handleSendMessage}>
              Send
            </Button>
          </InputGroup.Button>
        </InputGroup>
      </form>
    </div>
  );
};

const validate = values => {
  const errors = {};
  if (!values.content || values.content.length === 0) {
    errors.content = 'Required';
  }
  return errors;
};

Chat = reduxForm({
  form: 'chat',
  fields: ['content'],
  validate
})(Chat);

const mapStateToProps = state => {
  const messages = state.game.chat.messages
    .filter(message => state.game.players[message.fromId])
    .map(m => {
      m.player = state.game.players[m.fromId];
      m.timeObj = new Date(m.time);
      return m;
    });

  return { messages };
};

const mapDispatchToProps = dispatch => {
  return {
    sendMessage: content => {
      dispatch({
        type: 'CHAT_MESSAGE_REQUEST',
        data: {content},
      });
    }
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Chat);
