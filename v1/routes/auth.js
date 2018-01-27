var mysql_pool = require('../db/mysql_con');
var jwt = require('jwt-simple');
var bcrypt = require('bcrypt');

var auth = {
   login: function (req, res, next) {

      var username = req.body.username || '';
      var password = req.body.password || '';

      if (username == '' || password == '') {
         res.status(401);
         res.json({ "status": 401, "message": "Invalid credentials!" });
         return;
      }

      // Fire a query to your DB and check if the credentials are valid
      authenticateUserLogin(username, password).then(function (row) {
         if (row === -1) {
            res.status(401);
            res.json({ 'success': false, 'status': 401, 'message': 'Invalid credentials.' });
            return;
         }

         // If authentication is success, we will generate a token and dispatch it to the client
         var newCredential = genToken(row);

         //update database user token
         if (row[0].id && newCredential.token) {
            updateUserToken(row[0].id, newCredential.token).then(function (result) {
               if (result.affectedRows) {
                  res.json(newCredential);
               } else {
                  res.status(401);
                  res.json({ 'success': false, 'status': 401, 'message': 'Invalid credentials?' });
                  return;
               }
            })
         } else {
            res.status(401);
            res.json({ 'success': false, 'status': 401, 'message': 'Invalid credentials?' });
            return;
         }
      })

   },
   isAuthenticated: function (req, res, next) {
      var username = req.body.username || '';
      var token = req.body.token || '';

      isUserAuthenticated(username, token).then(function (row) {
         if (row === -1) {
            res.status(401)
            res.json({ 'success': true, 'isAuthenticated': false, 'status': 401, 'message': 'Invalid credentials' })
            return;
         }

         res.status(200);
         res.json({ 'success': true, 'isAuthenticated': true, 'message': 'User is Authenticated' })
      })
   }
}

/**
 * validate user login
   * @param {* string } username 
   * @param {* string } password 
   */
function isUserAuthenticated(username, token) {
   return new Promise(function (resolve, reject) {
      mysql_pool.getConnection(function (err, connection) {
         if (err) throw err

         connection.query('SELECT guid, username, is_admin FROM users WHERE username = ? AND token = ?', [username, token], function (err, rows) {
            if (err) {
               return reject(err);
            } else {
               if (Object.keys(rows).length === 0) {
                  reject(new Error('Username or Token Invalid!'));
               }
               resolve(rows);
            }
         })
         connection.release();
      });
   }).catch(function () {
      return -1;
   })
}

/**
 * validate user login
   * @param {* string } username 
   * @param {* string } password 
   */
function authenticateUserLogin(username, password) {
   return new Promise(function (resolve, reject) {
      mysql_pool.getConnection(function (err, connection) {
         if (err) throw err;

         connection.query(`SELECT COALESCE(users.guid, teachers.guid) AS guid, username, password, is_admin, COALESCE(students.majoring_id, 
                            teachers.majoring_id) AS majoring_id, COALESCE(students.fullname, teachers.fullname) AS fullname, isteacher , users.email
                            FROM users
                            LEFT JOIN students ON students.user_id = users.id
                            LEFT JOIN teachers ON teachers.user_id = users.id
                            WHERE username = ? AND status = 1  AND isactivated = 1`, username, function (err, rows) {

               if (err) {
                  return reject(err);
               } else {
                  if (rows.length === 0) {
                     reject(new Error('Username do not match!'));
                  } else {
                     if (!bcrypt.compareSync(password, rows[0].password)) {
                        reject(new Error('Password do not match!'));
                     } else {
                        const res = [{
                           id: rows[0].guid, username: rows[0].username, is_admin: rows[0].is_admin,
                           majoring_id: rows[0].majoring_id, fullname: rows[0].fullname, isteacher: rows[0].isteacher, email: rows[0].email
                        }];
       
                        resolve(res);
                     }
                  }
               }
            })
         connection.release();
      });
   }).catch(function () {
      return -1;
   })
}

/**
 * update user token after successful login
   * @param {*string} userid 
   * @param {*string} token 
   */
function updateUserToken(userid, token) {
   return new Promise(function (resolve, reject) {
      mysql_pool.getConnection(function (err, connection) {
         if (err) throw err

         connection.query('UPDATE users SET token = ? WHERE guid = ?', [token, userid], function (err, result) {
            if (err) {
               return reject(err);
            } else {
               resolve(result);
            }
         })
         connection.release();
      });
   }).catch(function () {
      return -1;
   })
}

/**
 * private method that generate a token after successful login
   * @param {*object} user 
   */
function genToken(user) {
   var expires = expiresIn(1); // 1 day
   var token = jwt.encode({
      exp: expires
   }, require('../config/secret')());

   return { 'success': true, token: token, expires: expires, user: user };
}

/**
 * generate date for token expiry
   * @param {*int} numDays 
   */
function expiresIn(numDays) {
   var dateObj = new Date();
   return dateObj.setDate(dateObj.getDate() + numDays);
}

module.exports = auth;