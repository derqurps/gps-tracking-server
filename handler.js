const Moment = require('moment');
const Cfg = require('./config.json');
var db = require('./database.js');

var allowedDevices = Cfg.allowedDevices;

module.exports = function (request, reply) {
  var deviceID = encodeURIComponent(request.params.deviceID)
  if(allowedDevices.indexOf(deviceID)>-1){

    var lat = encodeURIComponent(request.params.lat)
    var lon = encodeURIComponent(request.params.lon)
    var alt = encodeURIComponent(request.params.alt)
    var time = Moment(parseInt(encodeURIComponent(request.params.time),10)).format('YYYY-MM-DD HH:mm:ss')

    var tracking = {
      deviceid:deviceID,
      lat:lat,
      lon:lon,
      alt:alt,
      time:time
    };
    
    db.insertRecord(tracking, function(err, result) {
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
