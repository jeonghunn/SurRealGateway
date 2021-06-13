import { Room } from "../model/Room";

const config = require('../config/config');

export class RoomController {

    public create(
        user_id: number,
        name?: string,
        description?: string,
        ip_address?: string,
        limit: number = 10,

    ): Promise<Room> {

        return Room.create({
            user_id,
            name,
            description,
            ip_address,
            limit,
        });
    }

}
