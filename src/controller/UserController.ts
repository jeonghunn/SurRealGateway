import { User } from '../model/user';
import jsonwebtoken from "jsonwebtoken";

const config = require('../config/config');

export class UserController {

    public simpleCreate(): Promise<any> {
        return User.create({});
    }

    public createToken(
        userId: number,
        expiredAt: Date | null = null,
        email: string | null = null,
        name: string | null = null,
    ): string {
        const payload: any = {
            iss: config.serverDomain,
            exp: expiredAt ? (expiredAt.getTime() / 1000) : 0,
            permission: 'user',
            id: userId,
            email: email,
            name: name,
        }

        return jsonwebtoken.sign(payload, config.jwt.secret, {algorithm: config.jwt.algorithms[0]});
    }

}
