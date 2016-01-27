const Hapi = require('hapi');
const handler = require('./handler.js');
const Cfg = require('./config.json');
var db = require('./database.js');

const http = require('http');
const sockjs = require('sockjs');
const server = new Hapi.Server();
var connections = [];

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

global.sendObject = {};

// 1. Echo sockjs server
var sockjs_opts = {};

var sockjs_echo = sockjs.createServer(sockjs_opts);
sockjs_echo.on('connection', function(conn) {
  connections.push(conn);

  conn.on('close', function() {

    // connections.forEach()
    console.log('close ' + conn);
  });
  conn.on('data', function(message) {
    try{
      var mFC = JSON.parse(message);
      if(mFC.what &&
        mFC.user &&
        typeof Cfg.user[mFC.user] === 'object' &&
        mFC.pass &&
        Cfg.user[mFC.user].pw === mFC.pass){
        if(mFC.what === 'getList'){
          conn.write(JSON.stringify({what: 'list', list: Cfg.user[mFC.user].allowedDevices}))
        }
        else if(mFC.what === 'subscribeTo' && Cfg.user[mFC.user].allowedDevices.indexOf(mFC.device)>-1){
          sendObject[mFC.device] = sendObject[mFC.device] || [];
          sendObject[mFC.device].push(conn);
          db.getLastRecording(mFC.device, function(err,result){
            conn.write(JSON.stringify({what: 'locationUpdate', data: result}))
          })

        }
      }else{
        conn.write(JSON.stringify({error: 'not allowed'}))
      }
    }catch(e){}
    // console.log(JSON.stringify(message))
    // conn.write(message);
  });
});



sockjs_echo.installHandlers(server.listener, {prefix:'/track/echo'});

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
