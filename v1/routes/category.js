var mysql_pool = require('../db/mysql_con');

var categories = {
  categoryOnly: function(req, res, next) {
    getCategoryOnly().then(function(rows) {
      if (rows === -1) {
        res.status(401);
        res.json({ 'success': false, 'status': 401, 'message': 'An error occurred while processing request.' });
        return;
      }
      res.status(200);
      res.json({ 'success': true, 'categories': rows });
    })
  },
  categoryMajoring: function(req, res, next) {
    getMajorCategory().then(function(rows) {
      if (rows === -1) {
        res.status(401);
        res.json({ 'success': false, 'status': 401, 'message': 'An error occurred while processing request.' });
        return;
      }
      res.status(200);
      res.json({ 'success': true, 'categories': rows });
    })
  },
  list: function(req, res, next) {
    getCategories().then(function(rows) {
      if (rows === -1) {
        res.status(401);
        res.json({ 'success': false, 'status': 401, 'message': 'An error occurred while processing request.' });
        return;
      }
      res.status(200);
      res.json({ 'success': true, 'categories': rows });
    })
  },
  create: function(req, res, next) {
    var values = {
      guid: createGuid(),
      name: req.body.name || '',
      description: req.body.description || '',
      ismajoring: ((req.body.ismajoring === true) ? 1 : 0) || 0,
      timer: req.body.timer || 0
    };

    createCategory(values).then(function(results) {
      if (results === -1) {
        res.status(401);
        res.json({ 'success': false, 'status': 401, 'message': 'An error occurred while processing request.' });
        return;
      }

      getCategories().then(function(rows) {
        if (rows === -1) {
          res.status(401);
          res.json({ 'success': false, 'status': 401, 'message': 'An error occurred while processing request.' });
          return;
        }
        res.status(200);
        res.json({ 'success': true, 'categories': rows });
      })

      return;
    })
  },
  update: function(req, res, next) {
    var values = {
      guid: req.body.guid,
      name: req.body.name || '',
      description: req.body.description || '',
      ismajoring: ((req.body.ismajoring === true) ? 1 : 0) || 0,
      timer: req.body.timer || 0
    };

    updateCategory(values).then(function(rows) {
      if (rows === -1) {
        res.status(401);
        res.json({ 'success': false, 'status': 401, 'message': 'An error occurred while processing request.' });
        return;
      }

      getCategories().then(function(rows) {
        if (rows === -1) {
          res.status(401);
          res.json({ 'success': false, 'status': 401, 'message': 'An error occurred while processing request.' });
          return;
        }
        res.status(200);
        res.json({ 'success': true, 'categories': rows });
      })
    })
    return;

  },
  delete: function(req, res, next) {
    var guid = req.params.guid;

    deleteCategory(guid).then(function(rows) {
      if (rows === -1) {
        res.status(401);
        res.json({ 'success': false, 'status': 401, 'message': 'An error occurred while processing request.' });
        return;
      }

      getCategories().then(function(rows) {
        if (rows === -1) {
          res.status(401);
          res.json({ 'success': false, 'status': 401, 'message': 'An error occurred while processing request.' });
          return;
        }
        res.status(200);
        res.json({ 'success': true, 'categories': rows });
      })

    })
    return;
  }
}

function deleteCategory(guid) {
  return new Promise(function(resolve, reject) {
    mysql_pool.getConnection(function(err, connection) {
      if (err) throw err;

      connection.query('DELETE FROM categories WHERE guid = ?', [guid],
        function(err, results) {

          if (err) {
            return reject(err);
          }

          resolve(results);
        })
      connection.release();
    })
  }).catch(function() {
    return -1;
  })
}

function updateCategory(values) {
  return new Promise(function(resolve, reject) {
    mysql_pool.getConnection(function(err, connection) {
      if (err) throw err;

      connection.query(`UPDATE categories SET guid = ?, name = ?, description = ?, ismajoring = ?, timer = ? WHERE guid = ?`, 
      [values.guid, values.name, values.description, values.ismajoring, values.timer, values.guid],
        function(err, results) {

          if (err) {
            return reject(err);
          }

          resolve(results);
        })
      connection.release();
    })
  }).catch(function() {
    return -1;
  })
}

function createGuid() {
  var maximum = 100000;
  var minimum = 10000;
  var prefix = 'CT';
  var num = Math.floor(Math.random() * (maximum - minimum + 1)) + minimum;

  return prefix + '-' + num;
}

function createCategory(values) {
  return new Promise(function(resolve, reject) {
    mysql_pool.getConnection(function(err, connection) {
      if (err) throw err;

      connection.query(`INSERT INTO categories (guid, name, description, ismajoring, timer) VALUES (?, ?, ?, ?, ?)`, [values.guid, values.name, values.description, values.ismajoring, values.timer],
        function(err, results) {
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
  }).catch(function() {
    return -1;
  })
}

function getCategoryOnly() {
  return new Promise(function(resolve, reject) {
    mysql_pool.getConnection(function(err, connection) {
      if (err) throw err;

      connection.query(`SELECT id, guid, name, description FROM categories WHERE ismajoring = 0 ORDER BY id DESC`, function(err, rows) {
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
  }).catch(function() {
    return -1;
  })
}

function getMajorCategory() {
  return new Promise(function(resolve, reject) {
    mysql_pool.getConnection(function(err, connection) {
      if (err) throw err;

      connection.query(`SELECT id, guid, name, description FROM categories WHERE ismajoring = 1 `, function(err, rows) {
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
  }).catch(function() {
    return -1;
  })
}

function getCategories() {
  return new Promise(function(resolve, reject) {
    mysql_pool.getConnection(function(err, connection) {
      if (err) throw err;

      connection.query(`SELECT id, guid, name, description, IF(ismajoring = 1, "yes", "no") AS ismajoring, timer
                        FROM categories ORDER BY id DESC `, function(err, rows) {
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
  }).catch(function() {
    return -1;
  })
}

module.exports = categories;