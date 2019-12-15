'use strict';

const axios = require('axios');

describe('API Tests', () => {
    let user = '';
    beforeEach(() => {
        user = 'gabriele';
    });
    it('/api/join joins an user to the chat', async () => {
        const data = { username: user };
        const request = await axios.post('http://localhost:3000/api/join', data);
        const response = request.data;

        expect(response.users.includes(user)).toBe(true);
    });

    it('/api/leave makes an user leave the chat', async () => {
        const data = { username: user };
        const request = await axios.post('http://localhost:3000/api/leave', data);
        const response = request.data;
        const users = await axios.get('http://localhost:3000/api/users');

        expect(response.done).toBe(true);
        expect(users.data.includes(user)).toBe(false);
    });

    it('/api/send sends a message', async () => {
        const body = {
            username: user,
            message: 'Hello world!'
        };
        const request = await axios.post('http://localhost:3000/api/send', body);
        const messages = await axios.get('http://localhost:3000/api/messages');
        const message = messages.data.find(msg => { return msg.username === user});

        expect(typeof message !== 'undefined').toBe(true);
    });

    it('/api/messages lists messages', async () => {
        const messages = await axios.get('http://localhost:3000/api/messages');

        expect(Array.isArray(messages.data)).toBe(true);
    });

    it('/api/users lists users', async () => {
        const users = await axios.get('http://localhost:3000/api/users');

        expect(Array.isArray(users.data)).toBe(true);
    });
});