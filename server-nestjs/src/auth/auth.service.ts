import { Injectable } from '@nestjs/common';
import { UserInterface } from '../interfaces/user.interface';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import keys from '../../config/keys';

const bcryptjs = require('bcryptjs');
const crypto = require('crypto')
const cryptojs = require('crypto-js')
const jwt = require('jsonwebtoken');
const dayjs = require('dayjs');
const nodemailer = require('nodemailer');
const sgTransport = require('nodemailer-sendgrid-transport');

///// 
const mailer = nodemailer.createTransport(sgTransport({
  auth: { api_key: keys.SENDGRID_KEY }
}))

/////
@Injectable()
export class AuthService {
  constructor(
    @InjectModel('User') private readonly userModel: Model<UserInterface>
  ) { }

  async signUp(reqBody, res): Promise<object> {
    const password: string = reqBody.password;
    const name: string = reqBody.name.trim();
    const email: string = reqBody.email.trim();

    try {
      const user: UserInterface = await this.userModel.findOne({ email: email })

      if (user) {
        return res.status(202).json({ err: 'email da su dung' })
      }

      const shortName: string = reqBody.name.split(/[\s,]+/)[name.split(/[\s,]+/).length - 1];
      
      const decryptedPass: object | Buffer = cryptojs.AES.decrypt(password, 'secretKey');
      const originalPass: string = decryptedPass.toString(cryptojs.enc.Utf8);
      const hashedPass: string = await bcryptjs.hash(originalPass, 8);

      if (hashedPass) {
        const userData: object = {
          name: name,
          shortname: shortName,
          email: email,
          password: hashedPass,
          online: 'N',
          createdAt: dayjs().format("MMM D, YYYY h:mm a")
        }

        const newUser: UserInterface = await new this.userModel(userData).save();
        if (newUser) {
          await mailer.sendMail({
            to: newUser.email,
            from: "awesomechat105@gmail.com",
            subject: "Welcome",
            html: "<h1>Welcome to my Chat App!</h1>"
          })

          return res.status(200).json({
            msg: 'ok1',
            msg2: 'ok2'
          });

        }
      }

      return;
    } catch (error) {
      console.log(error);
    }

  }

  async signIn(reqBody, res): Promise<UserInterface | object> {
    const password: string = reqBody.password;
    const email: string = reqBody.email.trim();

    if (!email || !password) {
      return res.status(202).json({ err: 'thieu email or pass' })
    }

    try {
      const user: UserInterface = await this.userModel.findOne({ email: email });

      if (!user) {
        return res.status(202).json({ err: 'k co user' })
      }

      const decryptedPass: object | Buffer =  cryptojs.AES.decrypt(password, 'secretKey');
      const originalPass: string =  decryptedPass.toString(cryptojs.enc.Utf8);
      const isMatchPass: boolean = await bcryptjs.compare(originalPass, user['password']);

      if (!isMatchPass) {
        return res.status(202).json({ err: 'Pass is not match' });
      } else {
        const userToken: string = jwt.sign({ _id: user['_id'] }, keys.JWT_SECRET, { algorithm: 'HS256' });
        const { _id, socketid, name, email, avatar } = user;

        return res.status(200).json({
          userToken,
          user: { _id, socketid, name, email, avatar },
          msg: 'authMsg.login_success'
        });
      }

    } catch (error) {
      console.log(error);
    }
  }

  async userValid(reqBody, res): Promise<UserInterface | object> {
    const userId: string = reqBody.id;
    const updateObj: object = { online: 'Y' };

    try {
      const user: UserInterface = await this.userModel.findByIdAndUpdate(userId, updateObj, {
        new: true,
        useFindAndModify: false
      })

      if (!user) {
        return res.status(202).json({ err: 'k co tai khoan' });
      }

      const { _id, socketid, name, email, avatar } = user;
      return res.status(200).json({ user: { _id, socketid, name, email, avatar } });
    } catch (error) {
      console.log(error);
    }
  }

  async signOut(reqBody, res): Promise<object> {
    const userId: string = reqBody.id;
    const updateObj: object = { online: 'N' };

    try {
      const user: UserInterface = await this.userModel.findByIdAndUpdate(userId, updateObj, {
        new: true,
        useFindAndModify: false
      })

      if (!user) {
        return res.status(202).json({ err: "Logout failed, your account doesn't exist!" });
      }

      return res.status(200).json({ msg: 'authMsg.signOut_success' })
    } catch (error) {
      console.log(error);
    }
  }

  sendEmail(reqBody, res): any {
    const email: string = reqBody.email;

    crypto.randomBytes(32, async (err, buffer): Promise<object> => {
      try {
        if (err) {
          console.log(err);
        }

        const token: string = buffer.toString("hex");

        const user: UserInterface | any = await this.userModel.findOne({ email: email });

        if (!user) {
          return res.status(202).json({ err: 'authMsg.userExist_error' })
        }

        user.resetToken = token;
        user.expireToken = Date.now() + 1800000;//30 minutes
        const savedUser: object = await user.save();

        await mailer.sendMail({
          to: savedUser['email'],
          from: "awesomechat105@gmail.com",
          subject: "Reset password!",
          html: `
              <h3>Welcome to my Chat App</h3>
              <h4>A request to reset your password has been made. Click the link below to reset your password:</h4>
              <h2><a href="http://localhost:3000/resetpass/${token}">Link</a></h2>
              <br/>
              <p>If you did not make this request, simply ignore this email.</p>
              <h4>Your request will be expired in 30 minutes.</h4>
          `
        })

        return res.status(200).json({ msg: 'authMsg.mailSent_success' });

      } catch (error) {
        console.log(error);
      }
    })
  }

  async resetPass(reqBody, res): Promise<object> {
    const newPassword: string = reqBody.password;
    const token: string = reqBody.tokenResetPassword;

    try {
      const user: UserInterface | any = await this.userModel.findOne({
        resetToken: token,
        expireToken: { $gt: Date.now() }
      })

      if (!user) {
        return res.status(202).json({ err: 'authMsg.resetPass_expired' })
      }

      const decryptedPass: object | Buffer =  cryptojs.AES.decrypt(newPassword, 'secretKey');
      const originalPass: string =  decryptedPass.toString(cryptojs.enc.Utf8);
      const hashedPassword: string = await bcryptjs.hash(originalPass, 8);

      user.password = hashedPassword;
      user.tokenReset = undefined;
      user.expireToken = undefined;
      const savedUser: object = await user.save();

      return res.status(200).json({ msg: 'authMsg.resetPass_success' })

    } catch (error) {
      console.log(error);
    }
  }
}


