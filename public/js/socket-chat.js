var socket = io();

var params = new URLSearchParams(window.location.search);

// jQuery references
var divUsers = $('#divUsers');

if (!params.has('name') || !params.has('room')) {
    window.location = 'index.html';
    throw new Error('El nombre y sala de chat son necesarios');
}

var user = {
    name: params.get('name'),
    room: params.get('room')
}

// Connect
socket.on('connect', function() {
    console.log('Conectado al servidor');
    socket.emit('enterChat', user, function(resp) {
        // console.log('Usuarios conectados', resp);
        renderUsers(resp);
    });
});

// Disconnect
socket.on('disconnect', function() {
    console.log('Se perdió la conexión con el servidor');
});

// Listen info
socket.on('createMessage', function(message) {
    // console.log('Servidor: ', message);
    renderMessages(message, false);
    scrollBottom();
});

// Listen user's change (connect or disconnect)
socket.on('listUsers', function(users) {
    // console.log(users);
    renderUsers(users);
});

// Private messages
socket.on('privateMessage', function(message) {
    console.log('Mensaje privado: ', message);
});