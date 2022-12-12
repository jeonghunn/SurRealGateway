import {Attendee} from "../model/Attendee";
import {
    AttendeePermission,
    AttendeeType,
    Status,
} from "../core/type";
import { Op } from "sequelize";
import {Group} from "../model/Group";
import {RoomController} from "./RoomController";
import {Room} from "../model/Room";
import {Attach} from "../model/Attach";

const config = require('../config/config');

export class AttachController {

    public create(meta: any): Promise<Attach> {
        const roomController: RoomController = new RoomController();

        return Attach.create(meta).then((attach: Attach) => {
            return attach;
        });
    }

}
