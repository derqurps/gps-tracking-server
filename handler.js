const Moment = require('moment');
const Cfg = require('./config.json');
var db = require('./database.js');

var allowedDevices = Cfg.allowedDevices.map(function(item){
  return item.name;
});

module.exports = {}
module.exports.saveLocation = function (request, reply) {
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
        return reply('0 '+ err);;
      }else{
        reply('1');
        sendLocationUpdate(tracking);
        return
      }
    });

  }else{
    return reply('not allowed');
  }
}


module.exports.getLocation = function (request, reply) {
  var deviceID = encodeURIComponent(request.params.deviceID)
  var user = encodeURIComponent(request.params.user)
  var secret = encodeURIComponent(request.params.secret)
  if(allowedDevices.indexOf(deviceID)>-1 && typeof Cfg.user[user] != 'undefined' && Cfg.user[user].pw == secret){
    if(Cfg.user[user].allowedDevices.indexOf(deviceID)>-1){
      var returnWhat = encodeURIComponent(request.params.returnWhat)
      if(returnWhat === 'last'){
        db.getLastRecording(deviceID, function(err, result) {
          if(err){
            return reply({success:false, error:err});
          }else{
            return reply({success:true, result:result});
          }
        });
      }
      else if(returnWhat == 'lastOSMLink'){
        db.getLastRecording(deviceID, function(err, result) {
          return reply('<a target="_blank" href="https://www.openstreetmap.org/?mlat='+result.lat+'&mlon='+result.lon+'&zoom=1#map=12/'+result.lat+'/'+result.lon+'">letzter Standort</a>');
        });
      }else{

      }
    }
    else{
      return reply({success:false, error:'not allowed to view that track'});
    }
  }else{
    return reply({success:false, error:'not allowed'});
  }
}


var sendLocationUpdate = function(trackObj){
  try{
    global.sendObject[trackObj.deviceid].forEach(function(conn){
      conn.write(JSON.stringify({what:"locationUpdate",data:trackObj}))
    });
  }catch(e){}
}
