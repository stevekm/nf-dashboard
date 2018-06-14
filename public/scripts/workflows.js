// code to run the workflow monitor via web socket
var ws = new WebSocket('ws://localhost:40510');

// event emmited when connected
ws.onopen = function () {
    console.log('websocket is connected ...');

    // sending a send event to websocket server
    ws.send('connected');
};

// display the workflow state sent over websocket
ws.onmessage = function (ev) {
    var data = JSON.parse(ev.data);
    var numworkflows = Number(data.num);
    var workflowState = data.state;
    var message = `${workflowState}`;
    console.log('got socket message');
    document.getElementById("workflow-status").innerHTML = `${message}`;
};
