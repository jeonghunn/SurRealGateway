import { expect } from 'chai';
import request from 'supertest';
import {UserController} from "../controller/UserController";
import {User} from "../model/User";
import {TestUtil} from "./TestUtil";
import {RelationController} from "../controller/RelationController";
let app = require('../app');

describe('User', () => {
    const text: string = new Date().getTime().toString();
    const testUtil: TestUtil = new TestUtil();
    let newUserToken: string;
    let newUserId: number;

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

                newUserToken = res.body.token;
                newUserId = res.body.user_id;

                const userController: UserController = new UserController();
                userController.getByEmail(`${text}`, `${text}.com`).then((result) =>{

                    expect(result).not.to.be.null;
                    done();
                });

            });


    });

    it('Friend Request', (done) => {
        request(app)
            .post('/user/22/friend')
            .set('Authorization', `Bearer ${newUserToken}`)
            .expect(200)
            .end((err, res) => {
                if (err) {
                    console.log(err, res);
                    return;
                }
                done();
            });
    });

    it('Start Chat With Friend', (done) => {
        request(app)
            .post('/user/22/chat')
            .set('Authorization', `Bearer ${newUserToken}`)
            .expect(200)
            .end((err, res) => {
                if (err) {
                    console.log(err, res);
                    return;
                }

                expect(res.body.group.id).not.equals(undefined);
                done();
            });
    });

    it('Friend Accept', (done) => {
        testUtil.signIn().end((err, response: any) => {
            request(app)
                .post(`/user/${newUserId}/friend`)
                .set('Authorization', `Bearer ${response.body.token}`)
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

    it('Get Friend List', (done) => {
        testUtil.signIn().end((err, res) => {
            request(app)
                .get('/user/friends')
                .set('Authorization', `Bearer ${newUserToken}`)
                .expect(200)
                .end((err, res) => {
                    if (err) {
                        console.log(err, res);
                        return;
                    }

                    expect(res.body.relations.length).equals(1)

                    done();
                });
        });
    });

    it('UnFriend Request', (done) => {
        const relationController: RelationController = new RelationController();
        testUtil.signIn().end((err, res) => {
            request(app)
                .delete('/user/22/friend')
                .set('Authorization', `Bearer ${newUserToken}`)
                .expect(200)
                .end((err, res) => {
                    if (err) {
                        console.log(err, res);
                        return;
                    }

                    relationController.getList(newUserId, 22).then((result) => {
                        expect(result?.length).equals(0);
                        done();
                    });

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

    it('User - Get Info', (done) => {
        const testUtil: TestUtil = new TestUtil();
        testUtil.signIn().end((err, res) => {
            request(app)
                .get('/user/1')
                .set('Authorization', `Bearer ${res.body.token}`)
                .send({})
                .expect(200)
                .end((err, res) => {
                    if (err) {
                        console.log(err, res);
                        return;
                    }
                    expect(res.body.user.name).exist;
                    done();
                });
        });
    });

    it('User - Get Info Without Signing In', (done) => {
        const testUtil: TestUtil = new TestUtil();
        testUtil.signIn().end((err, res) => {
            request(app)
                .get('/user/1')
                .send({})
                .expect(401)
                .end((err, res) => {
                    done();
                });
        });
    });

});
