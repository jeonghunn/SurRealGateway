module.exports = (() => {
    return {
        serverDomain: 'surreal.io',
        jwt: {
            algorithms: ['HS256'],
            secret: 'TEST_SERVER_SECRET',
        },
        attach: {
            path: '../attach/',
        },
    }
})();
