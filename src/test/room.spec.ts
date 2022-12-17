import {expect} from 'chai';
import request from 'supertest';
import {TestUtil} from "./TestUtil";
import {ChatService} from "../service/ChatService";
import {Chat} from "../model/Chat";
import {Status} from "../core/type";

let app = require('../app');

describe('Room', () => {
    const text: string = new Date().getTime().toString();
    let roomId: number = 0;

    it('Create Room', (done) => {
        const testUtil: TestUtil = new TestUtil();
        testUtil.signIn().end((err, res) => {
            request(app)
                .post('/group/2/room')
                .set('Authorization', `Bearer ${res.body.token}`)
                .send({
                    group_id: 1,
                })
                .expect(200)
                .end((err, res) => {
                    if (err) {
                        console.log(err, res);
                        return;
                    }

                    roomId = res.body.id;

                    done();
                });
        });


    });

    it('Get a Room', (done) => {
        const testUtil: TestUtil = new TestUtil();
        testUtil.signIn().end((err, res) => {
            request(app)
                .get(`/group/2/room/${roomId}`)
                .set('Authorization', `Bearer ${res.body.token}`)
                .query({})
                .expect(200)
                .end((err, res) => {
                    if (err) {
                        console.log(err, res);
                        return;
                    }

                    expect(res.body.room.id).exist;

                    done();
                });
        });
    });

    it('Get Room List', (done) => {
        const testUtil: TestUtil = new TestUtil();
        testUtil.signIn().end((err, res) => {
            request(app)
                .get('/group/2/room')
                .set('Authorization', `Bearer ${res.body.token}`)
                .query({
                    offset: 0,
                    limit: 15,
                    before: new Date().getTime() / 1000,
                })
                .expect(200)
                .end((err, res) => {
                    if (err) {
                        console.log(err, res);
                        return;
                    }

                    expect(res.body.rooms.length).greaterThan(0);

                    done();
                });
        });


    });

    it('Get Chat Message List', (done) => {
        const testUtil: TestUtil = new TestUtil();
        const chatService: ChatService = new ChatService();
        const before: number = new Date().getTime() / 1000;
        const chat: Chat = new Chat();






        testUtil.signIn().end( (err, res) => {

            console.log("EWFWEFWEFWEFWEF", res.body.user_id)

            chat.content = "TEST"
            chat.createdAt = new Date(new Date().getTime() - 30000);
            chat.status = Status.NORMAL;
            chat.room_id = roomId;
            chat.user_id = res.body.user_id;
            chat.save();


            request(app)
                .get(`/group/2/room/${roomId}/chat`)
                .set('Authorization', `Bearer ${res.body.token}`)
                .query({
                    offset: 0,
                    limit: 15,
                    before: before,
                })
                .expect(200)
                .end((err, res) => {
                    if (err) {
                        console.log(err, res);
                        return;
                    }

                    expect(res.body.chats.length).greaterThan(0);

                    done();
                });

        });


    });

});
