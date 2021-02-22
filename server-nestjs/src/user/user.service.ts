import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { MessageInterface } from 'src/interfaces/message.interface';
import { UserInterface } from 'src/interfaces/user.interface';

@Injectable()
export class UserService {
    constructor(
        @InjectModel('User') private readonly userModel: Model<UserInterface>,
        @InjectModel('Message') private readonly messageModel: Model<MessageInterface>
    ) { }

    async getMessage(reqBody, res): Promise<MessageInterface | object> {
        const { userId, selectedId, skipMessage, quantityMessage } = reqBody;

        try {
            const message: Array<any> = await this.messageModel.find({
                $or: [
                    {
                        $and: [
                            { from: userId },
                            { to: selectedId }
                        ]
                    }, {
                        $and: [
                            { from: selectedId },
                            { to: userId }
                        ]
                    }
                ]
            })
                .sort({ _id: -1 })
                .skip(skipMessage)
                .limit(quantityMessage)
                .populate('from', 'socketid _id name avatar')
                .populate('to', 'socketid _id name avatar')

            if (!message.length) {
                return res.status(202).json({ err: 'end conversation!' })
            }

            return res.status(200).json(message)
        } catch (error) {
            throw error
        }
    }

    async getMessageListOnline(reqBody): Promise<UserInterface> {
        const userId: string = reqBody.userId;

        try {
            const list: UserInterface = await this.userModel.find({
                $and: [
                    { _id: { $ne: userId } },
                    { online: 'Y' }
                ]
            }).select('-password')

            if(!list){
                throw new HttpException({
                    err: 'nothing'
                }, HttpStatus.NO_CONTENT)
            }

            return list
        } catch (error) {
            throw error;
        }
    }

    async getMessageListOffline(reqBody, res): Promise<UserInterface> {
        const userId: string = reqBody.userId;

        try {
            const list: Array<UserInterface> = await this.userModel.find({
                $and: [
                    { _id: { $ne: userId } },
                    { online: 'N' }
                ]
            }).select('-password')

            return res.status(200).json(list);
        } catch (error) {
            throw error;
        }
    }

    async getProfile(reqBody, res): Promise<UserInterface> {
        const userId: string = reqBody.userId;

        try {
            const profile: UserInterface = await this.userModel.findOne({
                _id: userId
            }).select('-password')

            return res.status(200).json(profile);
        } catch (error) {
            throw error;
        }
    }

    async addAvatar(reqBody, res): Promise<object> {
        const userId: string = reqBody.userId;
        const avatarUrl: string = reqBody.avatar;

        try {
            const updateUser: UserInterface = await this.userModel.findByIdAndUpdate(userId, {
                $set: { avatar: avatarUrl }
            }, {
                new: true,
                useFindAndModify: false
            }).select('-password')

            return res.status(200).json({ msg: 'userMsg.update_success', avatar: updateUser['avatar'] });

        } catch (error) {
            console.log(error);
            return res.status(202).json({ err: 'userMsg.update_error' })
        }
    }

    async removeAvatar(reqBody, res): Promise<object> {
        const userId: string = reqBody.userId;

        try {
            const updateUser: UserInterface = await this.userModel.findByIdAndUpdate(userId, {
                $unset: { avatar: 1 }
            }, {
                new: true,
                useFindAndModify: false
            }).select('-password')

            return res.status(200).json({ msg: 'userMsg.update_success', avatar: updateUser['avatar'] });

        } catch (error) {
            console.log(error);
            return res.status(202).json({ err: 'userMsg.update_error' })
        }
    }

    async changeName(reqBody, req, res): Promise<UserInterface> {
        const newName: string = reqBody.newName;
        const shortName: string = newName.split(/[\s,]+/)[newName.split(/[\s,]+/).length - 1];
        const userId: string = req.user._id;

        try {
            const user: object = await this.userModel.findByIdAndUpdate(userId, {
                $set: {
                    name: newName,
                    shortname: shortName
                }
            }, {
                new: true,
                useFindAndModify: false
            })

            return res.status(200).json({ msg: 'userMsg.update_success', name: user['name'] });

        } catch (error) {
            console.log(error);
            return res.status(202).json({ err: 'userMsg.update_error' });
        }
    }

    async latestMessage(reqBody, res): Promise<MessageInterface | object> {
        const { userId, selectedId } = reqBody;

        try {
            const message: object = await this.messageModel.findOne({
                $or: [
                    {
                        $and: [
                            { from: userId },
                            { to: selectedId }
                        ]
                    }, {
                        $and: [
                            { from: selectedId },
                            { to: userId }
                        ]
                    }
                ]
            })
                .sort({ _id: -1 })
                .limit(1)
                .populate('from', 'socketid _id shortname avatar')
                .populate('to', 'socketid _id shortname avatar')

            if (!message) {
                return res.status(202).json({ err: 'nothing' });
            }

            return res.status(200).json(message);
        } catch (error) {
            throw error;
        }
    }

    async selectedProfile(reqBody, res): Promise<UserInterface> {
        const selectedId: string = reqBody.selectedId;

        try {
            const user: object = await this.userModel.findOne({
                _id: selectedId
            }).select('-password')

            return res.status(200).json(user);

        } catch (error) {
            throw error
        }
    }
}
