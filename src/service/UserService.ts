import { User } from '../model/User';
import jsonwebtoken from "jsonwebtoken";
import bcrypt from 'bcrypt';
import {
    Gender,
    RelationStatus,
    UserPermission,
    UserStatus,
} from "../core/type";
import {Op} from "sequelize";
import { Relation } from "../model/Relation";

const stringToColor = require('string-to-color');
const config = require('../config/config');

export class UserService {

    public get defaultExpiredAtTimeStamp(): number {
        return new Date().getTime() + (86400 * 30 * 12 * 3);
    }

    public get authCookieOptions(): any {
        return {
            maxAge: 86400 * 1000 * 30 * 12 * 3,
            encode: (v: any) => v,
        };
    }

    public getPasswordHash(password: string): string {
        let saltRounds: number = 10;
        return bcrypt.hashSync(password, saltRounds);
    }

    public isPasswordCorrect(password: string, hash?: string): Promise<boolean> {
        if (!password || !hash) {
            return new Promise<boolean>(() => false);
        }

        return bcrypt.compare(password, hash);
    }

    public getById(id: number, user_id: number | null = null): Promise<User | null> {
        return User.findOne( {
            where: {
                id: id,
            },
            include: {
                model: Relation,
                required: false,
                where: {
                    target_id: user_id,
                    status: { [Op.ne]: RelationStatus.REMOVED },

                },
            },

        }).catch((e) => {
            console.log(e);
            return null;
        });
    }

    public getByEmail(name: string, host: string): Promise<User | null> {
        return User.findOne( {
            where: {
                email_name: name,
                email_host: host,
            }
        }).catch((e) => {
            console.log(e);
            return null;
        });;
    }

    public signIn(email: string, password: string): Promise<User | null> {

        const emailArray: string[] = email?.split('@', 2);

        return this.getByEmail(emailArray[0], emailArray[1]).then((user: User | null) => {
            if (!user) {
                return null;
            }

            return this.isPasswordCorrect(password, user?.password).then((isCorrect: boolean) => {
                return isCorrect ? user : null;
            });
        });
    }

    public signUp(
        email: string,
        password: string,
        name: string = '',
        lastName: string = '',
        gender: Gender = Gender.NON_SEXUAL,

    ): Promise<User> {

        const emailArray: string[] = email?.split('@', 2);
        const passwordHash: string = this.getPasswordHash(password);

        return User.create({
            email_name: emailArray[0],
            email_host: emailArray[1],
            password: passwordHash,
            name: name?.trim(),
            last_name: lastName,
            status: UserStatus.NORMAL,
            permission: UserPermission.USER,
            gender,
            color: stringToColor('night ' + emailArray[0] + emailArray[1]),
        });
    }

    public isEmailDuplicate(email: string): Promise<boolean> {
        const emailArray: string[] = email?.split('@', 2);
        return this.getByEmail(emailArray[0], emailArray[1]).then((user => {
            return user !== null;
        }));
    }

    public createToken(
        userId: number,
        expiredAt: Date | null = null,
        email: string | null = null,
        name: string | null = null,
        color: string | null = null,
    ): string {
        const payload: any = {
            iss: config.serverDomain,
            exp: expiredAt ? (expiredAt.getTime() / 1000) : this.defaultExpiredAtTimeStamp,
            permission: 'user',
            id: userId,
            email: email,
            name: name,
            color: color,
        }

        return jsonwebtoken.sign(payload, config.jwt.secret, {algorithm: config.jwt.algorithms[0]});
    }

}
