const { io } = require('../server');

const { Users } = require('../classes/users');
const { createMessage } = require('../utils/utils');

const users = new Users();

io.on('connection', (client) => {
    client.on('enterChat', (data, callback) => {

        if (!data.name || !data.room) {
            return callback({
                err: true,
                message: 'El nombre y la sala es necesario'
            });
        }

        client.join(data.room);
        let u = users.addUser(client.id, data.name, data.room);
        client.broadcast.to(data.room).emit('listUsers', users.getUsersPerRoom(data.room));
        client.broadcast.to(data.room).emit('createMessage', createMessage('Admin', `${data.name} se unió`));
        callback(users.getUsersPerRoom(data.room));
    });

    client.on('createMessage', (data, callback) => {
        let user = users.getUser(client.id);
        let message = createMessage(user.name, data.message);
        client.broadcast.to(user.room).emit('createMessage', message);
        callback(message);
    })

    client.on('disconnect', () => {
        let removedUser = users.removeUser(client.id);
        client.broadcast.to(removedUser.room).emit('createMessage', createMessage('Admin', `${removedUser.name} salió`));
        client.broadcast.to(removedUser.room).emit('listUsers', users.getUsersPerRoom(removedUser.room));
    });

    // Private messages
    client.on('privateMessage', data => {
        let user = users.getUser(client.id);
        client.broadcast.to(data.to).emit('privateMessage', createMessage(user.name, data.message));
    });
});