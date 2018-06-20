// code to run the workflow monitor via web socket
window.onload = function() {
    // Get references to elements on the page.
    var statusMessage = document.getElementById("workflow-status");

    // create websocket
    var ws = new WebSocket('ws://localhost:40510');

    // Handle any errors that occur.
    ws.onerror = function(error) {
      console.log('WebSocket Error: ' + error);
    };

    // event emmited when connected
    ws.onopen = function (event) {
        console.log('websocket is connected to: ' + event.currentTarget.url);

        // sending a send event to websocket server
        ws.send('connected');
    };

    // Show a disconnected message when the WebSocket is closed.
    ws.onclose = function(event) {
      console.log('socket disconnected')
    };

    // display the workflow state sent over websocket
    ws.onmessage = function (ev) {
        var data = JSON.parse(ev.data);
        var numworkflows = Number(data.num);
        var workflowState = data.state;
        var message = `${workflowState}`;
        console.log('got socket message: ' + ev.data);
        statusMessage.innerHTML = `${message}`;
    };
};
