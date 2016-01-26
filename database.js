const Mysql = require('mysql');
const Cfg = require('./config.json');

var pool = Mysql.createPool({
  host: Cfg.mysql.host,
  user: Cfg.mysql.user,
  password: Cfg.mysql.password,
  database: Cfg.mysql.database,
  connectionLimit: 10,
  supportBigNumbers: true
});

exports.insertRecord = function( trackingObject, callback){
  pool.getConnection(function(err, connection) {
    if(err) { console.log(err); callback(true); return; }
    var query = connection.query('INSERT INTO tracking SET ?', trackingObject, function(err, result) {
      connection.release();
      if(err) { console.log(err); callback(true); return; }
      callback(false, result);
    })
  });
}

exports.getLastRecording = function( deviceID, callback){
  pool.getConnection(function(err, connection) {
    if(err) { console.log(err); callback(true); return; }
    var query = connection.query('SELECT * FROM tracking WHERE deviceid = \''+deviceID + '\' ORDER BY idtracking DESC LIMIT 1', function(err, result) {
      connection.release();
      if(err) { console.log(err); callback(true); return; }
      callback(false, result[0]);
    })
  });
}

exports.cleanup = function(){
  pool.end();
}
