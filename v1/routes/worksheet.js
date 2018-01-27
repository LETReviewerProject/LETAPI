var mysql_pool = require('../db/mysql_con');

var worksheets = {
   list: function (req, res, next) {

      getWorksheets('order by id DESC').then(function (rows) {
         if (rows === -1) {
            res.status(401);
            res.json({ 'success': false, 'status': 401, 'message': 'An error occurred while processing request.' });
            return;
         }
         res.status(200);
         res.json({ 'success': true, 'worksheets': rows });
      })
   },
   create: function (req, res, next) {
      var values = {
         guid: createGuid('WS'),
         name: req.body.name || '',
         num_questions: req.body.num_questions || '',
         description: req.body.description || ''
      };

      createWorksheet(values).then(function (results) {
         if (results === -1) {
            res.status(401);
            res.json({ 'success': false, 'status': 401, 'message': 'An error occurred while processing request.' });
            return;
         }

         getWorksheets('order by id DESC').then(function (rows) {
            if (rows === -1) {
               res.status(401);
               res.json({ 'success': false, 'status': 401, 'message': 'An error occurred while processing request.' });
               return;
            }
            res.status(200);
            res.json({ 'success': true, 'worksheets': rows });
         })

         return;
      })
   },
   update: function (req, res, next) {
      var values = {
         guid: req.body.guid,
         name: req.body.name || '',
         num_questions: req.body.num_questions || '',
         description: req.body.description || ''
      };

      updateWorksheet(values).then(function (rows) {
         if (rows === -1) {
            res.status(401);
            res.json({ 'success': false, 'status': 401, 'message': 'An error occurred while processing request.' });
            return;
         }
         
         getWorksheets('order by id DESC').then(function (rows) {
            if (rows === -1) {
               res.status(401);
               res.json({ 'success': false, 'status': 401, 'message': 'An error occurred while processing request.' });
               return;
            }
            res.status(200);
            res.json({ 'success': true, 'worksheets': rows });
         })
      })
      return;

   },
   delete: function (req, res, next) {
      var guid = req.params.guid;

      deleteWorksheet(guid).then(function (rows) {
         if (rows === -1) {
            res.status(401);
            res.json({ 'success': false, 'status': 401, 'message': 'An error occurred while processing request.' });
            return;
         }

         getWorksheets('order by id DESC').then(function (rows) {
            if (rows === -1) {
               res.status(401);
               res.json({ 'success': false, 'status': 401, 'message': 'An error occurred while processing request.' });
               return;
            }
            res.status(200);
            res.json({ 'success': true, 'worksheets': rows });
         })

      })
      return;
   }
}

function deleteWorksheet(guid) {
   return new Promise(function (resolve, reject) {
      mysql_pool.getConnection(function (err, connection) {
         if (err) throw err;
  
         connection.query('DELETE FROM worksheets WHERE guid = ?', [guid],
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

/**
 * update category
 * @param {*} values 
 */
function updateWorksheet(values) {
   return new Promise(function (resolve, reject) {
      mysql_pool.getConnection(function (err, connection) {
         if (err) throw err;

         connection.query('UPDATE worksheets SET guid = ?, name = ?, num_questions = ?, description = ? WHERE guid = ?',
            [values.guid, values.name, values.num_questions, values.description, values.guid],
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

   return prefix  + '-' + num;
}

/**
 * create new category 
 */
function createWorksheet(values) {
   return new Promise(function (resolve, reject) {
      mysql_pool.getConnection(function (err, connection) {
         if (err) throw err;
         console.log(values);
         connection.query('INSERT INTO worksheets (guid, name, num_questions, description) VALUES (?, ?, ?, ?)',
            [values.guid, values.name, values.num_questions, values.description], function (err, results) {

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

/**
 * get list of thumbnails
 */
function getWorksheets(orderBy) {
   return new Promise(function (resolve, reject) {
      mysql_pool.getConnection(function (err, connection) {
         if (err) throw err;
         console.log(orderBy);
         connection.query('SELECT guid, name, num_questions, description FROM worksheets ' + orderBy, function (err, rows) {
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

module.exports = worksheets;