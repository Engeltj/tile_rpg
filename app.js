var http = require("http"),
    url = require("url"),
    path = require("path"),
    fs = require("fs")
    port = process.argv[2] || 8888;
var request = require('request')

eval(fs.readFileSync('web/js/function.js')+'');
eval(fs.readFileSync('sql.js')+'');

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

function isClone(username){
  for (key in registered){
    if (registered[key].username.toLowerCase() == username.toLowerCase())
      return true
  }
  return false
}

var startTime = (new Date).getTime()/1000;
var registered = {};
var unregistered = {};

var io = require('socket.io').listen(app, { log: false });
io.sockets.on('connection', function (socket) {
    var token;

    function checkRegistered(){
      if (!registered[token])
        socket.disconnect()
    }
    

    socket.on('chat', function (message){
      checkRegistered()
      console.log(registered[token])
      if (message && message.length > 0){
        io.sockets.emit('newMsg', {user: registered[token].username, msg: message.substring(0, 150)})
      }
    });

    socket.on('setupToken', function (data){
      data = data || {} //protection
      if (unregistered[data]){
        registered[data] = unregistered[data];
        token = data;
        registered[data].startTime = startTime;
        socket.emit('tokenResponse',  registered[data])
        for (key in registered){
          socket.emit('get_positions', {token: registered[key].token, x: registered[key].x, y: registered[key].y, anim: registered[key].anim})
        }
      } else
        socket.emit('tokenResponse')
    });

    socket.on('login', function (data) {
      data = data || {} //protection
      console.log('Login attempted for "' + data.username +'"')
      if (isClone(data.username)){
        socket.emit('loginFailure', "Already logged in ..")
      } else {
        var success=false;
        loadClient(data, function(err, result){
          if (err == null){
            if (result){
              success=true
              token = socket.id;
              var PLAYER = {
                username: "",
                position: {}
              }
              unregistered[token] = PLAYER;
              unregistered[token].username = result.username;
              unregistered[token].position.x = result.x;
              unregistered[token].position.y = result.y;
              unregistered[token].position.stage = result.stage;
              socket.emit('assignToken', token)
            } else if (!success)
              socket.emit('loginFailure', "Incorrect username/password")
          } else
            socket.emit('loginFailure', "Database malfunction")
        });
      }
    });

    

    socket.on('position', function (data) {
      if (data && (registered[data.token] != null)){
        registered[data.token].position.x = data.x;
        registered[data.token].position.y = data.y;
        socket.broadcast.emit('get_positions', {token: data.token, x: data.x, y: data.y, anim: data.anim})//{token: data.token, x:clients[data.token].position.x,y:clients[data.token].position.y});
      } else {
        socket.emit('tokenResponse');
      }
    });

    socket.on('clock', function(){
      socket.emit();
    });

  	socket.on('disconnect', function () {
      if (registered[token] != null){
        console.log('disconnected: ' + token)
        saveClient(registered[token], null);
        io.sockets.emit('disconnect', token);
        delete registered[token];
      }
  	});

});

