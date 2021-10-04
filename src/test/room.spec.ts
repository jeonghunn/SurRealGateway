import { expect } from 'chai';
import request from 'supertest';
import {TestUtil} from "./TestUtil";
import {Test} from "mocha";
let app = require('../app');

describe('Room', () => {
    const text: string = new Date().getTime().toString();

    it('Create Room', (done) => {
        const testUtil: TestUtil = new TestUtil();
        testUtil.signIn().end((err, res) => {
            request(app)
                .post('/room')
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


                    done();
                });
        });


    });

    it('Get Room List', (done) => {
        const testUtil: TestUtil = new TestUtil();
        testUtil.signIn().end((err, res) => {
            request(app)
                .get('/room')
                .set('Authorization', `Bearer ${res.body.token}`)
                .query({
                    group_id: 1,
                    offset: 0,
                    limit: 15,
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
