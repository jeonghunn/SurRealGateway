import { expect } from 'chai';
import request from 'supertest';
import {TestUtil} from "./TestUtil";
import {Test} from "mocha";
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

});
