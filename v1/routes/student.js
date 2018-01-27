var mysql_pool = require('../db/mysql_con');

var students = {
   isMajoring: function(req, res, next) {
      values = {
         isMajoring: req.body.isMajoring
      }

      isMajoring().then(function (result) {
         if (result === -1) {
            res.status(401);
            res.json({ 'success': false, 'status': 401, 'message': 'An error occurred while processing request.' });
            return;
         }

         res.status(200);
         res.json({ 'success': true, 'ismajoring': result });
      })
   },
   list: function (req, res, next) {
      getStudents().then(function (rows) {
         if (rows === -1) {
            res.status(401);
            res.json({ 'success': false, 'status': 401, 'message': 'An error occurred while processing request.' });
            return;
         }
         res.status(200);
         res.json({ 'success': true, 'students': rows });
      })
   },
   create: function (req, res, next) {
      var values = {
         guid: createGuid('ST'),
         fullname: req.body.fullname || '',
         email: req.body.email || '',
         school: req.body.school || '',
         address: req.body.address || '',
         contact: req.body.contact || '',
         status: 0
      };

      createStudent(values).then(function (results) {
         if (results === -1) {
            res.status(401);
            res.json({ 'success': false, 'status': 401, 'message': 'An error occurred while processing request.' });
            return;
         }

         getStudents('order by id DESC').then(function (rows) {
            if (rows === -1) {
               res.status(401);
               res.json({ 'success': false, 'status': 401, 'message': 'An error occurred while processing request.' });
               return;
            }
            res.status(200);
            res.json({ 'success': true, 'students': rows });
         })

         return;
      })
   },
   update: function (req, res, next) {
      var values = {
         guid: req.body.guid,
         fullname: req.body.fullname || '',
         email: req.body.email || '',
         school: req.body.school || '',
         address: req.body.address || '',
         contact: req.body.contact || ''
      };

      updateStudent(values).then(function (rows) {
         if (rows === -1) {
            res.status(401);
            res.json({ 'success': false, 'status': 401, 'message': 'An error occurred while processing request.' });
            return;
         }

         getStudents('order by id DESC').then(function (rows) {
            if (rows === -1) {
               res.status(401);
               res.json({ 'success': false, 'status': 401, 'message': 'An error occurred while processing request.' });
               return;
            }
            res.status(200);
            res.json({ 'success': true, 'students': rows });
         })
      })
      return;

   },
   delete: function (req, res, next) {
      var guid = req.params.guid;

      deleteStudent(guid).then(function (rows) {
         if (rows === -1) {
            res.status(401);
            res.json({ 'success': false, 'status': 401, 'message': 'An error occurred while processing request.' });
            return;
         }

         getStudents('order by id DESC').then(function (rows) {
            if (rows === -1) {
               res.status(401);
               res.json({ 'success': false, 'status': 401, 'message': 'An error occurred while processing request.' });
               return;
            }
            res.status(200);
            res.json({ 'success': true, 'students': rows });
         })

      })
      return;
   }
}

function isMajoring(values) {
   return new Promise(function (resolve, reject) {
      mysql_pool.getConnection(function (err, connection) {
         if (err) throw err;

         connection.query('SELECT majoring, fullname, email, school, address, contact FROM students ', function (err, rows) {
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

function deleteStudent(guid) {
   return new Promise(function (resolve, reject) {
      mysql_pool.getConnection(function (err, connection) {
         if (err) throw err;

         connection.query('DELETE FROM students WHERE guid = ?', [guid],
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

function updateStudent(values) {
   return new Promise(function (resolve, reject) {
      mysql_pool.getConnection(function (err, connection) {
         if (err) throw err;

         connection.query('UPDATE students SET guid = ?, fullname = ?, address = ?, email = ?, contact = ?, school =? WHERE guid = ?',
                           [values.guid, values.fullname, values.address, values.email, values.contact, values.school, values.guid],
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

function createStudent(values) {
   return new Promise(function (resolve, reject) {
      mysql_pool.getConnection(function (err, connection) {
         if (err) throw err;
        
         connection.query('INSERT INTO students (guid, fullname, email, school, address, contact) VALUES (?, ?, ?, ?, ?, ?)',
            [values.guid, values.fullname, values.email, values.school, values.address, values.contact], function (err, results) {

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

function getStudents() {
   return new Promise(function (resolve, reject) {
      mysql_pool.getConnection(function (err, connection) {
         if (err) throw err;

         connection.query(`SELECT students.guid, students.fullname, students.email, students.school, students.address, students.contact 
                            FROM students
                            INNER JOIN users ON users.id = students.user_id
                            WHERE users.is_admin = 0
                            ORDER BY students.id DESC`, function (err, rows) {
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

module.exports = students;