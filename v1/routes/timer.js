var mysql_pool = require('../db/mysql_con');
var config = require('../config/config');

var timer = {
   get: function (req, res, next) {
      getTimer().then(function (result) {
         if (result === -1) {
            res.status(401);
            res.json({ 'success': false, 'status': 401, 'message': 'An error occurred while processing request.' });
            return;
         }

         res.status(200);
         res.json({ 'success': true, 'timer': result });
      })
      return;
   },
   set: function (req, res, next) {
      var values = {
         time_limit: req.body.time_limit || '',
      };

      updateTimer(values).then(function (result) {
         if (result === -1) {
            res.status(401);
            res.json({ 'success': false, 'status': 401, 'message': 'An error occurred while processing request.' });
            return;
         }

         res.status(200);
         res.json({ 'success': true, 'message': 'Successfully update timer limit' });
      })
      return;
   }
}

function getTimer() {
   return new Promise(function (resolve, reject) {
      mysql_pool.getConnection(function (err, connection) {
         if (err) throw err;

         connection.query('SELECT time_limit AS time FROM timer WHERE 1', function (err, result) {
            if (err) {
               return reject(err);
            }

            resolve(result[0]);
         })
         connection.release();
      })
   }).catch(function () {
      return -1;
   })
}

function updateTimer(values) {
   return new Promise(function (resolve, reject) {
      mysql_pool.getConnection(function (err, connection) {
         if (err) throw err;

         connection.query('UPDATE timer SET time_limit = ? WHERE 1', [values.time_limit], function (err, result) {
            if (err) {
               return reject(err);
            }

            resolve(result);
         })
         connection.release();
      })
   }).catch(function () {
      return -1;
   })
}


module.exports = timer;