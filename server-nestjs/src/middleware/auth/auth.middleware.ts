import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response } from 'express';
const jwt = require('jsonwebtoken')
import keys from '../../../config/keys';

import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { UserInterface } from 'src/interfaces/user.interface';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
    constructor(
        @InjectModel('User') private readonly userModel: Model<UserInterface>
    ) { }

    use(req: Request, res: Response, next: Function) {
        if (!req.headers.authorization) {
            return res.status(202).json({ err: "You have to log in first!" })
        }

        const token: string | null = req.headers.authorization;
        jwt.verify(token, keys.JWT_SECRET, async (err, payload: object | any) => {
            try {
                if (err) {
                    return res.status(202).json({ err: "You have to log in first!" })
                }

                const userData: UserInterface = await this.userModel.findOne({ _id: payload });

                if (!userData) {
                    return res.status(202).json({ err: "Your account doesn't exist!" })
                }

                req['user'] = userData;
                next();
            } catch (error) {
                console.log(error);
            }
        })

    }
}
