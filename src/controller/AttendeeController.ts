import {Attendee} from "../model/Attendee";
import {AttendeeType, Status} from "../core/type";

const config = require('../config/config');

export class AttendeeController {

    public create(
        category: AttendeeType,
        user_id: number,
        target_id: number,
    ): Promise<Attendee> {

        return Attendee.create({
            category,
            user_id,
            target_id,
            status: Status.NORMAL,
        });
    }



}
