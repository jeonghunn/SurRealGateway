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
const path = require('path');

export class AttachService {

    public create(meta: any): Promise<Attach> {
        return Attach.create(meta).then((attach: Attach) => {
            return attach;
        });
    }

    public isImage(extension: string): boolean {
        const allowedExtensions = ['jpg', 'jpeg', 'png', 'gif'];
        return allowedExtensions.includes(extension);
    }

    public getFileType(fileName: string): string {
        return this.isImage(fileName) ? 'IMAGE' : 'OBJECT';
    }

    public getFileNameAndExtension(name: string): any {
        return path.parse(name);
    }

    public saveFile(file: any): Promise<boolean> {

        const path = config + file.name;

        return file.mv(path, (err: any) => {
            if (err) {
                console.error('AttachService Error: ' ,err);
                return false;
            }
            return true;
        });
    }

    public upload(file: any): Promise<Attach> {
        return this.saveFile(file).then(() => {
            const attach: Attach = new Attach();

            return this.create(attach);
        });
    }


}
