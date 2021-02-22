import { ObjectId } from 'mongodb';

export interface MessageInterface {
    _id: string,
    message?: string,
    images?: string,
    sticker?: string,
    from: ObjectId,
    to: ObjectId,
    time: string,
    createdAt: string
}