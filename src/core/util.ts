import {
    NextFunction,
    Request,
    Response,
} from "express";
import { validationResult } from "express-validator";

export class Util {

    // Validation
    public validate: any = (validations: any) => {
        return async (request: Request, response: Response, next: NextFunction) => {
            await Promise.all(validations.map((validation: any) => validation.run(request)));

            const errors = validationResult(request);
            if (errors.isEmpty()) {
                return next();
            }

            response.status(400).json({ errors: errors.array() });
        };
    };

    public getIPAddress(request: any): string {
        return request.headers['x-forwarded-for'] || request.connection.remoteAddress;
    }

}

