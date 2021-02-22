import * as mongoose from 'mongoose';
import { ObjectId } from 'mongodb';

export const messageSchema = new mongoose.Schema({
    message: {
        type: String
    },
    images: {
        type: String
    },
    sticker: {
        type: String
    },
    from: {
        type: ObjectId,
        ref: 'User'
    },
    to: {
        type: ObjectId,
        ref: 'User'
    },
    time:{
        type: String
    },
    createdAt:{
        type: String
    }
});
