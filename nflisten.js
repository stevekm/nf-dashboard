var express = require('express');

var app = express();

app.all('*', function (req, res, next) {

    var output = [
        req.baseUrl,
        req.body,
        req.cookies,
        req.hostname,
        req.ip,
        req.method,
        req.params,
        req.path,
        req.protocol,
        req.query,
        req.route,
        req.stale,
        req.secure,
        req.subdomains,
        req.headers,
    ];

    res.send(JSON.stringify(output, null, 2));

    console.log(output);
})

const port = 5000;
app.listen(port);
