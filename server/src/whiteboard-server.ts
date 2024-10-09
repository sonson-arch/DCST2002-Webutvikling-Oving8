import type http from 'http';
import type https from 'https';
import WebSocket from 'ws';

/**
 * Whiteboard server
 */
export default class WhiteboardServer {
  private users: string[] = [];

  /**
   * Constructs a WebSocket server that will respond to the given path on webServer.
   */
  constructor(webServer: http.Server | https.Server, path: string) {
    const server = new WebSocket.Server({ server: webServer, path: path + '/whiteboard' });

    server.on('connection', (connection, _request) => {
      connection.on('message', (message) => {
        const data = JSON.parse(message.toString());

        if (data.type === 'user') {
          // Add new user and broadcast the updated user list
          this.users.push(data.user);
          this.broadcastUserList(server);
        } else if (data.type === 'message') {
          // Broadcast the message to all clients
          this.broadcastMessage(server, data);
        }
      });

      connection.on('close', () => {
        // Remove the user and broadcast the updated user list
        this.users = this.users.filter((user) => user !== connection.user);
        this.broadcastUserList(server);
      });
    });
  }

  private broadcastUserList(server: WebSocket.Server) {
    const userListMessage = JSON.stringify({ type: 'users', users: this.users });
    server.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(userListMessage);
      }
    });
  }

  private broadcastMessage(server: WebSocket.Server, message: any) {
    const messageData = JSON.stringify(message);
    server.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(messageData);
      }
    });
  }
}