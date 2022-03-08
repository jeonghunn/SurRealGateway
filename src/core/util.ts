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
} from "./type";
import { AttendeeController } from "../controller/AttendeeController";
import { Attendee } from "../model/Attendee";

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

    public requirePermission(type: AttendeeType, target: AttendeePermission): Function {
        return (request: any, response: Response, next: NextFunction) => {
            const attendeeController: AttendeeController = new AttendeeController();
            const userId: number = parseInt(request.user.id);
            const targetId: number = parseInt(request.params.group_id || request.params.id);

            //Allow Admin
            if (request.user.permission === UserPermission.ADMIN) {
                next();
                return;
            }

            attendeeController.get(type, userId, targetId).then((attendee: Attendee | null) => {
                if (!attendee?.permission || attendee?.permission < target) {
                    return response.status(403).json({
                        name: 'PERMISSION_DENIED',
                        message: 'Permission Denied.',
                    });
                } else {
                    next();
                }
            });

        }
    }

    public getIPAddress(request: any): string {
        return request.headers['x-forwarded-for'] || request.connection.remoteAddress;
    }

}

