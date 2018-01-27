var mysql_pool = require('../db/mysql_con');

var teachers = {
   list: function (req, res, next) {

      getTeachers().then(function (rows) {
         if (rows === -1) {
            res.status(401);
            res.json({ 'success': false, 'status': 401, 'message': 'An error occurred while processing request.' });
            return;
         }
         res.status(200);
         res.json({ 'success': true, 'teachers': rows });
      })
   },
   create: function (req, res, next) {
      // var values = {
      //    guid: createGuid('TH'),
      //    fullname: req.body.fullname || '',
      //    address: req.body.address || '',
      //    contact: req.body.contact || '',
      //    email: req.body.email || '',
      //    user_id: req.body.user_id || '' ,
      //    majoring_id: req.body.majoring_id || ''
      // };

      // createTeacher(values).then(function (results) {
      //    if (results === -1) {
      //       res.status(401);
      //       res.json({ 'success': false, 'status': 401, 'message': 'An error occurred while processing request.' });
      //       return;
      //    }

      //    getTeachers('order by id DESC').then(function (rows) {
      //       if (rows === -1) {
      //          res.status(401);
      //          res.json({ 'success': false, 'status': 401, 'message': 'An error occurred while processing request.' });
      //          return;
      //       }
      //       res.status(200);
      //       res.json({ 'success': true, 'teachers': rows });
      //    })

      //    return;
      // })
   },
   update: function (req, res, next) {
      var values = {
         guid: req.body.guid,
         fullname: req.body.fullname || '',
         address: req.body.address || '',
         contact: req.body.contact || '',
         email: req.body.email || '',
         user_id: req.body.user_id || '' ,
         majoring_id: req.body.majoring_id || ''
      };

      updateTeacher(values).then(function (rows) {
         if (rows === -1) {
            res.status(401);
            res.json({ 'success': false, 'status': 401, 'message': 'An error occurred while processing request.' });
            return;
         }

         getTeachers().then(function (rows) {
            if (rows === -1) {
               res.status(401);
               res.json({ 'success': false, 'status': 401, 'message': 'An error occurred while processing request.' });
               return;
            }
            res.status(200);
            res.json({ 'success': true, 'teachers': rows });
         })
      })
      return;

   },
   delete: function (req, res, next) {
      var guid = req.params.guid;

      deleteTeacher(guid).then(function (rows) {
         if (rows === -1) {
            res.status(401);
            res.json({ 'success': false, 'status': 401, 'message': 'An error occurred while processing request.' });
            return;
         }

         getTeachers().then(function (rows) {
            if (rows === -1) {
               res.status(401);
               res.json({ 'success': false, 'status': 401, 'message': 'An error occurred while processing request.' });
               return;
            }
            res.status(200);
            res.json({ 'success': true, 'teachers': rows });
         })

      })
      return;
   }
}

function deleteTeacher(guid) {
   return new Promise(function (resolve, reject) {
      mysql_pool.getConnection(function (err, connection) {
         if (err) throw err;

         connection.query('DELETE FROM teachers WHERE guid = ?', [guid],
            function (err, results) {

               if (err) {
                  return reject(err);
               }

               resolve(results);
            })
         connection.release();
      })
   }).catch(function () {
      return -1;
   })
}

function updateTeacher(values) {
   return new Promise(function (resolve, reject) {
      mysql_pool.getConnection(function (err, connection) {
         if (err) throw err;

         connection.query(`UPDATE teachers SET guid = ?, fullname = ?, address = ?, contact = ?, email = ?, majoring_id = ?
                           WHERE guid = ?`,
            [values.guid, values.fullname, values.address, values.contact, values.email, values.majoring_id, values.guid],
            function (err, results) {

               if (err) {
                  return reject(err);
               }

               resolve(results);
            })
         connection.release();
      })
   }).catch(function () {
      return -1;
   })
}

function createGuid(prefix) {
   var maximum = 10000;
   var minimum = 1000;
   var num = Math.floor(Math.random() * (maximum - minimum + 1)) + minimum;

   return prefix + '-' + num;
}

function createTeacher(values) {
   return new Promise(function (resolve, reject) {
      mysql_pool.getConnection(function (err, connection) {
         if (err) throw err;
        
         connection.query('INSERT INTO teachers (guid, fullname, email, address, contact, user_id, majoring_id) VALUES (?, ?, ?, ?, ?, ?)',
            [values.guid, values.fullname, values.address, values.contact, values.email, values.status], function (err, results) {

               if (err) {
                  return reject(err);
               } else {
                  if (results == null || Object.keys(results).length === 0) {
                     return reject('Problem when fetching records..');
                  }
                  resolve(results);
               }
            })
         connection.release();
      })
   }).catch(function () {
      return -1;
   })
}

function getTeachers() {
   return new Promise(function (resolve, reject) {
      mysql_pool.getConnection(function (err, connection) {
         if (err) throw err;

         connection.query(`SELECT teachers.guid, teachers.fullname, teachers.email, teachers.address, teachers.contact, 
                           teachers.user_id, teachers.majoring_id, majorings.name AS majoringname
                           FROM teachers 
                           INNER JOIN majorings ON majorings.id = teachers.majoring_id
                           ORDER BY teachers.id DESC`, function (err, rows) {
            if (err) {
               return reject(err);
            } else {
               if (rows == null || Object.keys(rows).length === 0) {
                  return reject('Problem when fetching records..');
               }
               resolve(rows);
            }
         })
         connection.release();
      })
   }).catch(function () {
      return -1;
   })
}

module.exports = teachers;