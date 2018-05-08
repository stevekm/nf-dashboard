var express = require('express');
var app = express();
var bodyParser = require('body-parser')

// parse application/json
app.use(bodyParser.json())

app.post('/', function(req, res) {
   // print to console
   console.log(req.body);

   // just call res.end(), or show as string on web
   res.send(JSON.stringify(req.body, null, 4));
});

const port = 5000;
app.listen(port);
