'use strict';

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
        this.socket = {};
        this.info = document.querySelector('#chat-info');
        this.joinForm = document.querySelector('#chat-join');
        this.userCount = 0;
        this.chatWrap = document.querySelector('#chat-wrap');
        this.chatMessages = document.querySelector('#chat-messages');
        this.sendMessageBtn = document.querySelector('#send-message');
        this.leaveChatBtn = document.querySelector('#leave-chat');

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
                let str = `<blockquote><div><cite>${message.username}</cite></div><p>${message.message}</p></blockquote>`;
                html += str;
            }

            this.chatMessages.innerHTML = html;
        } 
    }

    sendMessage() {
        let self = this;
        self.sendMessageBtn.addEventListener('click', async () => {
            const msg = document.querySelector('#message').value;
            if(msg.length > 0 && !/^\s+$/.test(msg)) {
                const data = {
                    username: sessionStorage.getItem('username'),
                    message: stripTags(msg)
                };

                await postData({url: '/api/send', data});
                await self.getMessages();
            }
        }, false);
    }

    joinChat() {
        let self = this;
        self.joinForm.addEventListener('submit', async e => {
            e.preventDefault();
            const username = document.querySelector('#username').value;
            if(username.length > 0) {
                try {
                    const response = await postData({ url: '/api/join', data: { username } } );
                    if(response.error) {
                        alert(response.error);
                    } else {
                        self.toggleChat(username);
                        self.events.trigger('change');
                    }
                } catch(err) {
                    console.log(err);
                }
            } else {
                alert('Invalid username!');
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