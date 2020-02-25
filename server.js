'use strict';

const ConnectionManager = require('./src/connection-manager');

const express = require('express');
const socketIO = require('socket.io');

const PORT = process.env.PORT || 4000;
const INDEX = '/index.html';

const server = express()
  .use((req, res) => res.sendFile(INDEX, { root: __dirname }))
  .listen(PORT, () => console.log(`Listening on ${PORT}`));

const io = socketIO(server);

io.on('connection', (socket) => ConnectionManager.handleConnection(socket));