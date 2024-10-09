import * as React from 'react';
import { Component } from 'react-simplified';
import { Alert } from './widgets';

type Message = { user: string; text: string };

export class Whiteboard extends Component {
  connection: WebSocket | null = null;
  connected = false;
  state = {
    messages: [] as Message[],
    currentMessage: '',
    user: 'User' + Math.floor(Math.random() * 1000),
    users: [] as string[],
  };

  render() {
    return (
      <>
        <div>
          <h1>Connected users:</h1>
          <ul>
            {this.state.users.map((user, index) => (
              <li key={index}>{user}</li>
            ))}
          </ul>

          <h1>Messages:</h1>
          <div>
            {this.state.messages.map((message, index) => (
              <div key={index}>
                <strong>{message.user}:</strong> {message.text}
              </div>
            ))}
          </div>
          <input
            type="text"
            value={this.state.currentMessage}
            onChange={(event) => this.setState({ currentMessage: event.target.value })}
          />
          <button onClick={this.sendMessage}>Send</button>
          <div>{this.connected ? 'Connected' : 'Not connected'}</div>
        </div>
      </>
    );
  }

  mounted() {
    try {
      // Connect to the websocket server
      this.connection = new WebSocket('ws://localhost:3000/api/v1/whiteboard');

      // Called when the connection is ready
      this.connection.onopen = () => {
        this.connected = true;
        // Send the current user to the server
        this.connection?.send(JSON.stringify({ type: 'user', user: this.state.user }));
      };

      // Called on incoming message
      this.connection.onmessage = (message) => {
        try {
          const data = JSON.parse(message.data);
          if (data.text) {
            // It's a message
            this.setState((prevState) => ({
              messages: [...prevState.messages, data],
            }));
          } else if (data.users) {
            // It's the updated list of users
            this.setState({ users: data.users });
          }
        } catch (error) {
          Alert.danger('Failed to process incoming message: ' + error.message);
        }
      };

      // Called if connection is closed
      this.connection.onclose = (event) => {
        this.connected = false;
        Alert.danger('Connection closed with code ' + event.code + ' and reason: ' + event.reason);
      };

      // Called on connection error
      this.connection.onerror = (error) => {
        this.connected = false;
        Alert.danger('Connection error: ' + error.message);
      };
    } catch (error) {
      Alert.danger('Failed to establish WebSocket connection: ' + error.message);
    }
  }

  sendMessage = () => {
    if (this.connection && this.connected) {
      const message = {
        type: 'message',
        user: this.state.user,
        text: this.state.currentMessage,
      };
      try {
        this.connection.send(JSON.stringify(message));
        this.setState({ currentMessage: '' }); // Clear the input field after sending
      } catch (error) {
        Alert.danger('Failed to send message: ' + error.message);
      }
    }
  };

  // Close websocket connection when component is no longer in use
  beforeUnmount() {
    this.connection?.close();
  }
}