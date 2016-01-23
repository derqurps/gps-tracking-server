const Hapi = require('hapi');
const handler = require('./handler.js');
const Cfg = require('./config.json');
const server = new Hapi.Server();

server.connection({
    host: Cfg.server.host,
    port: Cfg.server.port
});

server.route({
    method: 'GET',
    path:'/track/{deviceID}/{lat}/{lon}/{alt}/{time}',
    handler: handler
});
server.start((err) => {

    if (err) {
        throw err;
    }
    console.log('Server running at:', server.info.uri);
});
