var mysql      = require('mysql');
var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : '',
  database : 'tiles'
});


connection.connect();

// connection.query('SELECT 1 + 1 AS solution', function(err, rows, fields) {
//   if (err) throw err;

//   console.log('The solution is: ', rows[0].solution);
// });

// connection.end();

function loadClient(creds, cb) {
	var queryString = 'SELECT * FROM `account` WHERE username="' + creds.username + '" AND password="'+ creds.password+'";';
	var query = connection.query(queryString);
	query.on('result', function(row) {
        cb(null, row);
    });
    query.on('end', function() {
        cb(null, null);
    });
}

function saveClient(client, cb){
	client.position.x = client.position.x || 0
	client.position.y = client.position.y || 0
	var queryString = 'UPDATE `account` SET x=' + client.position.x + ', y=' + client.position.y + ' WHERE username="'+client.username+'";';
	console.log(queryString);
	var query = connection.query(queryString);
	query.on('end', function() {
        //cb();
    });
}