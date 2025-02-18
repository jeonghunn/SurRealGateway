import {
    NextFunction,
    Request,
    Response,
} from "express";
import { validationResult } from "express-validator";
import {
    AttendeeType,
    AttendeePermission,
    UserPermission,
    PrivacyType,
} from "./type";
import { AttendeeService } from "../service/AttendeeService";
import { Attendee } from "../model/Attendee";
import { GroupService } from "../service/GroupService";
import { Group } from "../model/Group";
import { v4 } from "uuid";
import { Model } from "sequelize";

export class Util {

    // Validation
    public validate: any = (validations: any) => {
        return async (request: Request, response: Response, next: NextFunction) => {
            await Promise.all(validations.map((validation: any) => validation.run(request)));

            const errors = validationResult(request);
            if (errors.isEmpty()) {
                return next();
            }

            response.status(400).json({ errors: errors.array() });
        };
    };

    public setPermissionError(response: Response) {
        return response.status(403).json({
            name: 'PERMISSION_DENIED',
            message: 'Permission Denied.',
        });
    }

    public requirePermission(type: AttendeeType | null, targetPermission: AttendeePermission): Function {
        return (request: any, response: Response, next: NextFunction) => {
            const attendeeService: AttendeeService = new AttendeeService();
            const groupService: GroupService = new GroupService();
            const userId: number | null = parseInt(request.auth?.id);
            const targetId: string = request.params.group_id || request.params.id;

            if (!userId) {
                return response.status(401).json({
                    name: 'UNAUTHORIZED',
                    message: 'Unauthorized.',
                });
            }

            //Allow Admin or All Users
            if (request.auth?.permission === UserPermission.ADMIN || type === null) {
                next();
                return;
            }
            return attendeeService.get(type, userId, targetId).then((attendee: Attendee | null) => {
                if (attendee?.permission >= targetPermission) {
                    next();
                    return;
                } else if(type == AttendeeType.GROUP) {
                    groupService.get(targetId).then((group: Group) => {

                        if (group?.privacy === PrivacyType.PUBLIC) {
                            next();
                            return;
                        }

                        return this.setPermissionError(response);
                    });
                } else {
                    return this.setPermissionError(response);
                }

                
            }).catch((reason: any) => {
                console.log('[PERMISSION] Error: ', reason);
                return this.setPermissionError(response);
            });

        }
    }

    public getIPAddress(request: any): string {
        return request.headers['x-forwarded-for'] || request.connection.remoteAddress;
    }

    public getUserAgent(request: any): string {
        return request.headers['user-agent'];
    }

    public getUUID(): string {
        const tokens: string[] = v4().split('-');
        return tokens[2] + tokens[1] + tokens[0] + tokens[3] + tokens[4];
    }

    public getRandomString(length: number): string {
        const characters: string = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result: string = '';
        const charactersLength: number = characters.length;
        for (let i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return result;
    }

    public getNotDuplicatedId(model: any, length: number = 6): Promise<string> {
        const id: string = this.getRandomString(length);

        return model.findOne({
            where: {
                id,
            }
        }).then((result: any | null) => {
            if (result) {
                return this.getNotDuplicatedId(length + 1);
            }

            return id;
        });
        
    }


}

export const util: Util = new Util(); 

