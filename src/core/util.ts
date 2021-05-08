
export class Util {

    public getIPAddress(request: any): string {
        return request.headers['x-forwarded-for'] || request.connection.remoteAddress;
    }

}

