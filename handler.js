const Mysql = require('mysql');
const Moment = require('moment');
const Pkg = require('./package.json');
var connection = Mysql.createConnection({
  host     : Pkg.mysql.host,
  user     : Pkg.mysql.user,
  password : Pkg.mysql.password,
  database : Pkg.mysql.database
});

var allowedDevices = Pkg.allowedDevices;

module.exports = function (request, reply) {
  var deviceID = encodeURIComponent(request.params.deviceID)
  if(allowedDevices.indexOf(deviceID)>-1){


    var lat = encodeURIComponent(request.params.lat)
    var lon = encodeURIComponent(request.params.lon)
    var alt = encodeURIComponent(request.params.alt)
    var time = encodeURIComponent(request.params.time)

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
