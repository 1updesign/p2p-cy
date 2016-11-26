var express = require('express');
var app = express();
var http = require('http').Server(app);

app.use(express.static(__dirname + '/public'));
app.get('*', function(req, res) {
    res.sendFile(__dirname + '/public/app/views/cy-demo.html');
});

http.listen('8080', '127.0.0.1', function(err) {
    if(err) {
        console.log(err);
    } else {
        console.log("Web server listening at 127.0.0.1:8080");
    }
})
