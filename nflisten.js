var express = require('express');
var app = express();
var bodyParser = require('body-parser')

// ~~~~~~~ LISTENER ~~~~~~ //
// parse application/json
app.use(bodyParser.json())
var messages = [];
var message_count = 0
app.post('/', function(req, res) {
    var message = req.body;
    message['id'] = message_count
    message_count = message_count + 1

    // print to console
    console.log(message);

    // just call res.end(), or show as string on web
    messages.push(message);
    res.send(JSON.stringify(message, null, 4));
});

const port = 5000;
app.listen(port);


// ~~~~~~~ WEB SERVER ~~~~~~ //
// viewed at http://localhost:8080
app.set('view engine', 'ejs');

// app home page
app.get('/', function(req, res) {
    // render `index.ejs` with the list of posts
    res.render('index', { messages: messages })
});


// app message
app.get('/message/:id', (req, res) => {
  // find the message in the `messages` array
  const message = messages.filter((message) => {
    return message.id == req.params.id
  })[0]

  // render the `message.ejs` template with the message content
  res.render('message', {
    author: message.runName,
    title: message.id,
    body: JSON.stringify(message, null, 4)
  })
})

app.listen(8080);
