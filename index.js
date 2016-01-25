const Hapi = require('hapi');
const handler = require('./handler.js');
const Cfg = require('./config.json');
var db = require('./database.js');
const server = new Hapi.Server();

server.connection({
    host: Cfg.server.host,
    port: Cfg.server.port
});

server.route({
    method: 'GET',
    path:'/track/{deviceID}/{lat}/{lon}/{alt}/{time}',
    handler: handler.saveLocation
});
server.route({
    method: 'GET',
    path:'/track/{deviceID}/{user}/{secret}/{returnWhat}',
    handler: handler.getLocation
});
server.start((err) => {

    if (err) {
        throw err;
    }
    console.log('Server running at:', server.info.uri);
});


function exitHandler(options, err) {
    db.cleanup();
    if (options.cleanup)
        console.log('clean');
    if (err)
        console.log(err.stack);
    if (options.exit)
        process.exit();
}

//do something when app is closing
process.on('exit', exitHandler.bind(null, {cleanup: true}));

//catches ctrl+c event
process.on('SIGINT', exitHandler.bind(null, {exit:true}));

//catches uncaught exceptions
process.on('uncaughtException', exitHandler.bind(null, {exit:true}));
