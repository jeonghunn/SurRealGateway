module.exports = (() => {
    return {
        serverDomain: 'itboard.com',
        jwt: {
            algorithms: ['HS256'],
            secret: 'TEST_SERVER_SECRET',
        },
    }
})();
