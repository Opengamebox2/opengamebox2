import React, {Component} from 'react';

class ChatMessages extends Component {
  componentDidUpdate() {
    const container = this.refs.container;
    container.scrollTop = container.scrollHeight - container.offsetHeight;
  }

  render() {
    return (
      <div ref="container" className="chat_messages__container">
        {
          this.props.messages.map(message => {
            return (
              <div className="chat_messages__row" key={`chatMessage-${message.time}-${message.player.name}`}>
                <span className="chat_messages__time">
                  {fillZeroes(message.timeObj.getHours())}:
                  {fillZeroes(message.timeObj.getMinutes())}
                </span>
                <span style={{color: `hsl(${360.0 * message.player.hue}, 100%, 50%)`}}
                      className="chat_messages__author">
                  {message.player.name}:
                </span>
                <span className="chat_messages__content">{message.content}</span>
              </div>
            );
          })
        }
      </div>
    );
  }
};

export default ChatMessages;

function fillZeroes(time) {
  return parseInt(time, 10) < 10 ? `0${time}` : `${time}`;
}
