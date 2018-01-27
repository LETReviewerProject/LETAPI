var mysql     =    require('mysql');

var pool      =    mysql.createPool({
    connectionLimit : 100, //important
    host     : 'localhost',
    user     : 'root',
    password : '',
    database : 'let',
    debug    :  false
});

/**
 * select statement
 * @param {*select sql} sql 
 * @param {*} req 
 * @param {*} res 
 */
function selectQuery(sql, arg, callbackFn) {
    pool.getConnection(function(err, connection) {
        if(err) throw err

        connection.query(sql, arg, function(err, rows) {
            if(err) {
                callbackFn(err, null);
            } else {
                callbackFn(null, rows);
            }
        })
        connection.release();
    });
}

/**
 * insert statement
 * @param {*} sql 
 * @param {*} req 
 * @param {*} res 
 */
function insertQuery(sql, req, res) {
    console.log('inserting query..');
}

/**
 * update statement
 * @param {*} sql 
 * @param {*} req 
 * @param {*} res 
 */
function updateQuery(sql, req, res) {
    console.log('inserting query..');
}

/**
 * delete statement
 * @param {*} sql 
 * @param {*} req 
 * @param {*} res 
 */
function deleteQuery(sql, req, res) {
    console.log('inserting query..');
}

module.exports = {
    selectQuery,
    insertQuery
}