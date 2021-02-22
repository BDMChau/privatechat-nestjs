import {
  SubscribeMessage,
  WebSocketGateway,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  MessageBody,
  ConnectedSocket,
  WebSocketServer
} from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';

import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserInterface } from 'src/interfaces/user.interface';
import { MessageInterface } from 'src/interfaces/message.interface';
import { MessageDto } from './dto/message.dto';
const dayjs = require('dayjs');

@WebSocketGateway()
export class SocketGateway implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit {
  @WebSocketServer() io: Server

  constructor(
    @InjectModel('User') private readonly userModel: Model<UserInterface>,
    @InjectModel('Message') private readonly messageModel: Model<MessageInterface>
  ) { }

  afterInit() {
    console.log(`Socket has been initialized!`);
  }

  handleConnection(client: Socket) {
    console.log(`${client.id}: connected!`);
  }

  handleDisconnect(client: Socket) {
    console.log(`${client.id}: disconnected!`);
  }

  /////////
  @SubscribeMessage('updateSocketId')
  async updateSocketId(@ConnectedSocket() client: Socket, @MessageBody() userId: string): Promise<any> {
    const updateObj: object = { socketid: client.id };

    try {
      const user: UserInterface = await this.userModel.findByIdAndUpdate(userId, updateObj, {
        new: true,
        useFindAndModify: false
      })

      return;
    } catch (error) {
      throw error
    }
  }

  @SubscribeMessage('sendMessage')
  async sendMessage(@ConnectedSocket() client: Socket, @MessageBody() messageDto: MessageDto): Promise<any> {
    const message: string = messageDto[0];
    const selectedId: string = messageDto[1];
    const userId: string = messageDto[2];


    try {
      const createData: object = {
        message: message,
        from: userId,
        to: selectedId,
        time: dayjs().format('h:mm a'),
        createdAt: dayjs().format("MMM D, YYYY h:mm a")
      }
      const createMess: MessageInterface = await new this.messageModel(createData).save()

      const findData: object = {
        message: message,
        from: userId,
        to: selectedId,
        time: dayjs().format('h:mm a'),
      }
      const newMess: MessageInterface = await this.messageModel.findOne(findData)
        .populate('from', 'socketid _id shortname name avatar')
        .populate('to', 'socketid _id shortname name avatar online')


      this.io.to(`${newMess.from.socketid}`).emit('newMessage', newMess);
      this.io.to(`${newMess.to.socketid}`).emit('newMessage', newMess);
      return;
    } catch (error) {
      throw error
    }
  }

  @SubscribeMessage('sendImage')
  async sendImage(@ConnectedSocket() client: Socket, @MessageBody() messageDto: MessageDto): Promise<any> {
    const imageUrl: string = messageDto[0];
    const selectedId: string = messageDto[1];
    const userId: string = messageDto[2];


    try {
      const createData: object = {
        images: imageUrl,
        from: userId,
        to: selectedId,
        time: dayjs().format('h:mm a'),
        createdAt: dayjs().format("MMM D, YYYY h:mm a")
      }
      const createMess: MessageInterface = await new this.messageModel(createData).save()

      const findData: object = {
        images: imageUrl,
        from: userId,
        to: selectedId,
        time: dayjs().format('h:mm a'),
      }
      const newMess: MessageInterface = await this.messageModel.findOne(findData)
        .populate('from', 'socketid _id shortname name avatar')
        .populate('to', 'socketid _id shortname name avatar online')


      this.io.to(`${newMess.from.socketid}`).emit('newMessage', newMess);
      this.io.to(`${newMess.to.socketid}`).emit('newMessage', newMess);
      return;

    } catch (error) {
      throw error
    }
  }

  @SubscribeMessage('sendSticker')
  async sendSticker(@ConnectedSocket() client: Socket, @MessageBody() messageDto: MessageDto): Promise<any> {
    const stickerUrl: string = messageDto[0];
    const selectedId: string = messageDto[1];
    const userId: string = messageDto[2];


    try {
      const createData: object = {
        sticker: stickerUrl,
        from: userId,
        to: selectedId,
        time: dayjs().format('h:mm a'),
        createdAt: dayjs().format("MMM D, YYYY h:mm a")
      }
      const createMess: MessageInterface = await new this.messageModel(createData).save()

      const findData: object = {
        sticker: stickerUrl,
        from: userId,
        to: selectedId,
        time: dayjs().format('h:mm a'),
      }
      const newMess: MessageInterface = await this.messageModel.findOne(findData)
        .populate('from', 'socketid _id shortname name avatar')
        .populate('to', 'socketid _id shortname name avatar online')


      this.io.to(`${newMess.from.socketid}`).emit('newMessage', newMess);
      this.io.to(`${newMess.to.socketid}`).emit('newMessage', newMess);
      return;

    } catch (error) {
      throw error
    }
  }

}
