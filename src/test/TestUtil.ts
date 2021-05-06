import { expect } from 'chai';
import request, {SuperTest, Test} from 'supertest';
import supertest from "supertest";
let app = require('../app');

export class TestUtil {

public signIn(): supertest.Test {
    return request(app)
        .post('/user/signin')
        .send({
            email: `test@test.com`,
            password: '12345678',
        })
        .expect(200);
}

}
