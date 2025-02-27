import {Group} from "../model/Group";
import {
    AttendeeType,
    PrivacyType,
    Status,
    UserStatus,
} from "../core/type";
import {
    col,
    Op,
} from "sequelize";
import { Client } from "../model/Client";
import { Attendee } from "../model/Attendee";

export class ClientService {

    public create(meta: any): Promise<[Client, boolean]> {

        return Client.upsert(meta).then((result: [Client, boolean]) => {
            return result;
        });
    }

    public getByUser(userId: number): Promise<Client[]> {
        return Client.findAll({
                where: {
                    user_id: userId,
                    status: Status.NORMAL,
                },
            }
        )
    }

    public getAttendeeTokens(targetId: string, excludedUserId: number = null): Promise<string[]> {

        return Client.findAll({
            where: {
                status: Status.NORMAL,
            },
            attributes: ['token'],
            group: ['Client.id'],
            include: [
                {
                    model: Attendee,
                    as: 'attendee',
                    required: true,
                    attributes: [],
                    on: {
                        user_id: { [Op.eq]: col('Client.user_id') },
                    },
                    where: {
                        target_id: targetId,
                        user_id: {
                            [Op.not]: excludedUserId,
                        },
                    },
                },
            ],
        }).then((clients: Client[]) => {
            return clients.map((client: Client) => {
                return client.token;
            });
        });
    }


    public getOSAndBrowser(userAgent: string): { os: string, browser: string } {
        let os = 'Unknown';
        let browser = 'Unknown';
    
        // Define regular expressions to match common OS and browser patterns.
        const osPatterns: { [key: string]: RegExp } = {
            'Windows': /Windows NT [\d.]+/,
            'macOS': /Mac OS X [\d_]+/,
            'Linux': /Linux/,
            'iOS': /iPad|iPhone|iPod/,
            'Android': /Android/
        };
    
        const browserPatterns: { [key: string]: RegExp } = {
            'Chrome': /Chrome\/[\d.]+/,
            'Firefox': /Firefox\/[\d.]+/,
            'Edge': /Edge\/[\d.]+/,
            'Safari': /Safari\/[\d.]+/,
            'Opera': /Opera\/[\d.]+/,
            'IE': /Trident\/[\d.]+|MSIE [\d.]+/
        };
    
        // Find the OS and browser based on the patterns.
        for (const osName in osPatterns) {
            if (osPatterns[osName].test(userAgent)) {
                os = osName;
                break;
            }
        }
    
        for (const browserName in browserPatterns) {
            if (browserPatterns[browserName].test(userAgent)) {
                browser = browserName;
                break;
            }
        }
    
        return { os, browser };
    }
    

    public getName(name: string, userAgent: string) {
        if (name) {
            return name;
        }

        const { os, browser } = this.getOSAndBrowser(userAgent);

        return `${os} ${browser}`;


    }

    public add(
        key: string,
        userId: number,
        ipAddress: string, 
        userAgent: string,
        token: string,
        name: string = null,
        ): Promise<[Client, boolean]> {

            return this.create({
                id: key,
                user_id: userId,
                ip_address: ipAddress,
                user_agent: userAgent,
                token,
                status: Status.NORMAL,
                name: this.getName(name, userAgent),
                last_active: new Date(),
        });
    }

    public get(key: string): Promise<Client | null> {
        return Client.findOne({
            where: {
                id: key,
                status: Status.NORMAL,
            },
        });
    }


}
