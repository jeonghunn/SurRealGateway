import {Attendee} from "../model/Attendee";
import {
    AttendeePermission,
    AttendeeType,
    Status,
} from "../core/type";
import { Op } from "sequelize";
import {Group} from "../model/Group";
import {RoomService} from "./RoomService";
import {Room} from "../model/Room";
import {Attach} from "../model/Attach";

const config = require('../config/config');

export class AttachService {

    public create(meta: any): Promise<Attach> {
        const roomService: RoomService = new RoomService();

        return Attach.create(meta).then((attach: Attach) => {
            return attach;
        });
    }


}
