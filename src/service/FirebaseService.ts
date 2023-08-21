
import { google } from 'googleapis';
import { initializeApp } from 'firebase-admin/app';
import { getMessaging } from 'firebase-admin/messaging';
import { credential } from 'firebase-admin';

const config = require('../config/config');
const request = require('request');


export class FirebaseService {

    public app: any = initializeApp({
        credential: credential.applicationDefault(),
      });


    public subscribeToTopic(token: string, topic: string): Promise<any> {
        return getMessaging().subscribeToTopic(token, topic);
    }

    public unsubscribeFromTopic(token: string, topic: string): Promise<any> {
        return getMessaging().unsubscribeFromTopic(token, topic);
    }

    public sendPushToTopic(topic: string, title: string, body: string, data: any): Promise<any> {
        return getMessaging().send({
            notification: {
                title,
                body,
            },
            data,
            topic,
            webpush: {
                fcmOptions: {
                    link: "https://dummypage.com"
                }
            }
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
