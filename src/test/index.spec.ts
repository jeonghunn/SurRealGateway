import { expect } from 'chai';
import request from 'supertest';
import * as express from 'express';
let app = require('../app');

describe('GET /', () => {
    it('should respond with text message "Welcome"', (done) => {
        request(app)
            .get('/')
            .expect(200)
            .end((err, res) => {
                if (err) {
                    done(err);
                    return;
                }

                expect(res.text).contains('Welcome');
                done();
            });
    });
});

