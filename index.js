'use strict';

const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const redis = require('redis');
const port = process.env.PORT || 3000;
const ChatServer = require('./classes/ChatServer');

const chat = new ChatServer(redis);

app.disable('x-powered-by');

app.use('/public', express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/views/index.html');
});

app.post('/api/join', (req, res) => { chat.join(req, res); });
app.post('/api/leave', (req, res) => { chat.leave(req, res); });
app.post('/api/send', (req, res) => { chat.send(req, res); });
app.get('/api/messages', (req, res) => { chat.getMessages(req, res); });
app.get('/api/users', (req, res) => { chat.getUsers(req, res); });


app.listen(port);