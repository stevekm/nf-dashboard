var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var axios = require('axios')
const { spawn } = require('child_process');
const serverPort = process.argv[2]; // 8080
const apiUrl = process.argv[3]; // http://localhost
const apiPort = process.argv[4]; // 5000

var numRunningWorkflows = 0;

// ~~~~~ web socket ~~~~~ //
// var WebSocketServer = require('ws').Server,
//   wss = new WebSocketServer({port: 40510})
// wss.on('connection', function (ws) {
//   ws.on('message', function (message) {
//     console.log('web socket received: %s', message)
//   })
//
//   // setInterval(
//   //   () => ws.send(`${new Date()}`),
//   //   1000
//   // )
// })


// const WebSocket = require('ws');
// const ws = new WebSocket('ws://www.host.com/path', {
//   perMessageDeflate: false
// });
const WebSocket = require('ws');
const ws = new WebSocket('ws://localhost:40510');

ws.on('open', function open() {
  ws.send('something');
});

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

// start a new workflow
app.post('/start', function(req, res){
	// console.log(req.body);
	console.log('>>> Starting new workflow...')
	const child = spawn('make', ['launch-nextflow', `APIPORT=${apiPort}`])
	numRunningWorkflows = numRunningWorkflows + 1;
	ws.send(`${numRunningWorkflows}`)
	console.log(`${numRunningWorkflows} running workflows`);

	child.stdout.on('data', (data) => {
	  console.log(`${data}`);
	});

	child.stderr.on('data', (data) => {
	  console.error(`${data}`);
	});

	child.on('exit', function (code, signal) {
	console.log('>>> Child workflow process exited with ' + `code ${code} and signal ${signal}`);
	numRunningWorkflows = numRunningWorkflows - 1;
	  res.sendStatus(200);
	  ws.send(`${numRunningWorkflows}`)
	});
});

app.listen(serverPort);
