var express = require('express');
var app = express();
var bodyParser = require('body-parser')
const { Pool, Client } = require('pg')
const port = process.argv[2]; // 5000

// ~~~~~~~ DATABASE ~~~~~~ //
// clients and pools will use environment variables for connection information
const client = new Client()
client.connect()


// ~~~~~~~ LISTENER ~~~~~~ //
// parse application/json
app.use(bodyParser.json())
var messages = [];
app.post('/', function(req, res) {
    var message = req.body;

    // just call res.end(), or show as string on web
    messages.push(message);
    res.send(JSON.stringify(message, null, 4));

    // insert into database
    const query = {
        text: 'INSERT INTO messages(body) VALUES($1)',
        values: [JSON.stringify(message, null, 4)],
    };
    client.query(query);
});

app.listen(port);
