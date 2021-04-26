import { expect } from 'chai';
import request from 'supertest';
import {UserController} from "../controller/UserController";
import {User} from "../model/user";
let app = require('../app');

describe('User', () => {
    const text: string = new Date().getTime().toString();

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



});
