import {Attendee} from "../model/Attendee";
import {
    AttendeePermission,
    AttendeeType,
    Status,
} from "../core/type";

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

    public getList(type: AttendeeType, userId: number): Promise<number[]> {
        return Attendee.findAll({
            raw: true,
            attributes: ['target_id'],
            where: {
                user_id: userId,
                status: Status.NORMAL,
                type,
            }
        }).then((attendees: Attendee[]) => {
            return attendees.map((attendee) => attendee.target_id);
        });
    }

    public hasGroupPermission(user_id: number, group_id: number): Promise<boolean> {
        return Attendee.findOne({
            where: {
                user_id,
                target_id: group_id,
                type: AttendeeType.GROUP,
            }
        }).then((attendee: Attendee | null) => {
            return attendee !== null;
        }).catch((error: Error) => {
            console.log(error);
            return false;
        });
    }



}
