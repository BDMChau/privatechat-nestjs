import { Body, Controller, HttpException, HttpStatus, Patch, Post, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { GetMessageDto } from './dto/getmessage.dto';
import { UserService } from './user.service';

import { UserIdDto } from './dto/userid.dto';
import { UpdateAvatarDto } from './dto/updateavatar.dto';
import { EditNameDto } from './dto/editname.dto';
import { LatestMessageDto } from './dto/latestmessage.dto';
import { SelectedIdDto } from './dto/selectedid.dto';

@Controller('user')
export class UserController {
    constructor(private readonly userService: UserService) { }

    @Post('message')
    getMessage(@Body() getMessageDto: GetMessageDto, @Res() res: Response) {
        const { userId, selectedId, skipMessage, quantityMessage } = getMessageDto;

        if (!userId || !selectedId || skipMessage < 0 || !quantityMessage) {
            return res.status(202).json({ err: 'thieu' })
        }

        const reqBody: object = {
            userId,
            selectedId,
            skipMessage,
            quantityMessage
        }

        return this.userService.getMessage(reqBody, res);
    }

    @Post('messagelistonline')
    getMessageListOnline(@Body() userIdDto: UserIdDto) {
        const { userId } = userIdDto;

        if (!userId) {
            throw new HttpException({
                err: 'thieu thong tin'
            }, HttpStatus.ACCEPTED)
        }

        const reqBody: object = { userId }

        return this.userService.getMessageListOnline(reqBody);
    }

    @Post('messagelistoffline')
    getMessageListOffline(@Body() userIdDto: UserIdDto, @Res() res: Response) {
        const { userId } = userIdDto;

        if (!userId) {
            return res.status(202).json({ err: 'Missing' })
        }

        const reqBody: object = { userId }

        return this.userService.getMessageListOffline(reqBody, res);
    }

    @Post('profile')
    getProfile(@Body() userIdDto: UserIdDto, @Res() res: Response) {
        const { userId } = userIdDto;

        if (!userId) {
            return res.status(202).json({ err: 'thieu' })
        }

        const reqBody: object = {
            userId: userId
        }

        return this.userService.getProfile(reqBody, res);
    }

    @Patch('addavatar')
    addAvatar(@Body() updateAvatarDto: UpdateAvatarDto, @Req() req: Request, @Res() res: Response) {
        if (!updateAvatarDto.avatar) {
            return res.json('missing');
        }

        const reqBody: object = {
            userId: req['user']._id,
            avatar: updateAvatarDto.avatar
        }

        return this.userService.addAvatar(reqBody, res);
    }

    @Patch('removeavatar')
    removeAvatar(@Req() req: Request, @Res() res: Response) {
        const reqBody: object = {
            userId: req['user']._id
        }

        return this.userService.removeAvatar(reqBody, res);
    }

    @Patch('changename')
    changeName(@Body() editNameDto: EditNameDto, @Req() req: Request, @Res() res: Response) {
        if (!editNameDto.newName) {
            return res.status(202).json({ err: 'thieu' })
        }

        const reqBody: object = {
            newName: editNameDto.newName
        }

        return this.userService.changeName(reqBody, req, res);
    }

    @Post('latestmessage')
    latestMessage(@Body() latestMessageDto: LatestMessageDto, @Res() res: Response) {
        if (!latestMessageDto.selectedId || !latestMessageDto.userId) {
            return res.status(202).json({ err: 'thieu' })
        }

        const reqBody: object = {
            userId: latestMessageDto.userId,
            selectedId: latestMessageDto.selectedId
        }

        return this.userService.latestMessage(reqBody, res);
    }

    @Post('selectedprofile')
    selectedProfile(@Body() selectedIdDto: SelectedIdDto, @Res() res: Response) {
        if (!selectedIdDto.selectedId) {
            return res.status(202).json({ err: 'thieu' })
        }

        const reqBody: object = {
            selectedId: selectedIdDto.selectedId
        }

        return this.userService.selectedProfile(reqBody, res);
    }
}
