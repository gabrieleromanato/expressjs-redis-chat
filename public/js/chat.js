'use strict';


const displayTime = timestamp => {
    const time = new Date(parseInt(timestamp, 10));
    return timeago.format(time);
};

const displayMessage = ({ target, type, text}) => {
    const msg = document.createElement('div');
    msg.className = `alert alert-${type} mt-5 mb-5`;
    msg.innerText = text;

    target.appendChild(msg);
};

const stripTags = input => {

    const tags = /<\/?([a-z][a-z0-9]*)\b[^>]*>/gi
    const commentsAndPhpTags = /<!--[\s\S]*?-->|<\?(?:php)?[\s\S]*?\?>/gi

    return input.replace(commentsAndPhpTags, '').replace(tags, '');
};

const postData = async ({url, data}) => {
    const response = await fetch(url, {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
            'Content-Type' : 'application/json'
        }
    });

    return await response.json();
};

class Events {
    constructor(instance) {
        this.instance = instance;
        this.data = [];
    }

    on(evtName, callback) {
        let evt = {
            name: evtName,
            handler: callback
        };

        this.data.push(evt);
    }

    trigger(evtName) {
        for(const evt of this.data) {
            if(evt.name === evtName) {
                evt.handler(this.instance);
            }
        }
    }
}

class ChatClient {
    constructor() {
        this.socket = new WebSocket('ws://127.0.0.1:8080');
        this.info = document.querySelector('#chat-info');
        this.joinForm = document.querySelector('#chat-join');
        this.userCount = 0;
        this.chatWrap = document.querySelector('#chat-wrap');
        this.chatMessages = document.querySelector('#chat-messages');
        this.sendMessageBtn = document.querySelector('#send-message');
        this.leaveChatBtn = document.querySelector('#leave-chat');
        this.chatActions = document.querySelector('#chat-actions');


        if(sessionStorage.getItem('username') !== null) {
            this.toggleChat();
        }

        this.getInfo();
        this.joinChat();
        this.sendMessage();
        this.leaveChat();

        this.events = new Events(this);

        this.events.on('change', instance  => {
            instance.getInfo();
        });

        this.ws(); 

    }

    ws() {
        let self = this;
        self.socket.onmessage = async message => {
            await self.getMessages();
        };   
    }

    async getInfo() {
        const response = await fetch('/api/users');
        const users = await response.json();

        if(Array.isArray(users)) {
            const total = users.length;
            this.info.innerText = `There are currently ${total} users in this chat room.`;
            this.userCount = total;
        }

    }

    async getMessages() {
        const response = await fetch('/api/messages');
        const messages = await response.json();

        if(Array.isArray(messages) && messages.length > 0) {
            let html = '';
            for(const message of messages) {
                let avatar = (message.avatarImg.length > 0) ? message.avatarImg : '/public/images/avatar.png';
                let time = displayTime(message.time);
                let str = `<blockquote>
                    <img class="avatar" src="${avatar}">
                    <div>
                      <cite>${message.username}</cite>
                      <time>${time}</time>
                    </div>
                    <p>${message.message}</p>
                    </blockquote>`;
                html += str;
            }

            this.chatMessages.innerHTML = html;
        } 
    }

    async postMessage() {
        let self = this;
        const msg = document.querySelector('#message').value;
        if(msg.length > 0 && !/^\s+$/.test(msg)) {
            const data = {
                username: sessionStorage.getItem('username'),
                message: stripTags(msg)
            };
            self.socket.send(JSON.stringify(data));
            await postData({url: '/api/send', data});
            await self.getMessages();
        } 
    }

    sendMessage() {
        let self = this;
        self.sendMessageBtn.addEventListener('click', async () => {
            await self.postMessage();
        }, false);

        document.querySelector('#message').addEventListener('keydown', async e => {
            const keyPressed = e.key;
            if(keyPressed === 'Enter') {
                e.preventDefault();
                await self.postMessage(); 
            }
        }, false);
    }

    joinChat() {
        let self = this;
        self.joinForm.addEventListener('submit', async e => {
            e.preventDefault();
            const username = stripTags(document.querySelector('#username').value);
            const msgs = self.joinForm.querySelectorAll('.alert');
            if(msgs.length > 0) {
                msgs.forEach(message => {
                    self.joinForm.removeChild(message);
                });
            }
            if(username.length > 0) {
                try {
                    const response = await postData({ url: '/api/join', data: { username } } );
                    if(response.error) {
                        displayMessage({
                            target: self.joinForm,
                            type: 'danger',
                            text: response.error
                        });
                    } else {
                        self.toggleChat(username);
                        self.events.trigger('change');
                    }
                } catch(err) {
                    displayMessage({
                        target: self.joinForm,
                        type: 'danger',
                        text: JSON.stringify(err)
                    });
                }
            } else {
                displayMessage({
                    target: self.joinForm,
                    type: 'danger',
                    text: 'Invalid username.'
                });
            }
        }, false);
    }

    leaveChat() {
        let self = this;
        self.leaveChatBtn.addEventListener('click', async () => {
            const username = sessionStorage.getItem('username');
            await postData({url: '/api/leave', username});
            sessionStorage.removeItem('username');
            self.chatWrap.classList.toggle('d-none');
            self.joinForm.classList.remove('d-none');
            self.events.trigger('change');

        }, false);
    }

    async toggleChat(username = '') {
        let self = this;
        if(username.length > 0) {
            sessionStorage.setItem('username', username);
        }
        await self.getMessages();
        self.chatWrap.classList.toggle('d-none');
        self.joinForm.classList.add('d-none');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const client = new ChatClient();
});