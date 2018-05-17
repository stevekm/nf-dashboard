var express = require('express');
var app = express();
var bodyParser = require('body-parser');
const { Pool, Client } = require('pg');
const port = process.argv[2]; // 8080

// ~~~~~~~ DATABASE ~~~~~~ //
// clients and pools will use environment variables for connection information
// const pool = new Pool()
const client = new Client();
client.connect();

// ~~~~~~~ WEB SERVER ~~~~~~ //
// viewed at http://localhost:8080
app.set('view engine', 'ejs');

// app home page
app.get('/', function(req, res) {
	// get the messages from the database
	var rows;
	client.query({text: 'SELECT body FROM messages;'}, function(err, res){
		if (err) {
			console.log(err.stack);
		} else {
			console.log("querying")
			rows = res.rows;
		}
	});

	console.log(rows);

	// render `index.ejs` with the list of posts
    res.render('index', { messages: rows });
});

app.listen(port);
