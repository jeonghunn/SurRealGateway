import { expect } from 'chai';
import request from 'supertest';
import {UserController} from "../controller/UserController";
import {User} from "../model/user";
import {TestUtil} from "./TestUtil";
let app = require('../app');

describe('User', () => {
    const text: string = new Date().getTime().toString();

    it('Sign Up - Validation Test', (done) => {
        request(app)
            .post('/user')
            .send({
                email: `com`,
                password: '123456',
                name: 'Hihi',
            })
            .expect(400)
            .end((err, res) => {
                if (err) {
                    console.log(err, res);
                    return;
                }
                done();
            });


    });

    it('Sign Up', (done) => {
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

                const userController: UserController = new UserController();
                userController.getByEmail(`${text}`, `${text}.com`).then((result) =>{

                    expect(result).not.to.be.null;
                    done();
                });

            });


    });

    it('Duplicated Account Test', (done) => {
        request(app)
            .post('/user')
            .send({
                email: `${text}@${text}.com`,
                password: '123456',
                name: 'Hihi',
            })
            .expect(409)
            .end((err, res) => {
                if (err) {
                    console.log(err, res);
                    return;
                }

                done();
            });
    });

    it('Sign In', (done) => {
        request(app)
            .post('/user/signin')
            .send({
                email: `${text}@${text}.com`,
                password: '123456',
            })
            .expect(200)
            .end((err, res) => {
                if (err) {
                    console.log(err, res);
                    return;
                }

                console.log(res);
                expect(res.body.token).not.to.be.null;
                done();
            });
    });

    it('User Verify', (done) => {
        const testUtil: TestUtil = new TestUtil();
        testUtil.signIn().end((err, res) => {
            request(app)
                .get('/user/verify')
                .set('Authorization', `Bearer ${res.body.token}`)
                .send({
                })
                .expect(200)
                .end((err, res) => {
                    if (err) {
                        console.log(err, res);
                        return;
                    }

                    expect(res.body.user.email_name).equals('test');
                    done();
                });
        });


    });



});
