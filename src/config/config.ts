import { credential } from "firebase-admin";

module.exports = (() => {
    return {
        serverDomain: process.env.SERVER_DOMAIN,
        environment: process.env.NODE_ENV || 'development',
        jwt: {
            algorithms: ['HS256'],
            secret: process.env.JWT_SECRET,
        },
        attach: {
            cdnUrl: '',
            path: process.env.ATTACH_PATH,
            sizeLimit: 100 * 1024 * 1024,
        },
        openAI: {
            apiKey: process.env.OPENAI_API_KEY,
        },
        frontUrl: process.env.FRONT_URL,
        aws: {
            credentials: {
                region: process.env.AWS_REGION,
                credentials: {
                    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
                    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
                },
            },
            bucket: process.env.AWS_S3_BUCKET_NAME,
            
        }
    }
})();
