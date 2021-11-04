import { Room } from "../model/Room";
import {
    AttendeePermission,
    AttendeeType,
    Status,
} from "../core/type";
import { AttendeeController } from "./AttendeeController";
import {Op} from "sequelize";

const config = require('../config/config');

export class RoomController {

    public create(
        user_id: number,
        group_id: number,
        name?: string,
        description?: string,
        ip_address?: string,
        limit: number = 10,

    ): Promise<Room> {
        const attendeeController: AttendeeController = new AttendeeController();

        return Room.create({
            user_id,
            group_id,
            name,
            description,
            ip_address,
            limit,
            status: Status.NORMAL,
        }).then((room: Room) => {

            attendeeController.create(
                AttendeeType.ROOM,
                user_id,
                room.id,
                AttendeePermission.ADMIN,
            )

            return room;
        });
    }


    public getList(group_id: number, before: Date, offset: number = 0, limit: number = 15): Promise<Room[]> {
        return Room.findAll(
            {
                where: {
                    status: Status.NORMAL,
                    group_id,
                    createdAt: {[Op.lte]: before},
                },
                order: [
                    ['id', 'DESC'],
                ],
                offset,
                limit,
            }
        )
    }
}
