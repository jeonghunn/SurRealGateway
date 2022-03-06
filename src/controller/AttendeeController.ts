import {Attendee} from "../model/Attendee";
import {
    AttendeePermission,
    AttendeeType,
    Status,
} from "../core/type";
import { Op } from "sequelize";

const config = require('../config/config');

export class AttendeeController {

    public get(
        type: AttendeeType,
        user_id: number,
        target_id: number,
    ): Promise<Attendee | null> {

        return Attendee.findOne({
            where: {
                type,
                user_id,
                target_id,
            },
        }).catch((e: any) =>  {
            console.log('AttendeeController: get : ', e);
            return null;
        });
    }

    public create(
        type: AttendeeType,
        user_id: number,
        target_id: number,
        permission: AttendeePermission = AttendeePermission.MEMBER,
    ): Promise<Attendee> {

        return this.get(
            type,
            user_id,
            target_id,
        ).then((attendee: Attendee | null) => {
            if (attendee) {
                return attendee;
            }

            return Attendee.create({
                type,
                user_id,
                target_id,
                status: Status.NORMAL,
                permission,
            });
        });
    }

    public getList(type: AttendeeType, userId: number): Promise<number[] | null> {
        return Attendee.findAll({
            raw: true,
            attributes: ['target_id'],
            where: {
                user_id: userId,
                status: Status.NORMAL,
                type,
                permission: { [Op.gt]: AttendeePermission.BLOCKED },
            }
        }).then((attendees: any[]) => {
            return attendees.map((attendee) => attendee.target_id);
        }).catch((e) => {
            console.log(e);
            return null;
        });
    }

}
