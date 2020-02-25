const Room = function(roomCode, host) {
    this.roomCode = roomCode;
    this.host = host;
    this.clients = {};
}

let ConnectionManager = {
    sockets: {},
    rooms: {},
};

ConnectionManager.onHostConnection = function(socket) {

    //host needs a roomcode, give him a roomcode and assign him to the required room as the host
    //this way when a client messages this room, the message goes to the host
    
    roomCode = (Math.random() + 1).toString(36).substr(2,  5);

    //make sure roomcode is unique
    while(roomCode in this.rooms)
        roomCode = (Math.random() + 1).toString(36).substr(2,  5);
    
    socket.roomCode = roomCode;

    const room = new Room(roomCode, socket);
    this.rooms[roomCode] = room;

    //have socket join the room for messaging purposes
    socket.join(roomCode);

    //let the connected host know his roomcode
    socket.emit("roomcode", roomCode);
}

ConnectionManager.onDisconnect = function(socket) {
    console.log("client disconnected, id: " + socket.id);

    //not managing this socket, ignore it
    if(!this.sockets[socket.id])
        return;

    
    //first delete the reference
    delete this.sockets[socket.id];
    
    if(!socket.roomCode) {
        //socket has no roomcode, no extra cleanup needed
        socket.removeAllListeners();
        return;
    }

    //has a roomcode
    //room doens't exist for whatever reason, disconnect everyone with the roomcode and delete
    let room = this.rooms[socket.roomCode];
    if(!room) {
        socket.to(socket.roomCode).emit('close');
        return;
    }

    //host, close the room and disconnect everyone in the room
    if(room.host == socket) {
        socket.to(socket.roomCode).emit('close');
        delete this.rooms[socket.roomCode];
        return;
    }

    //client in the room, delete just the client
    delete room.clients[socket.id];
}

ConnectionManager.handleConnection = function(socket) {
    //new socket connected, no idea if it's a client or server.
    //place in list of sockets so it's easy to keep track of
    this.sockets[socket.id] = socket;

    console.log("client connected, id: " + socket.id);
    socket.on("host", () => this.onHostConnection(socket));
    socket.on("disconnect", () => this.onDisconnect(socket));
    socket.on("client", () => this.onClientConnection(socket));
}

module.exports = ConnectionManager;