var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var axios = require('axios')
const { spawn } = require('child_process');
var events = require('events');
var workflowState = new events.EventEmitter();

// ~~~~~ GLOBALS ~~~~~ //
const serverPort = process.env.SERVERPORT || process.argv[2] || 8080;
const apiUrl = process.env.APIURL || process.argv[3] || "http://localhost";
const apiPort = process.env.APIPORT || process.argv[4] || 5000;
const wsPort = process.env.WSPORT || process.argv[5] || 40510;

workflowState.numWorkflows = 0;
workflowState.addWorkflow = function(){
    this.numWorkflows += 1
};
workflowState.removeWorkflow = function(){
    this.numWorkflows -= 1
};
workflowState.state = function(){
    var state;
    if(Number(this.numWorkflows) < 1 ){
        state = {"num": this.numWorkflows, "state": "No running workflows"}
    } else {
        state = {"num": this.numWorkflows, "state": `${this.numWorkflows} running workflows`}
    };
    return(state);
};

// ~~~~~ web socket server ~~~~~ //
var WebSocketServer = require('ws').Server
const wss = new WebSocketServer({port: wsPort})

wss.on('connection', function (ws) {
    // send server state upon initial connection
    ws.send(JSON.stringify(workflowState.state()));

    ws.on('message', function (message) {
        console.log('web socket received: %s', message);
    });

    workflowState.on("start-workflow", function(){
        if (ws.readyState === ws.OPEN) {
            ws.send(JSON.stringify(workflowState.state()));
        } else {
            console.log('Workflow started but socket not connected. Workflow state: ' + JSON.stringify(workflowState.state()));
            ws.close();
        };
    });

    workflowState.on("end-workflow", function(){
        if (ws.readyState === ws.OPEN) {
            ws.send(JSON.stringify(workflowState.state()));
        } else {
            console.log('Workflow ended but socket not connected. Workflow state: ' + JSON.stringify(workflowState.state()));
            ws.close();
        };
    });
});


// ~~~~~~~ WEB SERVER ~~~~~~ //
// viewed at http://localhost:8080
app.set('view engine', 'ejs');
app.use('/public', express.static('public'));

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
    console.log('>>> Starting new workflow...');
    const child = spawn('make', ['launch-nextflow', `APIPORT=${apiPort}`]);
    workflowState.emit("start-workflow");
    workflowState.addWorkflow();

    child.stdout.on('data', (data) => {
        console.log(`${data}`);
    });

    child.stderr.on('data', (data) => {
        console.error(`${data}`);
    });

    child.on('exit', function (code, signal) {
    console.log('>>> Child workflow process exited with ' + `code ${code} and signal ${signal}`);
        workflowState.emit("end-workflow");
        workflowState.removeWorkflow();
        res.sendStatus(200);
    });
});

app.listen(serverPort);
