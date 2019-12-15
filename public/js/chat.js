'use strict';

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
        this.chatWrapper = document.querySelector('#chat-wrapper');
        this.toggleChatBtn = document.querySelector('#chat-toggle');
        this.chatCloseBtn = document.querySelector('#chat-close');


        if(sessionStorage.getItem('username') !== null) {
            this.socket.onopen = e => {
                this.toggleChat();
                this.chatWrapper.classList.add('in');
                scrollIntoView(this.chatMessages);
            };    
        }

        this.openClose();
        this.getInfo();
        this.joinChat();
        this.sendMessage();
        this.leaveChat();
        this.ws();
        
        addMobileClass(document.body);

    }

    openClose() {
        this.toggleChatBtn.addEventListener('click', e => {
            e.preventDefault();
            this.chatWrapper.classList.add('in');
        }, false);
        this.chatCloseBtn.addEventListener('click', e => {
            e.preventDefault();
            this.chatWrapper.classList.remove('in');
        }, false);
    }

    ws() {
        this.socket.onmessage = async message => {
            const response = JSON.parse(message.data);
            const {method} = response;
            await this[method]();
            
        };   
    }

    async getInfo() {
        const response = await fetch('/api/users');
        const users = await response.json();

        if(Array.isArray(users)) {
            const total = users.length;
            if(sessionStorage.getItem('username') !== null && total > 0) {

                const currentUser = sessionStorage.getItem('username');
                const onlineUsers = users.filter(user => user !== currentUser);
                if(onlineUsers.length > 0) {
                    const online = onlineUsers.length;
                    this.info.innerText = `There are ${online} users online`;
                }
                
            }

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
        const msg = document.querySelector('#message').value;
        if(msg.length > 0 && !/^\s+$/.test(msg)) {
            const data = {
                username: sessionStorage.getItem('username'),
                message: stripTags(msg)
            };
            
            await postData({url: '/api/send', data});
            this.socket.send('messages');
        } 
    }

    sendMessage() {
        document.querySelector('#message').addEventListener('keydown', async e => {
            const keyPressed = e.key;
            if(keyPressed === 'Enter') {
                e.preventDefault();
                await this.postMessage();
                scrollIntoView(this.chatMessages);
            }
        }, false);
    }

    joinChat() {

        let self = this;
        
        this.joinForm.addEventListener('submit', async e => {
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
                            target: this.joinForm,
                            type: 'danger',
                            text: response.error
                        });
                    } else {
                        this.toggleChat(username);
                        this.socket.send('info');
                    }
                } catch(err) {
                    displayMessage({
                        target: this.joinForm,
                        type: 'danger',
                        text: JSON.stringify(err)
                    });
                }
            } else {
                displayMessage({
                    target: this.joinForm,
                    type: 'danger',
                    text: 'Invalid username.'
                });
            }
        }, false);
    }

    leaveChat() {
        this.leaveChatBtn.addEventListener('click', async e => {
            e.preventDefault();
            const username = sessionStorage.getItem('username');
            await postData({url: '/api/leave', username});
            sessionStorage.removeItem('username');
            this.chatWrap.classList.toggle('d-none');
            this.joinForm.classList.remove('d-none');
            this.socket.send('info');

        }, false);
    }

    toggleChat(username = '') {
        if(username.length > 0) {
            sessionStorage.setItem('username', username);
        }
        if(this.socket.readyState === 1) {
            this.socket.send('messages');
        }    
        this.chatWrap.classList.toggle('d-none');
        this.joinForm.classList.add('d-none');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const client = new ChatClient();
});