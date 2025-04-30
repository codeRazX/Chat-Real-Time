import UI from "./UI.js";

const $ = el => document.getElementById(`${el}`);
const form = document.getElementById('form');
const containerMessageRoom = $('chat-messages');
const nameRoom = $('name-room');
const containerLabelRooms = $('container-rooms');
const createRoomBTN = $('create-room-btn');
const defaultMessageRooms = $('no-rooms-msg');
const overlay = $('overlay');
const formCreateRoom = $('form-create-room');
const addRoomBTN = $('add-room-btn');
const closeBTN = $('close-btn');
const roomData = $('create-room-data');
const chat = $('chat');
const totalUser = $('total-user');
const outRoom = $('out-room');
const socket = io();
let isJoiningRoom = false;

const ui = new UI();

const handdleListRooms = (rooms)=> ui.createLabelRoom(rooms,containerLabelRooms,createRoomBTN,defaultMessageRooms);

const handleChatMessages = ({msg,name})=> ui.createMessageDOM(msg,name,containerMessageRoom);

const handleJoinRoom = (e)=>{
    const room = e.target.dataset?.id;
    if(!room || isJoiningRoom) return;
    isJoiningRoom = true;
    ui.showChat(chat,containerMessageRoom);

    nameRoom.textContent = room;
    socket.emit('join-room',room);
   
}

const handleError = (msg)=> ui.showError(msg,formCreateRoom);

const handleErrorRoom = (msg)=> ui.showError(msg,formCreateRoom);

const emitMessage = (e)=>{
    e.preventDefault();
    const message = form.message.value.trim();
    if(!message)return;

    socket.emit('chat-message', message);
    form.reset();
}

const startRoom = (data)=>{
   ui.showChat(chat,containerMessageRoom);
   roomData.textContent = data.msg;
   nameRoom.textContent = data.room;
   isJoiningRoom = false;
}

const createAndEmitRoomNick = (e)=>{
    const data = Object.fromEntries(new FormData(formCreateRoom));

    if(Object.values(data).every(field => !field)){
      ui.showError('At least one field is required',formCreateRoom);
      return;
    }
    
    socket.emit('join-room/register-nick',data);
    overlay.classList.remove('actived');
    formCreateRoom.reset();
}

const handdleTotalUsers = (clients)=> totalUser.textContent = `(${clients})`;

const handdleOutRoom = (e)=>{
    socket.emit('out-room');
    ui.closeChat(chat);
}



//Listener  server
socket.on('chat-message', handleChatMessages);
socket.on('start-room', startRoom);
socket.on('get-room-list',handdleListRooms);
socket.on('error-room', handleErrorRoom);
socket.on('error',handleError);
socket.on('totalUser', handdleTotalUsers);


form.addEventListener('submit', emitMessage);
containerLabelRooms.addEventListener('click',handleJoinRoom);
addRoomBTN.addEventListener('click',createAndEmitRoomNick);
outRoom.addEventListener('click',handdleOutRoom);


//Listeners DOM
createRoomBTN.addEventListener('click', ()=> ui.toggleClass(overlay,'actived'));
overlay.addEventListener('click', function(e){
    e.target === this && ui.toggleClass(overlay,'actived');
});
closeBTN.addEventListener('click', ()=> ui.toggleClass(overlay,'actived'));

