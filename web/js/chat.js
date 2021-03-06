var chatInit = function(){
  $('#chatArea').mCustomScrollbar({
    //set_width: 400,
    set_height: 75,
    scrollButtons:{
      enable: false
    },
    contentTouchScroll: true
  });
  document.getElementById('chatArea').style['display'] = 'block';
    // $('#chatArea').mCustomScrollbar("scrollTo","bottom");
}

var chat_newMsg = function(){
  var msgBox = document.getElementById('msg')
  msgBox.style['display'] = 'block'
  msgBox.focus()
  messaging = true;
}

var chat_sendMsg = function(){
  var msgBox = document.getElementById('msg')
  var msg = msgBox.value
  if (msg.length > 0)
    socket.emit('chat', msg)
  msgBox.value = '';
  msgBox.style['display'] = 'none'
  messaging = false;
}

var chat_addMsg = function(username, message){
  $('.mCSB_container').append( "<div><b>" + username + ": </b>"+message+"</div>" );
  $('#chatArea').mCustomScrollbar("update");
  $('#chatArea').mCustomScrollbar("scrollTo", "bottom");
}

socket.on('newMsg', function (data){
  chat_addMsg(data.user, data.msg)
})