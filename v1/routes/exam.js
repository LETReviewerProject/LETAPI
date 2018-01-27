var mysql_pool = require('../db/mysql_con');
var _ = require('lodash');

var exam = {
  summaryResults: function(req, res, next) {
    var values = {
      student_guid: req.body.student_guid
    }

    getSummaryResults(values).then(function(rows) {
      if (rows === -1) {
        res.status(401);
        res.json({ 'success': false, 'status': 401, 'message': 'An error occurred while processing request.' });
        return;
      }
      res.status(200);
      res.json({ 'success': true, 'results': rows });
    })
  },
  earnedPoints: function(req, res, next) {
    var values = {
      category_names: req.body.category_names || [],
      exam_guid: req.body.exam_guid
    }

    getEarnedPoints(values).then(function(result) {
      if (result === -1) {
        res.status(401);
        res.json({ 'success': false, 'status': 401, 'message': 'An error occurred while processing request.' });
        return;
      }
      res.status(200);
      res.json({ 'success': true, 'earned_score': result });
    })

  },
  sumTotalPoints: function(req, res, next) {
    var values = {
      category_names: req.body.category_names || [],
      exam_guid: req.body.exam_guid
    }

    getSumTotalPoints(values).then(function(result) {
      if (result === -1) {
        res.status(401);
        res.json({ 'success': false, 'status': 401, 'message': 'An error occurred while processing request.' });
        return;
      }
      res.status(200);
      res.json({ 'success': true, 'total_score': result });
    })
  },
  totalForCategory: function(req, res, next) {
    var values = {
      category_names: req.body.category_names || [],
      exam_guid: req.body.exam_guid
    }

    getTotalForCategory(values).then(function(result) {
      if (result === -1) {
        res.status(401);
        res.json({ 'success': false, 'status': 401, 'message': 'An error occurred while processing request.' });
        return;
      }
      res.status(200);
      res.json({ 'success': true, 'category_score': result });
    })
  },
  checkAnswers: function(req, res, next) {
    var values = {
      answers: req.body.answers || [],
    }

   const guid = createGuid('RS');

    var arrAnswers = [];
    for(var i in values.answers) {
      myAnswers = {
        answer_id: values.answers[i].id,
        guid: guid,
        name: values.answers[i].name,
        iscorrect: values.answers[i].iscorrect,
        question_id: values.answers[i].question_id,
        student_guid: values.answers[i].student_guid,
        my_answer_txt: values.answers[i].my_answer_txt,
      }
      arrAnswers.push(myAnswers);
    }

    values.answers = arrAnswers;

    for (i in values.answers) {
      delete values.answers[i].name;
      delete values.answers[i].my_answer;
    }

    var my_answers = (_.mapValues(values, function(currentArray) {
      return _.map(currentArray, _.values)
    }));

    insertResult(my_answers).then(function(result) {
      if (result === -1) {
        res.status(401);
        res.json({ 'success': false, 'status': 401, 'message': 'An error occurred while processing request.' });
        return;
      }
      res.status(200);
      res.json({ 'success': true, 'message': 'Successfullt inserted student answers', 'guid': guid });
    })

  },
  examAnswersByQuestion: function(req, res, next) {
    var values = {
      question_ids: req.body.question_ids || []
    }

    getAnswersByQuestion(values).then(function(rows) {
      if (rows === -1) {
        res.status(401);
        res.json({ 'success': false, 'status': 401, 'message': 'An error occurred while processing request.' });
        return;
      }

      res.status(200);
      res.json({ 'success': true, 'answers': rows });
    })
  },
  examQuestionsByCategory: function(req, res, next) {
    var values = {
      category_majoring: req.body.category_majoring || ''
    }

    getExamQuestionsByCategory(values).then(function(rows) {
      if (rows === -1) {
        res.status(401);
        res.json({ 'success': false, 'status': 401, 'message': 'An error occurred while processing request.' });
        return;
      }

      res.status(200);
      res.json({ 'success': true, 'questions': rows });
    })
  },
  tabMajoringCategory: function(req, res, next) {
    var values = {
      majoring_id: req.body.majoring_id || '',
      selection: req.body.selection || '',
      guid: req.body.guid || ''
    }

    getMajoringCategory(values).then(function(rows) {
      if (rows === -1) {
        res.status(401);
        res.json({ 'success': false, 'status': 401, 'message': 'An error occurred while processing request.' });
        return;
      }
      res.status(200);
      res.json({ 'success': true, 'categories': rows });
    })
  },
  tabCategories: function(req, res, next) {
    var values = {
      majoring_id: req.body.majoring_id || '',
      selection: req.body.selection || '',
      categoryId: req.body.categoryId || 0
    }

    getTabCategories(values).then(function(rows) {
      if (rows === -1) {
        res.status(401);
        res.json({ 'success': false, 'status': 401, 'message': 'An error occurred while processing request.' });
        return;
      }
      res.status(200);
      res.json({ 'success': true, 'categories': rows });
    })
  },
  examByCategories: function(req, res, next) {
    examByCategories().then(function(rows) {
      if (rows === -1) {
        res.status(401);
        res.json({ 'success': false, 'status': 401, 'message': 'An error occurred while processing request.' });
        return;
      }
      res.status(200);
      res.json({ 'success': true, 'categories': rows });
    })
  }
}

