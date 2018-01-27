var mysql_pool = require('../db/mysql_con');
var config = require('../config/config');

var profile = {
   students: function (req, res, next) {
      var values = {
         guid: req.body.guid || ''
      }
      getStudentListSummary(values).then(function (rows) {
         if (rows === -1) {
            res.status(401);
            res.json({ 'success': false, 'status': 401, 'message': 'An error occurred while processing request.' });
            return;
         }

         res.status(200);
         res.json({ 'success': true, 'rows': rows });
      })
   },
   update: function (req, res, next) {
      var values = {
         guid: req.body.guid || '',
         address: req.body.address || '',
         contact: req.body.contact || '',
         fullname: req.body.fullname || '',
         school: req.body.school || '',
         username: req.body.username || '',
         email: req.body.email || '',
         isteacher: req.body.isteacher || ''
      }

      updateProfile(values).then(function (row) {
         if (row === -1) {
            res.status(401);
            res.json({ 'success': false, 'status': 401, 'message': 'An error occurred while processing request.' });
            return;
         }

         res.status(200);
         res.json({ 'success': true, 'message': 'Successfully Updated!' });
      })
      return;
   },
   detail: function (req, res, next) {
      var guid = req.body.guid || '';

      getProfileDetail(guid).then(function (row) {
         if (row === -1) {
            res.status(401);
            res.json({ 'success': false, 'status': 401, 'message': 'An error occurred while processing request.' });
            return;
         }

         res.status(200);
         res.json({ 'success': true, 'detail': row });
      })
   }
}

function updateProfile(values) {
   return new Promise(function (resolve, reject) {

      mysql_pool.getConnection(function (err, connection) {
         if (err) throw err;

         var table, sql, arrParams = '';
         var arrValues = [];
    
         if (values.isteacher == 0) {
            table = 'students';
            arrValues = [values.address, values.contact, values.school, values.username, values.fullname, values.email, values.email, values.guid];
            arrParams = ' address = ?, contact = ?, school = ?, users.username = ?, fullname = ?, users.email = ?, students.email = ? WHERE users.guid = ? ';
         } else if (values.isteacher == 1) {
            table = 'teachers';
            arrValues = [values.address, values.contact, values.email, values.fullname, values.username, values.guid]
            arrParams = ' address = ?, contact = ?,  users.email = ?, fullname = ?, username = ? WHERE users.guid = ? ';
         }

         connection.query(`UPDATE users 
                           JOIN ${table} ON ${table}.user_id = users.id
                           SET ${arrParams}`,
            arrValues, function (err, result) {
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

function getStudentListSummary(values) {
   return new Promise(function (resolve, reject) {
      mysql_pool.getConnection(function (err, connection) {
         if (err) throw err;

         connection.query(`SELECT students.guid, students.fullname AS studentname, 
                           CONCAT('dashboard/results/detail/', 
                           (
                              SELECT users.guid FROM users 
                              INNER JOIN students s ON s.user_id = users.id
                              WHERE s.guid = students.guid
                           )) AS url
                           FROM teachers 
                           INNER JOIN users ON users.id = teachers.user_id
                           INNER JOIN students ON students.majoring_id = teachers.majoring_id
                           WHERE users.guid = ?`, [values.guid], function (err, result) {
               if (err) {
                  return reject(err);
               } else {
                  if (result == null || Object.keys(result).length === 0) {
                     return resolve([]);
                  }
                  resolve(result);
               }
            })
         connection.release();
      })
   }).catch(function () {
      return -1;
   })
}

function getProfileDetail(guid) {
   return new Promise(function (resolve, reject) {
      mysql_pool.getConnection(function (err, connection) {
         if (err) throw err;

         connection.query(`SELECT users.guid, COALESCE(students.fullname, teachers.fullname) AS fullname, 
                                 users.username, COALESCE(students.email, teachers.email) AS email, school,
                                 COALESCE(students.address, teachers.address) AS address,
                                 COALESCE(students.contact, teachers.contact) AS contact, 
                                 COALESCE(students.user_id, teachers.user_id) AS user_id, 
                                 users.image,
                                 (
                                    SELECT name FROM majorings WHERE id = COALESCE(students.majoring_id, teachers.majoring_id)
                                 ) AS majoring
                              FROM users
                              LEFT JOIN students ON students.user_id = users.id 
                              LEFT JOIN teachers ON teachers.user_id = users.id 
                           WHERE users.guid = ?`, [guid], function (err, result) {
               if (err) {
                  return reject(err);
               } else {
                  if (result == null || Object.keys(result).length === 0) {
                     return resolve([]);
                  }
                  resolve(result[0]);
               }
            })
         connection.release();
      })
   }).catch(function () {
      return -1;
   })
}

module.exports = profile;