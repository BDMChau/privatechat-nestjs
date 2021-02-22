import io from 'socket.io-client';
import keys from '../config/keys';

const socket = io(keys.ENDPOINT);

const updateSocketId = (userId) => {
    socket.emit("updateSocketId", userId);
}

// const getChatListSocket = (userId) => {
//     socket.emit("getChatList", userId);
// }

const sendMessageSocket = (message, selectedId, userId) => {
    socket.emit('sendMessage', message, selectedId, userId);
}

const sendImageSocket = (imageUrl, selectedId, userId) => {
    socket.emit('sendImage', imageUrl, selectedId, userId);
}

const sendStickerSocket = (stickerUrl, selectedId, userId) => {
    socket.emit('sendSticker', stickerUrl, selectedId, userId);
}


export {
    socket,
    updateSocketId,
    sendMessageSocket,
    sendImageSocket,
    sendStickerSocket
}

