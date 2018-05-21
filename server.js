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
	client.query({text: 'SELECT id, body FROM messages;'})
		.then(data => {
			res.render('index', { messages: data.rows})
		});
});
// client.query({text: 'SELECT id, body FROM messages WHERE id = 1;'}).then(data => {console.log(data.rows)});

// app message
app.get('/message/:id', (req, res) => {
  // find the message in the database
  const query = {
	  text: 'SELECT id, body FROM messages WHERE id = $1',
	  values: [req.params.id],
  };
  client.query(query).then(data => {
	  var id = data.rows[0].id;
	  var message = data.rows[0].body;

	  // render the `message.ejs` template with the message content
	  res.render('message', {
	    author: message.runName,
	    title: message.id,
	    body: JSON.stringify(message, null, 4)
	});
  });
});

app.listen(port);
