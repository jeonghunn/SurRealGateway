module.exports = (() => {
    return {
        serverDomain: 'surreal.io',
        environment: 'development',
        jwt: {
            algorithms: ['HS256'],
            secret: 'TEST_SERVER_SECRET',
        },
        attach: {
            cdnUrl: 'http://localhost:3000/attach/',
            path: '../attach/',
            sizeLimit: 100 * 1024 * 1024,
        },
    }
})();
