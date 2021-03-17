import { expect } from 'chai';
import request from 'supertest';
let app = require('../app');

describe('User', () => {
    it('Quick Sign Up', (done) => {
        request(app)
            .post('/user/guest')
            .send({
            })
            .set('x-machine-id','test')
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
