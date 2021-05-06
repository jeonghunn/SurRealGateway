import {User} from '../model/user';
import jsonwebtoken from "jsonwebtoken";
import bcrypt from 'bcrypt';
import {Gender} from "../model/type";
import {Room} from "../model/room";

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
