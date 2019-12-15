'use strict';

const WebSocket = require('ws');

class ChatSocket {
    constructor({chatServer, port}) {
        this.chatServer = chatServer;
        this.wss = new WebSocket.Server({ port: port });

        this.onConnection();
    }

    onConnection() {
        this.wss.on('connection', ws => {
            this.onMessage(ws);
        });
    }

    onMessage(wsInstance) {
        const self = this;
        wsInstance.on('message', function incoming(data)  {
            switch(data) {
                case 'messages':
                    self.broadcastData(JSON.stringify({ method: 'getMessages' }));
                    break;
                case 'info':
                    self.broadcastData(JSON.stringify({ method: 'getInfo' }));
                    break;
                default:
                    break;    
            }
        });    
    }

    broadcastData(data) {
        this.wss.clients.forEach(function each(client) {
            if (client.readyState === WebSocket.OPEN) {
              client.send(data);
            }
        });
    }
}

module.exports = ChatSocket;