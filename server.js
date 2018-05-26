var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var axios = require('axios')
const serverPort = process.argv[2]; // 8080
const apiUrl = process.argv[3]; // http://localhost
const apiPort = process.argv[4]; // 5000

// ~~~~~~~ WEB SERVER ~~~~~~ //
// viewed at http://localhost:8080
app.set('view engine', 'ejs');

// app home page
app.get('/', function(req, res) {
	// get a list of workflows from the API
	var url = apiUrl + ':' + apiPort + '/workflows/';
	axios.get(url)
	  .then(function(response){
		res.render('index', { runs: response.data})
	});
});

// workflow page
app.get('/workflow/:runid', function(req, res) {
	// get the messages for a specific workflow
	var runid = req.params.runid;
	var url = apiUrl + ':' + apiPort + '/workflow/' + runid;
	axios.get(url)
	  .then(function(response){
			res.render('workflow', { messages: response.data, runid: runid})
		});
});

// single message
app.get('/message/:id', (req, res) => {
  // get a message from the API to display on the page
  var messageid = req.params.id;
  var url = apiUrl + ':' + apiPort + '/message/' + messageid;
  axios.get(url)
	.then(function(response){
		var message = response.data;
	  res.render('message', {
	    message: JSON.stringify(message, null, 4)
	});
  });
});

app.listen(serverPort);
