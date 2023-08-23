import {Attendee} from "../model/Attendee";
import {
    AttendeePermission,
    AttendeeType,
    Status,
} from "../core/type";
import { Op } from "sequelize";
import { FirebaseService } from "./FirebaseService";
import { ClientService } from "./ClientService";
import { Client } from "../model/Client";

const config = require('../config/config');

export class AttendeeService {

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
            console.log('AttendeeService: get : ', e);
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
        }).catch((e: any) =>  {
            console.log('AttendeeService: create : ', e);
            return null;
        });
    }

    public add(
        type: AttendeeType,
        userId: number,
        targetId: number,
        permission: AttendeePermission = AttendeePermission.MEMBER,
        firebaseService: FirebaseService = null,
        clientService: ClientService = null,
    ): Promise<Attendee> {

        return this.create(
            type,
            userId,
            targetId,
            permission,  
        ).then((attendee: Attendee | null) => {
            if (attendee && firebaseService) {
                clientService.getByUser(userId).then((clients: Client[]) => {
                    firebaseService.subscribeToGroup(targetId, clients.map(x => x.token));
                });
            }

           return attendee;
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
