var mysql_pool = require('../db/mysql_con');
var orderIdDesc = 'order by majorings.id DESC';

var majorings = {
   majoringByTeacher: function (req, res, next) {
      var values = {
         teacher_guid: req.body.teacher_guid || ''
      };

      getMajoringByTeacher(values).then(function (rows) {
         if (rows === -1) {
            res.status(401);
            res.json({ 'success': false, 'status': 401, 'message': 'An error occurred while processing request.' });
            return;
         }
         res.status(200);
         res.json({ 'success': true, 'majorings': rows });
      })
   },
   majoringWithCategory: function(req, res, next) {
    getMajoringWithCategory().then(function(rows) {
      if (rows === -1) {
        res.status(401);
        res.json({ 'success': false, 'status': 401, 'message': 'An error occurred while processing request.' });
        return;
      }
      res.status(200);
      res.json({ 'success': true, 'majorings': rows });
    })
  },
   create: function (req, res, next) {
      var values = {
         guid: createGuid('MJ'),
         name: req.body.name || '',
         category_id: req.body.category_id || '',
         description: req.body.description || '',
         teacher_guid: req.body.teacher_guid || ''
      };

      createMajoring(values).then(function (results) {
         if (results === -1) {
            res.status(401);
            res.json({ 'success': false, 'status': 401, 'message': 'An error occurred while processing request.' });
            return;
         }

          res.status(200);
          res.json({ 'success': true, 'message': 'Successfully created majoring.' });
      })
   },
   update: function (req, res, next) {
      var values = {
         guid: req.body.guid,
         name: req.body.name || '',
         category_id: req.body.category_id || '',
         description: req.body.description || '',
         teacher_guid: req.body.teacher_guid || ''
      };

      updateMajoring(values).then(function (rows) {
         if (rows === -1) {
            res.status(401);
            res.json({ 'success': false, 'status': 401, 'message': 'An error occurred while processing request.' });
            return;
         }

          getMajorings(orderIdDesc).then(function (rows) {
             if (rows === -1) {
                res.status(401);
                res.json({ 'success': false, 'status': 401, 'message': 'An error occurred while processing request.' });
                return;
             }
             res.status(200);
             res.json({ 'success': true, 'majorings': rows });
          })
      })
      return;

   },
   delete: function (req, res, next) {
      var guid = req.params.guid;

      deleteMajoring(guid).then(function (rows) {
         if (rows === -1) {
            res.status(401);
            res.json({ 'success': false, 'status': 401, 'message': 'An error occurred while processing request.' });
            return;
         }
	res.status(200);
     	res.json({ 'success': true, 'message': 'Successfully Deleted!' });
      })
      return;
   }
}

function deleteMajoring(guid) {
   return new Promise(function (resolve, reject) {
      mysql_pool.getConnection(function (err, connection) {
         if (err) throw err;
	console.log(guid);
         connection.query('DELETE FROM majorings WHERE guid = ?', [guid],
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

function updateMajoring(values) {
   return new Promise(function (resolve, reject) {
      mysql_pool.getConnection(function (err, connection) {
         if (err) throw err;

         connection.query('UPDATE majorings SET guid = ?, name = ?, description = ?, category_id = ?, teacher_guid = ? WHERE guid = ?',
            [values.guid, values.name, values.description, values.category_id, values.teacher_guid, values.guid],
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

function createMajoring(values) {
   return new Promise(function (resolve, reject) {
      mysql_pool.getConnection(function (err, connection) {
         if (err) throw err;

         connection.query('INSERT INTO majorings (guid, name, description, category_id, teacher_guid) VALUES (?, ?, ?, ?, ?)',
            [values.guid, values.name, values.description, values.category_id, values.teacher_guid], function (err, results) {

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

function getMajoringByTeacher(values) {
   return new Promise(function (resolve, reject) {
      mysql_pool.getConnection(function (err, connection) {
         if (err) throw err;

         connection.query(`SELECT majorings.id, majorings.guid, majorings.name, majorings.description, categories.name AS category 
                           FROM majorings 
                           INNER JOIN categories ON categories.id = majorings.category_id 
                           WHERE majorings.teacher_guid = ?
                           ORDER BY majorings.id DESC`, [values.teacher_guid], function (err, rows) {
               if (err) {
                  return reject(err);
               } else {
                  if (rows == null || Object.keys(rows).length === 0) {
                     return resolve([]);
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

//SELECT id, guid, name, description FROM (
//SELECT t1.id, t1.guid, t1.name, t1.description FROM majorings t1 
//UNION ALL 
//SELECT t2.id, t2.guid, t2.name, t2.description FROM categories t2 ) t3 
//ORDER BY id DESC
function getMajoringWithCategory() {
  return new Promise(function(resolve, reject) {
    mysql_pool.getConnection(function(err, connection) {
      if (err) throw err;

      connection.query(`SELECT majorings.id, majorings.guid, majorings.name, majorings.description, categories.name AS category 
			FROM majorings 
			LEFT JOIN categories ON categories.id = majorings.category_id 
			ORDER BY majorings.id DESC`, function(err, rows) {
        if (err) {
          return reject(err);
        }

        if (rows == null || Object.keys(rows).length === 0) {
          return resolve([]);
        }
        resolve(rows);

      })
      connection.release();
    })
  }).catch(function() {
    return -1;
  })
}

module.exports = majorings;