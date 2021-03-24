import { expect } from 'chai';
import request from 'supertest';
let app = require('../app');

describe('User', () => {
    it('Sign Up', (done) => {
        const text: string = new Date().getTime().toString();
        request(app)
            .post('/user')
            .send({
                email: `${text}@${text}.com`,
                password: '123456',
                name: 'Hihi',
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
