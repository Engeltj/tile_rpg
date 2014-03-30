var http = require("http"),
    url = require("url"),
    path = require("path"),
    fs = require("fs")
    port = process.argv[2] || 8888;
var request = require('request')
var clients = {}
var PLAYER = {
  position: {}
}
var app = http.createServer(function(request, response) {
 
  var uri = url.parse(request.url).pathname
    , filename = path.join(process.cwd(), uri);
  
  path.exists(filename, function(exists) {
    if(!exists) {
      response.writeHead(404, {"Content-Type": "text/plain"});
      response.write("404 Not Found\n");
      response.end();
      return;
    }
 
    if (fs.statSync(filename).isDirectory()) filename += '/index.html';
 
    fs.readFile(filename, "binary", function(err, file) {
      if(err) {        
        response.writeHead(500, {"Content-Type": "text/plain"});
        response.write(err + "\n");
        response.end();
        return;
      }
 
      response.writeHead(200);
      response.write(file, "binary");
      response.end();
    });
  });
}).listen(parseInt(port, 10));

var rand = function() {
  return Math.random().toString(36).substr(2); // remove `0.`
};

var token = function() {
  return rand() + rand(); // to make it longer
};

var io = require('socket.io').listen(app);

io.sockets.on('connection', function (socket) {
    console.log("hit")
    var tok = token();
    clients[tok] = PLAYER;
    socket.emit('login',tok);
    socket.on('position', function (data) {
      if (!(clients[data.token] == null))
        clients[data.token].position = data.position;
    });

	socket.on('disconnect', function () {

	});
});

