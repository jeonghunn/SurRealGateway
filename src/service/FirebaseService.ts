
import { google } from 'googleapis';
import { getMessaging } from 'firebase-admin/messaging';

const config = require('../config/config');
const request = require('request');


export class FirebaseService {


    public subscribeToTopic(tokens: string[], topic: string): Promise<any> {
        return getMessaging().subscribeToTopic(tokens, topic).catch((error: any) => {
            console.log('[FirebaseService] Error:', error);
            return null;
        });
    }
    
    public subscribeToGroup(groupId: number, tokens: string[]): Promise<any> {
        if (!tokens || tokens.length === 0) {
            return Promise.resolve();
        }

        console.log('subscribeToGroup', groupId, tokens);
        return this.subscribeToTopic(tokens, this.getTopicName(groupId));
    }

    public unsubscribeFromGroup(groupId: number, token: string): Promise<any> {
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

    public getTopicName(groupId: number): string {
        return `group_${groupId}`;
    }

    public sendNotificationToTopic(
        groupId: number,
        title: string,
        body: string,
        url: string,
        message: any = null,
        ): Promise<any> {
        return this.sendPushToTopic(this.getTopicName(groupId), title, body, url, message);
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
            console.log('Successfully sent message:', response);
            return response;
        }).catch((error: any) => {
            console.log('[FirebaseService] Error:', error);
            return null;
        });
    }

    public getAccessToken(): Promise<string> {
        return new Promise(function(resolve, reject) {
          const key = config.google;
          const jwtClient = new google.auth.JWT(
            key.client_email,
            null,
            key.private_key,
            'https://www.googleapis.com/auth/firebase.messaging',
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

    public sendNotification(token: string, title: string, body: string, data: any): Promise<any> {
        return this.getAccessToken().then((accessToken: string) => {
            const message = {
                message: {
                  notification: {
                    title,
                    body,
                  },
                  data,
                  token,
                  webpush: {
                    fcm_options: {
                      link: "https://dummypage.com"
                    }
                  }
                },
              };
            const url = 'https://fcm.googleapis.com/v1/projects/surreal-b57e6/messages:send';
            const options = {
                method: 'POST',
                uri: url,
                body: message,
                json: true,
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${accessToken}`,
                },
              };
            
            return request.post(options, (err: any, httpResponse: any, body: any) => {
                if (err) {
                  console.error('Error while sending: ', err);
                  return;
                }
                console.log('Sent, http code: ', httpResponse.statusCode);
                console.log(body);
              }
            );
          });
    }


}
