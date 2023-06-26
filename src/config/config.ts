module.exports = (() => {
    return {
        serverDomain: 'surreal.io',
        jwt: {
            algorithms: ['HS256'],
            secret: 'TEST_SERVER_SECRET',
        },
        attach: {
            cdnUrl: 'http://localhost:8000/',
            path: '../attach/',
        },
    }
})();
