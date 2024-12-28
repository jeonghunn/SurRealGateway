
import { google } from 'googleapis';
import { getMessaging, MulticastMessage } from 'firebase-admin/messaging';
import { AttendeeService } from './AttendeeService';
import { Client } from '../model/Client';
import { AttendeeType } from '../core/type';

const config = require('../config/config');
const request = require('request');


export class FirebaseService {

    private readonly APP_NAME: string = 'surreal-b57e6';
    private readonly PUSH_API_URL: string = `https://fcm.googleapis.com/v1/projects/${this.APP_NAME}/messages:send`;
    private readonly AUTH_MESSAGING_API_URL: string = 'https://www.googleapis.com/auth/firebase.messaging';


    public subscribeToTopic(tokens: string[], topic: string): Promise<any> {
        return getMessaging().subscribeToTopic(tokens, topic).catch((error: any) => {
            console.log('[FirebaseService] Error:', error);
            return null;
        });
    }
    
    public subscribeToGroup(groupId: string, tokens: string[]): Promise<any> {
        if (!tokens || tokens.length === 0) {
            return Promise.resolve();
        }

        console.log('subscribeToGroup', groupId, tokens);
        return this.subscribeToTopic(tokens, this.getTopicName(groupId));
    }

    public unsubscribeFromGroup(groupId: string, token: string): Promise<any> {
        if(!token) {
            return Promise.resolve();
        }

        console.log('unsubscribeFromGroup', groupId, token);
        return this.unsubscribeFromTopic(token, this.getTopicName(groupId));
    }

    public unsubscribeFromTopic(token: string, topic: string): Promise<any> {
        return getMessaging().unsubscribeFromTopic(token, topic).catch((error: any) => {
            console.log('[FirebaseService] Error:', error);
            return null;
        });
    }

    public getTopicName(groupId: string): string {
        return `group_${groupId}`;
    }

    public sendNotificationToTopic(
        groupId: string,
        title: string,
        body: string,
        url: string,
        message: any = null,
        ): Promise<any> {
        return this.sendPushToTopic(this.getTopicName(groupId), title, body, url, message);
    }

    public async registerAttendee(
        attendeeService: AttendeeService,
        userId: number,
        client: Client,
        currentClient: Client | null,
    ): Promise<void> {
      attendeeService.getList(AttendeeType.GROUP, userId).then((attendeeIds: any) => {
        attendeeIds?.forEach((attendeeId: any) => {

            if (currentClient) {
                this.unsubscribeFromGroup(attendeeId, currentClient.token);
            }
            
            this.subscribeToGroup(attendeeId, [client.token]);
        });
    });
    }

    public sendPushToTopic(
        topic: string,
        title: string,
        body: string,
        url: string,
        message: any = null,
        ): Promise<any> {
        return getMessaging().send({
            data: {
                title,
                body,
                url,
                user_id: message?.user?.id?.toString()!!,
            },
            topic,
            webpush: {
                fcmOptions: {
                    link: url,
                }
            }
        }).then((response: any) => {
            if (!response[0]?.success) {
                console.log('[FirebaseService] Error:', response.success);
                return response;
            }
            
            console.log('Successfully sent message:', response);
            return response;
        }).catch((error: any) => {
            console.log('[FirebaseService] Error:', error);
            return {};
        });
    }

    public getAccessToken(): Promise<string> {
        return new Promise((resolve, reject) => {
          const key = config.google;
          const jwtClient = new google.auth.JWT(
            key.client_email,
            null,
            key.private_key,
            this.AUTH_MESSAGING_API_URL,
            null
          );
          jwtClient.authorize((err: any, tokens: any) =>{
            if (err) {
              reject(err);
              return;
            }
            resolve(tokens.access_token);
          });
        });
    }

    public sendPush(
        token: string,
        title: string,
        body: string,
        url: string,
        message: any = null,
        ): Promise<any> {
        return getMessaging().send({
            data: {
                title,
                body,
                url,
                user_id: message?.user?.id?.toString()!!,
            },
            token,
            webpush: {
                fcmOptions: {
                    link: url,
                }
            }
        }).then((response: any) => {

            if (!response[0]?.success) {
                console.log('[FirebaseService] Error:', response.success);
                return response;
            }
            
            console.log('Successfully sent message:', response);
            return response;


        }).catch((error: any) => {
            console.log('[FirebaseService] Error:', error);
            return {};
        });

      }

      public sendPushMultiple(
        tokens: string[],
        title: string,
        body: string,
        url: string,
        message: any = null,
        ): Promise<any> {
        
        if (!tokens || tokens.length === 0) {
            return Promise.resolve();
        }

        return getMessaging().sendEachForMulticast({
            data: {
                title,
                body,
                url,
                user_id: message?.user?.id?.toString()!!,
            },
            tokens,
            webpush: {
                fcmOptions: {
                    link: url,
                }
            }
        }).then((response: any) => {

            if (!response?.responses[0].success) {
                console.log('[FirebaseService] Error:', response?.responses[0].error);
                return response;
            }
            
            console.log('Successfully sent message:', response);
            return response;
        }).catch((error: any) => {
            console.log('[FirebaseService] Error:', error);
            return {};
        });

      }
      
       


}
