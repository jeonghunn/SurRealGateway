import {Attendee} from "../model/Attendee";
import {
    AttachStatus,
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
const ffmpegCommand = require('fluent-ffmpeg');

export class AttachService {

    public create(meta: any): Promise<Attach> {
        const isConvertNeeded: boolean = meta.type === FileType.VIDEO && !this.isHtmlVideo(meta.extension);

        if(isConvertNeeded) {
            meta.status = AttachStatus.PROCESSING;
        }

        return Attach.create(meta).then((attach: Attach) => {
            if (isConvertNeeded) {
                this.convertVideo(attach);
            }

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
                withMetaData: true,
            },
            ).then((thumbnail: any) => {
            return fs.writeFile(path.join(config.attach.path, 'thumbnail', `${width}x${height}`, binaryName), thumbnail, (err: any) => {
                if (err) {
                    console.log('[Thumbnail] : Thumbnail creation has been failed. ', err);
                    return null;
                }

                return thumbnail;

            });
        }).catch(() => {
            console.log('[Thumbnail] : Thumbnail not created. ');
        });
    }

    public isHtmlVideo(extension: string): boolean {
        const allowedExtensions: string[] = ['.mp4', '.webm'];
        return allowedExtensions.includes(extension);
    }

    public getPath(
        attach: Attach,
        width: number = null,
        height: number = null,
        prefer: string = null,
        ): string {
        if(attach?.type === FileType.IMAGE) {
            if(width && height) {
                return path.join(config.attach.path, 'thumbnail', `${width}x${height}`, attach.binary_name);
            }
        } else if(attach?.type === FileType.VIDEO && prefer === 'video/mp4' && !this.isHtmlVideo(attach.extension)) {
            return path.join(config.attach.path, 'video', 'mp4', attach.binary_name);
        }

        return this.getDefaultPath(attach);

    }

    public getDefaultPath(attach: Attach): string {
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
                status: {[Op.ne]: AttachStatus.REMOVED},
            }
        }).catch((result) => {
            console.log('[Error] : get from AttachService', result);
            return null;
        }).then((attach: Attach | null) => {

            if (attach?.type === FileType.IMAGE && width && height) {
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

    public isVideo(extension: string): boolean {
        const allowedExtensions = ['.mp4', '.mov', '.avi', '.wmv', '.flv', '.webm'];
        return allowedExtensions.includes(extension);
    }

    public getFileType(extension: string, mimetype: string): FileType {
        if (this.isImage(extension) && mimetype.includes('image')) {
            return FileType.IMAGE;
        }

        if (this.isVideo(extension) && mimetype.includes('video')) {
            return FileType.VIDEO;
        }

        return FileType.BINARY;
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

    public convertVideo(attach: Attach): Promise<any> {
        return new Promise<any>(() => {

            var command = ffmpegCommand(this.getDefaultPath(attach))
                            // .audioCodec('libfaac')
                            // .videoCodec('libx264')
                            .format('mp4');

            command.save(this.getPath(attach, null, null, 'video/mp4'));
            command.on('end', () => {
                console.log('[AttachService] Video Converter Completed', attach.binary_name);
                attach.update({
                    status: AttachStatus.NORMAL,
                });
                
            });
            command.on('error', (err: any) => {
                console.log('[AttachService] Video Converter Error : ' + err);
                attach.update({
                    status: AttachStatus.NORMAL,
                });
            });

        });
    }


}
