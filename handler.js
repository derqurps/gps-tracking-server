const Mysql = require('mysql');
const Moment = require('moment');
const Cfg = require('./config.json');
var connection = Mysql.createConnection({
  host     : Cfg.mysql.host,
  user     : Cfg.mysql.user,
  password : Cfg.mysql.password,
  database : Cfg.mysql.database
});

var allowedDevices = Cfg.allowedDevices;

module.exports = function (request, reply) {
  var deviceID = encodeURIComponent(request.params.deviceID)
  if(allowedDevices.indexOf(deviceID)>-1){


    var lat = encodeURIComponent(request.params.lat)
    var lon = encodeURIComponent(request.params.lon)
    var alt = encodeURIComponent(request.params.alt)
    var time = Moment(encodeURIComponent(request.params.time)).format('YYYY-MM-DD HH:mm:ss')

    var tracking = {
      deviceid:deviceID,
      lat:lat,
      lon:lon,
      alt:alt,
      time:time
    };
    console.log(tracking)
    connection.connect();
    var query = connection.query('INSERT INTO tracking SET ?', tracking, function(err, result) {
      // Neat!
      connection.end();
      if(err){
        return reply('0');
      }else{
        return reply('1');
      }
    });

  }else{
    return reply('not allowed');
  }
}
