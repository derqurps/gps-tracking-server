const Hapi = require('hapi');
const handler = require('./handler.js');
const Pkg = require('./package.json');
const server = new Hapi.Server();

server.connection({
    host: Pkg.server.host,
    port: Pkg.server.port
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