function getSummaryResults(values) {
  return new Promise(function(resolve, reject) {
    mysql_pool.getConnection(function(err, connection) {
      if (err) throw err;

      connection.query(`SELECT category, guid, questionname, (pts) AS pts, iscorrect, my_answer, examdate, total, remark FROM 
                           (
                           SELECT questions.category_majoring AS category, questions.name AS questionname, questions.pts,
                           answers.iscorrect, examresults.my_answer, DATE_FORMAT(examresults.createddate, '%c/%e/%Y %T') AS examdate, examresults.guid AS guid,
                              IF(my_answer = 1 AND iscorrect = 1, (pts), 0) as total,
                              IF(my_answer = 1 AND iscorrect = 1, 'Check', 'Wrong') as remark 
                           FROM questions
                           INNER JOIN examresults ON examresults.question_id = questions.id
                           INNER JOIN answers ON answers.id = examresults.answer_id
                           WHERE examresults.student_guid = ?
                              AND iscorrect = 1
                           ) AS t
                           GROUP BY guid, questionname
                           ORDER BY examdate DESC
                           `, [values.student_guid], function(err, rows) {
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
  }).catch(function() {
    return -1;
  })
}

function getEarnedPoints(values) {
  return new Promise(function(resolve, reject) {
    mysql_pool.getConnection(function(err, connection) {
      if (err) throw err;

      connection.query(`SELECT SUM(questions.pts) AS total FROM questions WHERE questions.id IN(
                           SELECT examresults.question_id
                           FROM examresults 
                              INNER JOIN answers ON answers.id = examresults.answer_id
                           WHERE examresults.guid = ?
                           AND my_answer = 1
                              AND iscorrect = 1
                           GROUP BY examresults.question_id)
                           AND category_majoring IN (?)   `, [values.exam_guid, values.category_names], function(err, rows) {
        if (err) {
          return reject(err);
        } else {
          if (rows == null || Object.keys(rows).length === 0) {
            return reject(0);
          }

          var total = rows[0].total;
          if (total == null) {
            total = 0;
          }

          resolve(total);
        }
      })
      connection.release();
    })
  }).catch(function() {
    return -1;
  })
}

function getSumTotalPoints(values) {
  return new Promise(function(resolve, reject) {
    mysql_pool.getConnection(function(err, connection) {
      if (err) throw err;

      connection.query(`SELECT SUM(questions.pts) AS total FROM questions WHERE questions.id IN(
                           SELECT examresults.question_id
                           FROM examresults 
                           WHERE examresults.guid = ?
                           GROUP BY examresults.question_id)
                           AND category_majoring IN (?)  `, [values.exam_guid, values.category_names], function(err, rows) {
        if (err) {
          return reject(err);
        } else {
          if (rows == null || Object.keys(rows).length === 0) {
            return reject([]);
          }

          resolve(rows[0].total);
        }
      })
      connection.release();
    })
  }).catch(function() {
    return -1;
  })
}

function getTotalForCategory(values) {
  return new Promise(function(resolve, reject) {
    mysql_pool.getConnection(function(err, connection) {
      if (err) throw err;
      connection.query(`SELECT q.name, q.category_majoring, 
                                 SUM(COALESCE((SELECT COALESCE(questions.pts, 0) AS pts
                                 FROM examresults 
                                 INNER JOIN answers ON answers.id = examresults.answer_id 
                                 INNER JOIN questions ON questions.id = examresults.question_id
                                 WHERE examresults.question_id = q.id
                                 AND examresults.my_answer = 1 AND answers.iscorrect = 1
                                 AND examresults.guid = ?
                              ),0)) AS total
                              FROM questions AS q
                              WHERE q.id IN(
                                 SELECT question_id 
                                 FROM examresults 
                                 WHERE examresults.guid = ?
                              )
                        GROUP BY category_majoring`, [values.exam_guid, values.exam_guid], function(err, rows) {
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

function createGuid(prefix) {
  var maximum = 10000000;
  var minimum = 100000;
  var num = Math.floor(Math.random() * (maximum - minimum + 1)) + minimum;

  return prefix + '-' + num;
}

function insertResult(values) {
  return new Promise(function(resolve, reject) {
    mysql_pool.getConnection(function(err, connection) {
      if (err) throw err;

      connection.query(`INSERT INTO examresults (answer_id, guid, my_answer, question_id, student_guid, my_answer_txt) VALUES ? `, [values.answers],
        function(err, result) {
          if (err) {
            return reject(err);
          }
          resolve(result);
        })

      connection.release();
    })
  }).catch(function() {
    return -1;
  })
}

function checkAnswers(values) {
  // return new Promise(function (resolve, reject) {
  //    mysql_pool.getConnection(function (err, connection) {
  //       if (err) throw err;

  //       var isCorrect = (values.iscorrect == false ? '0' : '1');

  //       connection.query(`SELECT id, guid, name, iscorrect, question_id FROM answers 
  //                         WHERE id = ? AND iscorrect = ? `,
  //          [values.id, isCorrect], function (err, result) {
  //             if (err) {
  //                return reject(err);
  //             } else {
  //                if (result == null || Object.keys(result).length === 0) {
  //                   return resolve(0);
  //                }

  //                resolve(1);
  //             }
  //          })
  //       connection.release();
  //    })
  // }).catch(function () {
  //    return -1;
  // })
}

function getAnswersByQuestion(values) {
  return new Promise(function(resolve, reject) {
    mysql_pool.getConnection(function(err, connection) {
      if (err) throw err;

      connection.query(`SELECT id, guid, name, iscorrect, question_id FROM answers 
                           WHERE question_id IN (?) 
                           ORDER BY RAND() `, [values.question_ids], function(err, rows) {
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
  }).catch(function() {
    return -1;
  })
}

function getExamQuestionsByCategory(values) {
  return new Promise(function(resolve, reject) {
    mysql_pool.getConnection(function(err, connection) {
      if (err) throw err;

      connection.query(`SELECT questions.id, questions.guid, questions.name, questions.pts, questions.description, 
                              questions.category_majoring
                           FROM questions
                           WHERE questions.category_majoring IN (?)
                           ORDER BY RAND() `,

        [values.category_majoring],
        function(err, rows) {
          if (err) {
            return reject(err);
          } else {
            if (rows == null || Object.keys(rows).length === 0) {
              return resolve([]);
            }

            //group by majorings
            const res = _.groupBy(rows, 'category_majoring')

            resolve(res);
          }
        })
      connection.release();
    })
  }).catch(function() {
    return -1;
  })
}

function groupArrayByProperty(a, prop) {
  return a.filter(function(item, index, array) {
    return array.map(function(mapItem) {
      return mapItem[prop];
    }).indexOf(item[prop]) === index;
  })
}

function getMajoringCategory(values) {
  return new Promise(function(resolve, reject) {
    mysql_pool.getConnection(function(err, connection) {
      if (err) throw err;

      var majoringSql = '';
      if (values.selection === 'elementary') {
        majoringSql = `  `;
      }
      var sql = `SELECT id, guid, name, ismajoring, description, timer FROM
                     (SELECT categories.id, categories.guid, categories.name, categories.ismajoring, categories.description, timer
                     FROM categories
                     LEFT JOIN majorings ON majorings.category_id = categories.id
                     WHERE categories.ismajoring = 0
                     UNION SELECT majorings.id, majorings.guid, majorings.name, '1' AS ismajoring, majorings.description, timer
                     FROM majorings
                     INNER JOIN categories ON categories.id = majorings.category_id
                    ) AS tabs
                    WHERE guid = ? 
                  ORDER BY tabs.ismajoring DESC`
  
      connection.query(sql, [values.guid], function(err, rows) {
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
  }).catch(function() {
    return -1;
  })
}

function getTabCategories(values) {
  return new Promise(function(resolve, reject) {
    mysql_pool.getConnection(function(err, connection) {
      if (err) throw err;

      var majoringSql = '';
      if (values.selection === 'elementary') {
        majoringSql = ` UNION SELECT majorings.id, majorings.guid, majorings.name, '1' AS ismajoring, majorings.description, timer
                           FROM majorings
                           INNER JOIN categories ON categories.id = majorings.category_id
                           WHERE majorings.id = ? `;
      }
      var sql = `SELECT id, guid, name, ismajoring, description, timer FROM
                     (SELECT categories.id, categories.guid, categories.name, categories.ismajoring, categories.description, timer
                     FROM categories
                     LEFT JOIN majorings ON majorings.category_id = categories.id
                     WHERE categories.ismajoring = 0
                  ${majoringSql} ) AS tabs
                  ORDER BY tabs.ismajoring DESC`
  
      connection.query(sql, [values.majoring_id], function(err, rows) {
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
  }).catch(function() {
    return -1;
  })
}

function examByCategories() {
  return new Promise(function(resolve, reject) {
    mysql_pool.getConnection(function(err, connection) {
      if (err) throw err;

      connection.query(`SELECT categories.id, categories.guid, categories.name, categories.description, categories.ismajoring, 
                              majorings.category_id, majorings.name AS majoring_name, majorings.description AS majoring_description,
                              majorings.guid AS majoring_guid, majorings.id AS majoring_id, students.majoring_id AS student_majoring_id
                           FROM categories
                           LEFT JOIN majorings ON majorings.category_id = categories.id
                           LEFT JOIN students ON students.majoring_id = majorings.id`,
        function(err, rows) {
          if (err) {
            return reject(err);
          } else {
            if (rows == null || Object.keys(rows).length === 0) {
              return reject('Problem when fetching records..');
            }

            var fmtdArrItem = [];
            var grpArrItem = groupArrayByProperty(rows, 'name'); //group by name
            for (i in grpArrItem) {
              var itemObj = {};
              var itemArr = [];

              itemObj['name'] = grpArrItem[i].name;
              itemObj['category_id'] = grpArrItem[i].category_id;
              itemObj['guid'] = grpArrItem[i].guid;
              itemObj['description'] = grpArrItem[i].description;

              itemObj['rows'] = [];

              for (i in rows) {
                if (rows[i].id === itemObj['category_id']) {

                  delete rows[i].guid;
                  delete rows[i].name;
                  delete rows[i].description

                  itemArr.push(rows[i]);
                }
                itemObj['rows'] = itemArr;
              }
              fmtdArrItem.push(itemObj);
            }

            resolve(fmtdArrItem);
          }
        })
      connection.release();
    })
  }).catch(function() {
    return -1;
  })
}

module.exports = exam;