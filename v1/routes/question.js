var mysql_pool = require('../db/mysql_con');
var _ = require('lodash');

var questions = {
   questionByUser: function(req, res, next) {
      var values = {
         user_guid: req.body.user_guid
      }

      getQuestionByUser(values).then(function (rows) {
         if (rows === -1) {
            res.status(401);
            res.json({ 'success': false, 'status': 401, 'message': 'An error occurred while processing request.' });
            return;
         }

         res.status(200);
         res.json({ 'success': true, 'questions': rows });
      })
   },
   questionByResults: function (req, res, next) {
      var values = {
         question_ids: req.body.question_ids,
         category_names: req.body.category_names,
         exam_guid: req.body.exam_guid
      }

      getQuestionByResults(values).then(function (rows) {
         if (rows === -1) {
            res.status(401);
            res.json({ 'success': false, 'status': 401, 'message': 'An error occurred while processing request.' });
            return;
         }

         res.status(200);
         res.json({ 'success': true, 'questions': rows });
      })
   },
   questionIdsFromResults: function (req, res, next) {
      var values = {
         guid: req.body.guid,
         student_guid: req.body.student_guid
      }

      getQuestionIdsFromResults(values).then(function (rows) {
         if (rows === -1) {
            res.status(401);
            res.json({ 'success': false, 'status': 401, 'message': 'An error occurred while processing request.' });
            return;
         }

         var arr = [];
         for (i in rows) {
            arr.push(rows[i].question_id);
         }

         res.status(200);
         res.json({ 'success': true, 'questionids': arr });
      })
   },
   answerByQuestion: function (req, res, next) {
      var values = {
         question_id: req.body.question_id
      }

      answerByQuestion(values).then(function (rows) {
         if (rows === -1) {
            res.status(401);
            res.json({ 'success': false, 'status': 401, 'message': 'An error occurred while processing request.' });
            return;
         }

         res.status(200);
         res.json({ 'success': true, 'answers': rows });
      })
   },
   getQuestionById: function (req, res, next) {
      var values = {
         question_guid: req.body.question_guid
      };

      getQuestionById(values).then(function (result) {
         if (result === -1) {
            res.status(401);
            res.json({ 'success': false, 'status': 401, 'message': 'An error occurred while processing request.' });
            return;
         }
         res.status(200);
         res.json({ 'success': true, 'question': result });
      })
   },
   deleteAnswers: function (req, res, next) {
      var values = {
         question_id: req.params.id
      };

      deleteAnswers(values).then(function (result) {
         if (result === -1) {
            res.status(401);
            res.json({ 'success': false, 'status': 401, 'message': 'An error occurred while processing delete request.' });
            return;
         }

         res.status(200);
         res.json({ 'success': true, 'message': 'Successfully deleted answers' });
      })
   },
   updateAnswers: function (req, res, next) {
      var values = {
         guid: createGuid('AW'),
         name: req.body.name,
         iscorrect: req.body.iscorrect,
         question_id: req.body.question_id
      };

      insertAnswers(values).then(function (result) {
         if (result === -1) {
            res.status(401);
            res.json({ 'success': false, 'status': 401, 'message': 'An error occurred while processing request.' });
            return;
         }
         res.status(200);
         res.json({ 'success': true, 'message': 'Successfully updated answers' });
      })
   },
   getAnswers: function (req, res, next) {
      var values = {
         question_guid: req.body.question_guid
      };

      getAnswers(values).then(function (rows) {
         if (rows === -1) {
            res.status(401);
            res.json({ 'success': false, 'status': 401, 'message': 'An error occurred while processing request.' });
            return;
         }
         res.status(200);
         res.json({ 'success': true, 'answers': rows });
      })

   },
   insertAnswers: function (req, res, next) {
      var values = {
         guid: createGuid('AW'),
         name: req.body.name,
         iscorrect: req.body.iscorrect,
         question_id: req.body.question_id
      };

      insertAnswers(values).then(function (result) {
         if (result === -1) {
            res.status(401);
            res.json({ 'success': false, 'status': 401, 'message': 'An error occurred while processing request.' });
            return;
         }
         res.status(200);
         res.json({ 'success': true, 'message': 'Successfully inserted answers' });
      })
   },
   list: function (req, res, next) {
      getQuestions().then(function (rows) {
         if (rows === -1) {
            res.status(401);
            res.json({ 'success': false, 'status': 401, 'message': 'An error occurred while processing request.' });
            return;
         }
         res.status(200);
         res.json({ 'success': true, 'questions': rows });
      })
   },
   create: function (req, res, next) {
      var values = {
         guid: createGuid('QS'),
         name: req.body.name || '',
         pts: req.body.pts || '',
         description: req.body.description || '',
         category_majoring: req.body.category_majoring || '',
         answers: req.body.answer_options || '',
         user_guid: req.body.user_guid || ''
      };

      insertQuestion(values).then(function (result) {
         if (result === -1) {
            res.status(401);
            res.json({ 'success': false, 'status': 401, 'message': 'An error occurred while processing request.' });
            res.send();
         }

         var insertedId = result.insertId;

         //update illustration after successfull question insert
         // updateIllustration(values).then(function (result) {
         //    if (result === -1) {
         //       res.status(401);
         //       res.json({ 'success': false, 'status': 401, 'message': 'An error occurred while processing update illustration.' });
         //       res.send();
         //    }
         // })

         getQuestionByUser(values).then(function (rows) {
            if (rows === -1) {
               res.status(401);
               res.json({ 'success': false, 'status': 401, 'message': 'An error occurred while processing retreiving question.' });
            }
            res.status(200);
            res.json({ 'success': true, 'questions': rows, 'guid': values.guid, 'insertedId': insertedId });
         })
      })
   },
   update: function (req, res, next) {
      var values = {
         guid: req.body.guid,
         name: req.body.name || '',
         pts: req.body.pts || '',
         description: req.body.description || '',
         category_majoring: req.body.category_majoring || '',
         user_guid: req.body.user_guid || ''
      };

      updateQuestion(values).then(function (rows) {
         if (rows === -1) {
            res.status(401);
            res.json({ 'success': false, 'status': 401, 'message': 'An error occurred while processing update request.' });
            return;
         }

         getQuestionByUser(values).then(function (rows) {
            if (rows === -1) {
               res.status(401);
               res.json({ 'success': false, 'status': 401, 'message': 'An error occurred while processing get question request.' });
               return;
            }
            console.log('qupdate questions..');
            res.status(200);
            res.json({ 'success': true, 'questions': rows });
         })
      })
      return;

   },
   delete: function (req, res, next) {
      var guid = req.params.guid;

      deleteQuestion(guid).then(function (rows) {
         if (rows === -1) {
            res.status(401);
            res.json({ 'success': false, 'status': 401, 'message': 'An error occurred while processing request.' });
            return;
         }

         getQuestions().then(function (rows) {
            if (rows === -1) {
               res.status(401);
               res.json({ 'success': false, 'status': 401, 'message': 'An error occurred while processing request.' });
               return;
            }
            res.status(200);
            res.json({ 'success': true, 'questions': rows });
         })

      })
      return;
   }
}

