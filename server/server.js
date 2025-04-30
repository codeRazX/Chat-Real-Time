import express from 'express';
import {createServer} from 'node:http';
import { Server } from 'socket.io';
import path from 'node:path';


const app = express();
const server = createServer(app);
const io = new Server(server);
const port = process.env.PORT || 3000;
const baseDir = path.resolve(); 

const roomsMap = new Map();
const usersMap = new Map();

app.use(express.static(path.join(baseDir, 'client')));
 

io.on('connection',(socket)=>{
  
    usersMap.set(socket.id,{name:usersMap.size,room: null });
    socket.emit('get-room-list', Array.from(roomsMap.keys()));

    const emitTotalUsers = (room) => {
        const clients = io.sockets.adapter.rooms.get(room);
        const totalUsers = clients ? clients.size : 0;
        io.to(room).emit('totalUser', totalUsers);
        return totalUsers;
    }

    const leaveCurrentRoom = () => {
        const user = usersMap.get(socket.id);
        const room = user.room;
        if (!room) return;

        socket.to(room).emit('chat-message', {
            name: 'System',
            msg: `User "${user.name}" left the room.`
        });

        socket.leave(room);
        user.room = null;

        const totalUsers = emitTotalUsers(room);

        if (totalUsers === 0) {
            roomsMap.delete(room);
            io.emit('get-room-list', Array.from(roomsMap.keys()));
        }
    }

    const joinRoom = (room) => {
        const user = usersMap.get(socket.id);

        if (user.room) leaveCurrentRoom();

        user.room = room;
        socket.join(room);

        socket.to(room).emit('chat-message', {
            name: 'System',
            msg: `User-${user.name} joined the room.`
        });

        socket.emit('chat-message', {
            name: 'System',
            msg: `You have joined the room ${room}.`
        });

        socket.emit('start-room', { room, msg: roomsMap.get(room) });

        emitTotalUsers(room);
    }

    //CHAT
    socket.on('chat-message',(message)=>{
        const user = usersMap.get(socket.id);
        if (user && user.room) {
            io.to(user.room).emit('chat-message', { msg: message, name: user.name });
        }
    });

    socket.on('join-room', (room) => {
        joinRoom(room);
    })

     socket.on('join-room/register-nick', (data) => {
        const { room, user } = data;

        if (!room && !user) {
            socket.emit('error', 'At least one field is required');
            return;
        }

        if (user) {
            usersMap.get(socket.id).name = user;
        }

        if (room) {
            if (roomsMap.has(room)) {
                socket.emit('error', 'This room has already been created');
                return;
            }

            const currentDate = new Date().toDateString();
            roomsMap.set(room, `Room created by ${user || socket.id} at ${currentDate}`);
            io.emit('get-room-list', Array.from(roomsMap.keys()));
            joinRoom(room);
        }
    })

    socket.on('out-room', () => {
        leaveCurrentRoom();
    })
        
    socket.on('disconnect', (reason) => {
        leaveCurrentRoom();
        usersMap.delete(socket.id);
    })
 
       
});

app.get('/', (req, res)=>{
    res.sendFile(path.join(baseDir,'client/index.html'));
})

server.listen(port, ()=> console.log( 'Server running on port: ',port));

