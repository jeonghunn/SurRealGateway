import {Attendee} from "../model/Attendee";
import {
    AttachStatus,
    AttachStorage,
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
import { CdnService } from "./CdnService";
import { storage } from "googleapis/build/src/apis/storage";

const config = require('../config/config');
const path = require('path');
const fs = require('fs');
const imageThumbnail = require('image-thumbnail');
const ffmpegCommand = require('fluent-ffmpeg');

export class AttachService {

    public cdnService: CdnService = new CdnService();

    public create(meta: any): Promise<Attach> {
        let isConvertNeeded: boolean = false;

        if (meta.type === FileType.VIDEO) {
            meta.status = AttachStatus.UNPROCESSED;
            isConvertNeeded = !this.isHtmlVideo(meta.extension);
        }

        if(isConvertNeeded) {
            meta.status = AttachStatus.PROCESSING;
        }

        return Attach.create(meta).then((attach: Attach) => {
            if (isConvertNeeded) {
                this.convertVideo(attach);
            }

            this.createThumbnailIfNotExists(attach, 160, 160);


            this.cdnService.upload(attach.binary_name, this.getDefaultPath(attach)).then((result: any) => {
                console.log('[AttachService] : Upload to CDN completed. ', result);
            }).catch((err: any) => {
                console.log('[AttachService] : Upload to CDN failed. ', err);
                attach.storage = AttachStorage.LOCAL;
                attach.save();
            });

            return attach;
        });
    }

    public createThumbnail(binaryName: string, width: number, height: number): Promise<any | null> {

        console.log('[Thumbnail] : Creating thumbnail... ', `${width}x${height}`);

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
            // return fs.writeFile(path.join(config.attach.path, 'thumbnail', `${width}x${height}`, binaryName), thumbnail, (err: any) => {
            //     if (err) {
            //         console.log('[Thumbnail] : Thumbnail creation has been failed. ', err);
            //         return null;
            //     }

            //     return thumbnail;

            // });

            console.log('[Thumbnail] : Thumbnail created. ', `${width}x${height}`);

            return this.cdnService.uploadBuffer(path.join('thumbnail', `${width}x${height}`, binaryName), thumbnail);
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
                return path.join('thumbnail', `${width}x${height}`, attach.binary_name);
            }
        } else if(attach?.type === FileType.VIDEO && prefer === 'video/mp4' && !this.isHtmlVideo(attach.extension)) {
            return path.join('video', 'mp4', attach.binary_name);
        }

        return attach.binary_name;

    }

    public getLocalPath(
        attach: Attach,
        width: number = null,
        height: number = null,
        prefer: string = null,
    ) {
        return path.join(config.attach.path, this.getPath(attach, width, height, prefer));
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
            if (attach) {
                return this.createThumbnailIfNotExists(attach, width, height);
            }

            return null;
        });
    }

    public createThumbnailIfNotExists(attach: Attach, width: number, height: number): Promise<any | null> {
        if (attach?.type === FileType.IMAGE && width && height) {
            fs.access(path.join(config.attach.path, 'thumbnail', `${width}x${height}`, attach.binary_name), fs.F_OK, (err: any) => {

                if (err) {
                    console.log('[Thumbnail] : Thumbnail not found. Creating thumbnail... ', `${width}x${height}`);
                    return this.createThumbnail(attach.binary_name, width, height).then(() => {
                        return attach;
                    });
                }

                return attach;
                
            });
        }

        return Promise.resolve(attach);

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

    public getUrls(attach: Attach): any {
        let origin: string | null = null;
        let thumbnail: string | null = null;
        let converted: string | null = null;

        switch (attach.storage) {
            case AttachStorage.LOCAL:
                origin = config.attach.cdnUrl + attach.binary_name;
                break;
            default:
                // Amazon S3
                origin = this.cdnService.getLink(attach.binary_name);
                thumbnail = this.cdnService.getLink(`thumbnail/160x160/${attach.binary_name}`);
                converted = this.cdnService.getLink(`video/mp4/${attach.binary_name}`);
                break;
        }

        return {
            origin,
            thumbnail,
            converted,
        }
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
            let command: any = ffmpegCommand(this.getLocalPath(attach))
                            // .audioCodec('libfaac')
                            // .videoCodec('libx264')
                            //limit cpu usage
                          //  .addOption('-threads', '1')
                            .format('mp4');

            let localSavePath: string = this.getLocalPath(attach, null, null, 'video/mp4');

            command.save(localSavePath);
            command.on('end', () => {
                console.log('[AttachService] Video Converter Completed', attach.binary_name);

                this.cdnService.upload(
                    this.getPath(attach, null, null, 'video/mp4'),
                    localSavePath,
                ).then(() => {
                    attach.update({
                        status: AttachStatus.NORMAL,
                    });
                }).catch((err: any) => {
                    console.log('[AttachService] Failed to upload to CDN (Converted Video) : ' + err);
                });
                
            });
            command.on('error', (err: any) => {
                console.log('[AttachService] Video Converter Error : ' + err);
                attach.update({
                    status: AttachStatus.UNPROCESSED,
                });
            });

        });
    }


}
