import { expect } from 'chai';
import request from 'supertest';
import {TestUtil} from "./TestUtil";
import {Test} from "mocha";
let app = require('../app');

describe('Group', () => {
    const text: string = new Date().getTime().toString();


    it('Get a Group', (done) => {
        const testUtil: TestUtil = new TestUtil();
        testUtil.signIn().end((err, res) => {
            request(app)
                .get('/group/1')
                .set('Authorization', `Bearer ${res.body.token}`)
                .query({})
                .expect(200)
                .end((err, res) => {
                    if (err) {
                        console.log(err, res);
                        return;
                    }

                    expect(res.body.group.name).exist;

                    done();
                });
        });


    });

});