function getQuestionByResults(values) {
   return new Promise(function (resolve, reject) {
      mysql_pool.getConnection(function (err, connection) {
         if (err) throw err;

         connection.query(`SELECT questions.id, questions.guid, name, pts, category_majoring, 
                           examres.my_answer, examres.iscorrect, examres.answer_name, examres.my_answer_txt
                           FROM questions 

                           INNER JOIN ( 
                              SELECT examresults.guid, examresults.answer_id, examresults.question_id, examresults.my_answer, 
                                     answers.iscorrect, 
                                     answers.name AS answer_name, my_answer_txt
                              FROM examresults 
                              INNER JOIN answers ON answers.id = examresults.answer_id 
                              AND answers.iscorrect = 1 
                           
                           ) AS examres ON examres.question_id = questions.id 
                              
                           WHERE questions.category_majoring IN (?) AND examres.guid = ?`,

            [values.category_names, values.exam_guid], function (err, rows) {
               if (err) {
                  return reject(err);
               } else {
                  if (rows == null || Object.keys(rows).length === 0) {
                     resolve([]);
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

function getQuestionIdsFromResults(values) {
   return new Promise(function (resolve, reject) {
      mysql_pool.getConnection(function (err, connection) {
         if (err) throw err;

         connection.query(`SELECT question_id FROM examresults WHERE guid = ? AND student_guid = ? GROUP BY question_id`,
            [values.guid, values.student_guid], function (err, rows) {
               if (err) {
                  return reject(err);
               } else {
                  if (rows == null || Object.keys(rows).length === 0) {
                     resolve([]);
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

function answerByQuestion(values) {
   return new Promise(function (resolve, reject) {
      mysql_pool.getConnection(function (err, connection) {
         if (err) throw err;

         connection.query('SELECT id, guid, name, iscorrect, question_id FROM answers WHERE question_id = ? ',
            [values.question_id], function (err, rows) {
               if (err) {
                  return reject(err);
               } else {
                  if (rows == null || Object.keys(rows).length === 0) {
                     return reject([]);
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

function getQuestionById(values) {
   return new Promise(function (resolve, reject) {
      mysql_pool.getConnection(function (err, connection) {
         if (err) throw err;
         console.log(values);
         connection.query(`SELECT id FROM questions WHERE guid = ? `, [values.question_guid], function (err, rows) {
            if (err) {
               return reject(err);
            } else {
               if (rows == null || Object.keys(rows).length === 0) {
                  resolve([]);
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

function deleteAnswers(values) {
   return new Promise(function (resolve, reject) {
      mysql_pool.getConnection(function (err, connection) {
         if (err) throw err;

         connection.query(`DELETE FROM answers WHERE question_id = ? `,
            [values.question_id], function (err, result) {
               if (err) {
                  return reject(err);
               }

               resolve('Just Deleted Answers..');
            })

         connection.release();
      })
   }).catch(function () {
      return -1;
   })
}

function getAnswers(values) {
   return new Promise(function (resolve, reject) {
      mysql_pool.getConnection(function (err, connection) {
         if (err) throw err;

         connection.query(`SELECT answers.id, answers.guid, answers.name, answers.iscorrect, answers.question_id 
                           FROM answers
                           INNER JOIN questions on questions.id = answers.question_id
                           WHERE questions.guid = ? ORDER BY answers.id ASC`, [values.question_guid], function (err, rows) {
               if (err) {
                  return reject(err);
               } else {
                  if (rows == null || Object.keys(rows).length === 0) {
                     resolve([]);
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

function insertAnswers(values) {
   return new Promise(function (resolve, reject) {
      mysql_pool.getConnection(function (err, connection) {
         if (err) throw err;

         connection.query(`INSERT INTO answers (guid, name, iscorrect, question_id) VALUES (?, ?, ?, ?) `,
            [values.guid, values.name, values.iscorrect, values.question_id], function (err, result) {
               if (err) {
                  return reject(err);
               }

               console.log('record inserted.. ', values.name);

               resolve(result);
            })

         connection.release();
      })
   }).catch(function () {
      return -1;
   })
}

function deleteQuestion(guid) {
   return new Promise(function (resolve, reject) {
      mysql_pool.getConnection(function (err, connection) {
         if (err) throw err;

         connection.query('DELETE questions, answers FROM questions INNER JOIN answers ON answers.question_id = questions.id WHERE questions.guid = ?', [guid],
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

function updateQuestion(values) {
   return new Promise(function (resolve, reject) {
      mysql_pool.getConnection(function (err, connection) {
         if (err) throw err;

         connection.query(`UPDATE questions SET guid = ?, name = ?, pts = ?, description = ?, category_majoring = ? WHERE guid = ?`,
            [values.guid, values.name, values.pts, values.description, values.category_majoring, values.guid],
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

function updateIllustration(values) {
   return new Promise(function (resolve, reject) {
      mysql_pool.getConnection(function (err, connection) {
         if (err) throw err;

         connection.query(`UPDATE questions SET illustration = ? WHERE guid = ?`,
            [values.illustration, values.guid], function (err, result) {
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

function insertQuestion(values) {
   return new Promise(function (resolve, reject) {
      mysql_pool.getConnection(function (err, connection) {
         if (err) throw err;

         connection.query(`INSERT INTO questions (guid, name, pts, description, category_majoring, user_guid) 
                           VALUES (?, ?, ?, ?, ?, ?)`,
            [values.guid, values.name, values.pts, values.description, values.category_majoring, values.user_guid], function (err, results) {

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

function getQuestionByUser(values) {
   return new Promise(function (resolve, reject) {
      mysql_pool.getConnection(function (err, connection) {

         if (err) throw err;
         console.log(values);
         connection.query(`SELECT id, guid, name, pts, description, category_majoring FROM 
                          (
                          SELECT id, guid, name, pts, description, category_majoring
                                                      FROM questions
                                                      WHERE user_guid = ?
                                                      AND category_majoring NOT LIKE 'General Education'
                                                      AND category_majoring NOT LIKE 'Professional Education'
                          UNION ALL             
                          SELECT id, guid, name, pts, description, category_majoring
                                                      FROM questions
                                                      WHERE category_majoring LIKE 'General Education'
                                                      OR category_majoring LIKE 'Professional Education'           
                          ) t
                                                      ORDER BY t.id DESC`,
                           [ values.user_guid ], function (err, rows) {
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

function getQuestions() {
   return new Promise(function (resolve, reject) {
      mysql_pool.getConnection(function (err, connection) {

         if (err) throw err;

         connection.query(`SELECT id, guid, name, pts, description, category_majoring
                           FROM questions ORDER BY id DESC`, function (err, rows) {
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

module.exports = questions;