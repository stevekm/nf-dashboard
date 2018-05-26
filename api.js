var express = require('express');
var app = express();
var bodyParser = require('body-parser')
const { Pool, Client } = require('pg')


// ~~~~~~~ CONFIG ~~~~~~ //
const port = process.argv[2]; // 5000
console.log('>>> starting API on port: ' + port)
app.use(bodyParser.json())


// ~~~~~~~ DATABASE ~~~~~~ //
// clients and pools will use environment variables for connection information
const client = new Client()
client.connect()


// ~~~~~~~ WORKFLOW ~~~~~ //
// send all messages for a workflow
app.get('/workflow/:runid', function(req, res) {
    const query = {
        text: 'SELECT * from messages WHERE runid = $1',
        values: [req.params.runid]
    };
    client.query(query)
        .then(data => {
            var messages = data.rows;
            res.send(JSON.stringify(messages, null));
    });
});

app.get('/workflows', function(req, res){
    const query = 'SELECT DISTINCT runid,runname FROM messages;';
    client.query(query)
        .then(data => {
            var workflows = data.rows;
            res.send(JSON.stringify(workflows, null));
    });
});

// ~~~~~~~ MESSAGE ~~~~~ //
// send or recieve a message
app.route('/message/:id')
    .get(function (req, res) {
        // find the message in the database and return it
        const query = {
            text: 'SELECT id, body FROM messages WHERE id = $1',
            values: [req.params.id],
        };

        client.query(query).then(data => {
            var id = data.rows[0].id;
            var message = data.rows[0].body;
            res.send(JSON.stringify(message, null));
        });
    });

app.route('/message/')
    .post(function (req, res) {
        // parse application/json
        var message = req.body;
        var runId = message.runId;
        var runName = message.runName;
        var runStatus = message.runStatus;
        var utcTime = message.utcTime;
        console.log('>>> API recieved message POST');
        // just call res.end(), or show as string on web
        res.send(JSON.stringify(message, null));

        // insert into database
        const query = {
            text: 'INSERT INTO messages(runId, runName, runStatus, utcTime, body) VALUES($1,$2,$3,$4,$5)',
            values: [runId, runName, runStatus, utcTime, JSON.stringify(message, null)],
        };
        client.query(query);
    });

app.listen(port);
