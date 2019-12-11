'use strict';

class ChatServer {
    constructor(pubSubLib) {
        this.pubSubLib = pubSubLib;
        this.client = pubSubLib.createClient();
        this.users = [];
        this.messages = [];

        this.init();
    }

    init() {
        let self = this;
        self.client.once('ready', () => {
            self.client.flushdb();
            self.client.get('users', (err, reply) => {
                if (reply) {
                    self.users = JSON.parse(reply);
                }
            });
    
            self.client.get('messages', (err, reply) => {
                if (reply) {
                    self.messages = JSON.parse(reply);
                }
            });
       });
    }

    join(req, res) {
        const {username} = req.body;
        if (!this.users.includes(username)) {
            this.users.push(username);
            this.client.set('users', JSON.stringify(this.users));
            res.send({
                users: this.users
            });
        } else {
            res.send({
                error: 'Already joined.'
            });
        }
    }

    leave(req, res) {
        const {username} = req.body;
        this.users.splice(this.users.indexOf(username), 1);
        this.client.set('users', JSON.stringify(this.users));
        res.send({
            done: true
        });
    }

    send(req, res) {
        const {username, message} = req.body;
        this.messages.push({
            username,
            message
        });
        this.client.set('messages', JSON.stringify(this.messages));
        res.send({
            done: true
        });
    }

    getMessages(req, res) {
        res.send(this.messages);
    }

    getUsers(req, res) {
        res.send(this.users);
    }
}

module.exports = ChatServer;