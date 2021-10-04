import { Room } from "../model/Room";
import { Status } from "../core/type";

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

        return Room.create({
            user_id,
            group_id,
            name,
            description,
            ip_address,
            limit,
            status: Status.NORMAL,
        });
    }

}
