import {
    PutObjectCommandOutput,
    S3,
} from "@aws-sdk/client-s3";
import * as fs from 'fs';

const config = require('../config/config');


export class CdnService {

    private pathPrefix: string = config.environment?.length > 0 ? `${config.environment}/` : '';
    private s3 = new S3(config.aws.credentials);

    public upload(
        binaryName: string,
        filePath: string,
        shouldDelete: boolean = true,
    ): Promise<any> {

        return new Promise((resolve, reject) => {
             resolve(fs.createReadStream(filePath));
    }).then((stream: any) => {
        return this.uploadBuffer(binaryName, stream).then((result: PutObjectCommandOutput | null) => {
            if (shouldDelete && result) {

                fs.unlink(filePath, (err: any) => {
                    if (err) {
                        console.error('CdnService Error: ', err);
                    }
                });
            }

            return result;
        });
    });
    }


    public getLink(keyValue: string): string {

        return `https://${config.aws?.bucket}.s3.${config.aws?.credentials?.region}.amazonaws.com/${this.pathPrefix}${keyValue}`;
    }

    public uploadBuffer(
        binaryName: string,
        buffer: Buffer,
    ): Promise<PutObjectCommandOutput | null> {

        return this.s3.putObject({
            Bucket: config.aws.bucket,
            Key: `${this.pathPrefix}${binaryName}`,
            Body: buffer,
        }).then((result: PutObjectCommandOutput) => {
            return result;
        }).catch((err: any) => {
            console.error('CdnService Error: ', err);
            return null;
        });
    }
    


    public delete(keyValue: string): Promise<any> {
        return this.s3.deleteObject({
            Bucket: config.aws.bucket,
            Key: `${this.pathPrefix}${keyValue}`,
        }).then(() => {
            return true;
        }).catch((err: any) => {
            console.error('CdnService Error: ', err);
            return false;
        });
    }

    public isFileExist(keyValue: string): Promise<boolean> {
        return this.s3.headObject({
            Bucket: config.aws.bucket,
            Key: `${this.pathPrefix}${keyValue}`,
        }).then(() => {
            return true;
        }).catch(() => {
            return false;
        });
    }
    

}