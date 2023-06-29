import {Attendee} from "../model/Attendee";
import {
    AttendeePermission,
    AttendeeType,
    FileType,
    Status,
} from "../core/type";
import { Op } from "sequelize";
import {Group} from "../model/Group";
import {RoomService} from "./RoomService";
import {Room} from "../model/Room";
import {Attach} from "../model/Attach";

const config = require('../config/config');
const path = require('path');
const fs = require('fs');
const imageThumbnail = require('image-thumbnail');

export class AttachService {

    public create(meta: any): Promise<Attach> {
        return Attach.create(meta).then((attach: Attach) => {
            return attach;
        });
    }

    public createThumbnail(binaryName: string, width: number, height: number): Promise<any | null> {
        return imageThumbnail(
            path.join(config.attach.path, binaryName),
            {
                width,
                height,
                responseType: 'buffer',
                fit: 'cover',
            },
            ).then((thumbnail: any) => {
            return fs.writeFile(path.join(config.attach.path, 'thumbnail', `${width}x${height}`, binaryName), thumbnail, (err: any) => {
                if (err) {
                    console.log('[Thumbnail] : Thumbnail not created. ', err);
                    return null;
                }

                return thumbnail;

            });
        });
    }

    public getPath(attach: Attach, width: number, height: number): string {
        if(attach?.type === FileType.IMAGE) {
            if(width && height) {
                return path.join(config.attach.path, 'thumbnail', `${width}x${height}`, attach.binary_name);
            }
        }

        return path.join(config.attach.path, attach.binary_name);

    }



    public get(
        binaryName: string,
        width: number = null,
        height: number = null,
        ): Promise<Attach | null> {
        return Attach.findOne({
            where: {
                binary_name: binaryName,
                status: Status.NORMAL,
            }
        }).catch((result) => {
            console.log('[Error] : get from AttachService', result);
            return null;
        }).then((attach: Attach | null) => {

            if (attach.type === FileType.IMAGE && width && height) {
                fs.access(path.join(config.attach.path, 'thumbnail', `${width}x${height}`, binaryName), fs.F_OK, (err: any) => {

                    if (err) {
                        console.log('[Thumbnail] : Thumbnail not found. Creating thumbnail... ', `${width}x${height}`);
                        return this.createThumbnail(binaryName, width, height).then(() => {
                            return attach;
                        });
                    }

                    return attach;
                    
                });
            }

            return attach;
        });
    }

    public isImage(extension: string): boolean {
        const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
        return allowedExtensions.includes(extension);
    }

    public getFileType(extension: string, mimetype: string): FileType {
        return this.isImage(extension) && mimetype.includes('image') ? FileType.IMAGE : FileType.BINARY;
    }

    public getFileNameAndExtension(name: string): any {
        return path.parse(name);
    }

    public getUrl(attach: Attach): string {

        return config.attach.cdnUrl + attach.binary_name;
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
