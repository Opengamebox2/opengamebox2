import _ from 'lodash';
import io from 'socket.io-client';
import protocol from '../protocol';

export default class Connection {
  constructor(store) {
    store.on('CONNECT', () => {
      this.socket = io(`http://${window.location.hostname}:8000`);

      this.socket.on('connect', () => {
        console.log('Connected to the server!');
        store.dispatch('CONNECTED', {});
      });

      this.socket.on('disconnect', () => {
        console.log('Disconnected from the server!');
        store.dispatch('DISCONNECTED', {});
      });

      store.on(_.keys(protocol.requests), (data, type) => {
        this.socket.emit(protocol.requests[type], data);
      })

      _()
      .assign(protocol.broadcast, protocol.replies)
      .forOwn((typeCode, type) => {
        this.socket.on(typeCode, data => {
          store.dispatch(type, data);
        });
      });
    });
  }
}
