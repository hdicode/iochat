var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);
users = [];
connections = [];

server.listen(process.env.PORT || 3000);
console.log("Server berjalan...");

app.get('/', function(req, res){
    res.sendFile(__dirname + '/index.html');
});

io.sockets.on('connection', function(socket){
    connections.push(socket);
    console.log('Connected: %s sockets connected', connections.length);

    //disconnect
    socket.on('disconnect',function(data){
        users.splice(users.indexOf(socket.username),1);
        updateUsernames();
        connections.splice(connections.indexOf(socket), 1);
        console.log('Disconnected: %s sockets connected', connections.length);
        console.log('User ' + socket.username + ' is offline.');
        //harus displice dulu baru berkurang angkanya
        updateCountUser();

        io.sockets.emit('user disconnect', {user: socket.username, countuser: users.length});
    });

    //send
    socket.on('send message', function(data){
        console.log(data);
        io.sockets.emit('new message', {msg: data, user: socket.username});
    });

    //New user
    socket.on('new user', function(data, callback){
        callback(true);
        console.log('User ' + data + ' is now Online.')
        socket.username = data;
        users.push(socket.username);
        io.sockets.emit('user connect', {user:socket.username, countuser: users.length});
        updateUsernames();
        updateCountUser();
    });

    function updateUsernames(){
        io.sockets.emit('get users', users);
    }

    function updateCountUser(){
        io.sockets.emit('get countuser', users.length);
    }

});

