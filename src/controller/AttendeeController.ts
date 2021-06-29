import {Attendee} from "../model/Attendee";
import {AttendeeType, Status} from "../core/type";

const config = require('../config/config');

export class AttendeeController {

    public create(
        type: AttendeeType,
        user_id: number,
        target_id: number,
    ): Promise<Attendee> {

        return Attendee.create({
            type,
            user_id,
            target_id,
            status: Status.NORMAL,
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



}
