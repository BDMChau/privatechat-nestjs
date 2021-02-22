import { Body, Controller, Post, Res } from '@nestjs/common';
import { Response } from 'express';

import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { SignUpDto } from './dto/signup.dto';
import { UserValidDto } from './dto/uservalid.dto';
import { SignOutDto } from './dto/signout.dto';
import { SendEmailDto } from './dto/sendemail.dto';
import { ResetPassDto } from './dto/resetpass.dto';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Post('signin')
    signIn(@Body() loginDto: LoginDto, @Res() res: Response): object {
        if (!loginDto.password || !loginDto.email) {
            return res.status(202).json({ err: 'missing' })
        }

        const reqBody: object = {
            email: loginDto.email,
            password: loginDto.password
        }

        return this.authService.signIn(reqBody, res);

    }

    @Post('signup')
    signUp(@Body() signUpDto: SignUpDto, @Res() res: Response): object {
        if (!signUpDto.name || !signUpDto.password || !signUpDto.email) {
            return res.status(202).json({ err: 'missing' })
        }

        const reqBody: object = {
            name: signUpDto.name,
            email: signUpDto.email,
            password: signUpDto.password
        }

        return this.authService.signUp(reqBody, res);

    }

    @Post('uservalid')
    userValid(@Body() userValidDto: UserValidDto, @Res() res: Response): object {
        if (!userValidDto.id) {
            return res.status(202).json({ err: 'Login failed, please try again!' })
        }

        const reqBody: object = {
            id: userValidDto.id
        }

        return this.authService.userValid(reqBody, res);
    }

    @Post('signout')
    signOut(@Body() signOutDto: SignOutDto, @Res() res: Response): object {
        if (!signOutDto.userId) {
            return res.status(202).json({ err: 'Please log in first!' })
        }

        const reqBody: object = {
            id: signOutDto.userId
        }

        return this.authService.signOut(reqBody, res);
    }

    @Post('sendemail')
    sendEmail(@Body() sendEmailDto: SendEmailDto, @Res() res: Response): object {
        if (!sendEmailDto.email) {
            return res.status(202).json({ err: 'authMsg.credential_error' })
        }

        const reqBody: object = {
            email: sendEmailDto.email
        }

        return this.authService.sendEmail(reqBody, res);
    }

    @Post('resetpass')
    resetPass(@Body() resetPassDto: ResetPassDto, @Res() res: Response): object {
        if (!resetPassDto.password || !resetPassDto.tokenResetPassword) {
            return res.status(202).json({ err: 'authMsg.credential_error' })
        }

        const reqBody: object = {
            newPassword: resetPassDto.password,
            token: resetPassDto.tokenResetPassword
        }

        return this.authService.resetPass(reqBody, res);
    }
}
